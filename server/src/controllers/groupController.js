import { sendError, sendSuccess } from '../utils/responses.js'
import { normalizeOptionalText, isValidIsoDateTime, isValidUuid, ALLOWED_STATUS } from '../utils/validation.js'
import {
  createFriendRecord,
  createGroupTaskRecord,
  createProjectMemberRecord,
  createProjectRecord,
  deleteProjectRecord,
  findFriendProfileByEmail,
  findOwnedFriends,
  findOwnedProjectById,
  findOwnedProjectMemberById,
  findOwnedProjects,
  findOwnedGroupTaskById,
  updateGroupTaskRecord,
} from '../models/groupModel.js'

const LONG_IN_PROGRESS_DAYS = 7

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function getTaskRisk(task, now = new Date()) {
  if (task.status === 'Submitted') return null

  const dueDate = new Date(task.due_date)
  if (dueDate < now) {
    return 'overdue'
  }

  const updatedAt = new Date(task.updated_at || task.created_at)
  const staleCutoff = new Date(now.getTime() - LONG_IN_PROGRESS_DAYS * 24 * 60 * 60 * 1000)
  if (task.status === 'In Progress' && updatedAt < staleCutoff) {
    return 'stale_in_progress'
  }

  return null
}

function decorateProject(project) {
  const tasks = project.tasks || []
  const members = project.members || []
  const bottlenecks = tasks
    .map((task) => ({ ...task, risk: getTaskRisk(task) }))
    .filter((task) => task.risk)

  return {
    ...project,
    members,
    tasks,
    summary: {
      total_tasks: tasks.length,
      submitted: tasks.filter((task) => task.status === 'Submitted').length,
      in_progress: tasks.filter((task) => task.status === 'In Progress').length,
      overdue: bottlenecks.filter((task) => task.risk === 'overdue').length,
      bottlenecks: bottlenecks.length,
    },
    bottlenecks,
  }
}

export async function getFriendsGroupsOverview(req, res) {
  const [friendsResult, projectsResult] = await Promise.all([
    findOwnedFriends(req.user.id),
    findOwnedProjects(req.user.id),
  ])

  if (friendsResult.error || projectsResult.error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Could not load friends and groups')
  }

  return sendSuccess(
    res,
    {
      friends: friendsResult.data || [],
      projects: (projectsResult.data || []).map(decorateProject),
    },
    'Friends and groups loaded'
  )
}

export async function createFriend(req, res) {
  const email = normalizeEmail(req.body.email)

  if (!isValidEmail(email)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Friend email is required')
  }

  if (email === String(req.user.email || '').toLowerCase()) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'You cannot add yourself as a friend')
  }

  const { data: profile } = await findFriendProfileByEmail(email)
  const payload = {
    requester_id: req.user.id,
    friend_user_id: profile?.id || null,
    friend_email: email,
    friend_name: normalizeOptionalText(req.body.display_name) || profile?.display_name || null,
    status: profile?.id ? 'accepted' : 'pending',
  }

  const { data, error } = await createFriendRecord(payload)

  if (error) {
    if (error.code === '23505') {
      return sendError(res, 409, 'CONFLICT', 'Friend already exists')
    }
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Friend could not be added')
  }

  return sendSuccess(res, data, 'Friend added', 201)
}

export async function createProject(req, res) {
  const name = String(req.body.name || '').trim()

  if (!name || name.length > 140) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Project name is required')
  }

  const { data: project, error } = await createProjectRecord({
    owner_id: req.user.id,
    name,
    description: normalizeOptionalText(req.body.description),
  })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Project could not be created')
  }

  const { error: memberError } = await createProjectMemberRecord({
    project_id: project.id,
    user_id: req.user.id,
    email: req.user.email,
    display_name: req.user.user_metadata?.display_name || req.user.email,
    role: 'owner',
  })

  if (memberError) {
    await deleteProjectRecord(project.id)
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Project owner member could not be created')
  }

  return sendSuccess(res, project, 'Project created', 201)
}

export async function addProjectMember(req, res) {
  const { data: project, error: projectError } = await findOwnedProjectById(req.params.id, req.user.id)

  if (projectError || !project) {
    return sendError(res, 404, 'NOT_FOUND', 'Project was not found')
  }

  const email = normalizeEmail(req.body.email)

  if (!isValidEmail(email)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Member email is required')
  }

  const { data: profile } = await findFriendProfileByEmail(email)
  const { data, error } = await createProjectMemberRecord({
    project_id: project.id,
    user_id: profile?.id || null,
    email,
    display_name: normalizeOptionalText(req.body.display_name) || profile?.display_name || null,
    role: 'member',
  })

  if (error) {
    if (error.code === '23505') {
      return sendError(res, 409, 'CONFLICT', 'Member already exists in this project')
    }
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Member could not be added')
  }

  return sendSuccess(res, data, 'Member added', 201)
}

export async function createGroupTask(req, res) {
  const { data: project, error: projectError } = await findOwnedProjectById(req.params.id, req.user.id)

  if (projectError || !project) {
    return sendError(res, 404, 'NOT_FOUND', 'Project was not found')
  }

  const title = String(req.body.title || '').trim()

  if (!title || title.length > 160) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Task title is required')
  }

  if (!isValidIsoDateTime(req.body.due_date, { allowDateOnly: false })) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Due date must be a valid ISO 8601 datetime')
  }

  if (req.body.status !== undefined && !ALLOWED_STATUS.includes(req.body.status)) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Task status is invalid')
  }

  let assignedMemberId = null
  if (req.body.assigned_member_id) {
    if (!isValidUuid(req.body.assigned_member_id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'assigned_member_id must be a valid UUID')
    }

    const { data: member, error: memberError } = await findOwnedProjectMemberById(
      req.body.assigned_member_id,
      project.id
    )

    if (memberError || !member) {
      return sendError(res, 404, 'NOT_FOUND', 'Project member was not found')
    }

    assignedMemberId = member.id
  }

  const { data, error } = await createGroupTaskRecord({
    project_id: project.id,
    assigned_member_id: assignedMemberId,
    title,
    due_date: req.body.due_date,
    status: req.body.status || 'Not Started',
    progress_note: normalizeOptionalText(req.body.progress_note),
  })

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Task could not be created')
  }

  return sendSuccess(res, { ...data, risk: getTaskRisk(data) }, 'Task created', 201)
}

export async function updateGroupTask(req, res) {
  const updates = {}

  if (req.body.status !== undefined) {
    if (!ALLOWED_STATUS.includes(req.body.status)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Task status is invalid')
    }
    updates.status = req.body.status
  }

  if (req.body.progress_note !== undefined) {
    updates.progress_note = normalizeOptionalText(req.body.progress_note)
  }

  if (Object.keys(updates).length === 0) {
    return sendError(res, 400, 'VALIDATION_ERROR', 'At least one task field is required')
  }

  const { data: existingTask, error: existingError } = await findOwnedGroupTaskById(req.params.id, req.user.id)

  if (existingError || !existingTask) {
    return sendError(res, 404, 'NOT_FOUND', 'Task was not found')
  }

  const { data, error } = await updateGroupTaskRecord(req.params.id, updates)

  if (error) {
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Task could not be updated')
  }

  return sendSuccess(res, { ...data, risk: getTaskRisk(data) }, 'Task updated')
}

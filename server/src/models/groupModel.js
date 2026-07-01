import { getSupabaseAdmin } from '../config/supabase.js'

const FRIEND_FIELDS = 'id, requester_id, friend_user_id, friend_email, friend_name, status, created_at, updated_at'
const PROJECT_FIELDS = 'id, owner_id, name, description, created_at, updated_at'
const MEMBER_FIELDS = 'id, project_id, user_id, email, display_name, role, created_at, updated_at'
const TASK_FIELDS = 'id, project_id, assigned_member_id, title, due_date, status, progress_note, created_at, updated_at'

export function findFriendProfileByEmail(email) {
  return getSupabaseAdmin()
    .from('profiles')
    .select('id, email, display_name')
    .ilike('email', email)
    .maybeSingle()
}

export function findOwnedFriends(userId) {
  return getSupabaseAdmin()
    .from('friendships')
    .select(FRIEND_FIELDS)
    .eq('requester_id', userId)
    .order('created_at', { ascending: false })
}

export function createFriendRecord(payload) {
  return getSupabaseAdmin()
    .from('friendships')
    .insert(payload)
    .select(FRIEND_FIELDS)
    .single()
}

export function findOwnedProjects(userId) {
  return getSupabaseAdmin()
    .from('group_projects')
    .select(`
      ${PROJECT_FIELDS},
      members:group_project_members (
        ${MEMBER_FIELDS}
      ),
      tasks:group_tasks (
        ${TASK_FIELDS},
        assignee:group_project_members (
          id,
          email,
          display_name
        )
      )
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
}

export function createProjectRecord(payload) {
  return getSupabaseAdmin()
    .from('group_projects')
    .insert(payload)
    .select(PROJECT_FIELDS)
    .single()
}

export function createProjectMemberRecord(payload) {
  return getSupabaseAdmin()
    .from('group_project_members')
    .insert(payload)
    .select(MEMBER_FIELDS)
    .single()
}

export function findOwnedProjectById(projectId, userId) {
  return getSupabaseAdmin()
    .from('group_projects')
    .select(PROJECT_FIELDS)
    .eq('id', projectId)
    .eq('owner_id', userId)
    .single()
}

export function findOwnedProjectMemberById(memberId, projectId) {
  return getSupabaseAdmin()
    .from('group_project_members')
    .select(MEMBER_FIELDS)
    .eq('id', memberId)
    .eq('project_id', projectId)
    .single()
}

export function createGroupTaskRecord(payload) {
  return getSupabaseAdmin()
    .from('group_tasks')
    .insert(payload)
    .select(`
      ${TASK_FIELDS},
      assignee:group_project_members (
        id,
        email,
        display_name
      )
    `)
    .single()
}

export function findOwnedGroupTaskById(taskId, userId) {
  return getSupabaseAdmin()
    .from('group_tasks')
    .select(`
      ${TASK_FIELDS},
      project:group_projects!inner (
        id,
        owner_id
      )
    `)
    .eq('id', taskId)
    .eq('project.owner_id', userId)
    .single()
}

export function updateGroupTaskRecord(taskId, updates) {
  return getSupabaseAdmin()
    .from('group_tasks')
    .update(updates)
    .eq('id', taskId)
    .select(`
      ${TASK_FIELDS},
      assignee:group_project_members (
        id,
        email,
        display_name
      )
    `)
    .single()
}

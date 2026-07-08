import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import {
  addGroupProjectMember,
  createFriend,
  createGroupProject,
  createGroupTask,
  getFriendsGroupsOverview,
  updateGroupTask,
} from '../../services/groupService'
import { formatDateTime, statusLabel, toDateTimeLocal, toIsoDateTime } from '../../utils/deadlineUtils'

const statusOptions = ['Not Started', 'In Progress', 'Submitted']
const DEFAULT_TASK_DUE_OFFSET_MS = 24 * 60 * 60 * 1000

function getDefaultTaskDueDate() {
  const date = new Date(Date.now() + DEFAULT_TASK_DUE_OFFSET_MS)
  date.setMinutes(0, 0, 0)
  return toDateTimeLocal(date)
}

function riskLabel(risk) {
  if (risk === 'overdue') return 'Quá hạn'
  if (risk === 'stale_in_progress') return 'Đang làm quá lâu'
  return 'Ổn định'
}

function friendStatusLabel(status) {
  if (status === 'accepted') return 'Đã kết bạn'
  if (status === 'pending') return 'Đang chờ'
  return status || 'Chưa rõ'
}

export default function FriendsGroups() {
  const [friends, setFriends] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [error, setError] = useState('')
  const [friendForm, setFriendForm] = useState({ email: '', display_name: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [memberForm, setMemberForm] = useState({ email: '', display_name: '' })
  const [taskForm, setTaskForm] = useState({
    title: '',
    assigned_member_id: '',
    due_date: getDefaultTaskDueDate(),
    status: 'Not Started',
    progress_note: '',
  })

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await getFriendsGroupsOverview()
      const nextProjects = data?.projects || []
      setFriends(data?.friends || [])
      setProjects(nextProjects)
      setSelectedProjectId((current) => current || nextProjects[0]?.id || '')
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách bạn bè và nhóm')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOverview()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchOverview])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId]
  )

  const allBottlenecks = useMemo(
    () => projects.flatMap((project) => (
      (project.bottlenecks || []).map((task) => ({ ...task, project_name: project.name }))
    )),
    [projects]
  )

  const refreshAfter = async (action) => {
    try {
      await action()
      await fetchOverview()
    } catch (err) {
      setError(err?.message || 'Thao tác thất bại')
    } finally {
      setSaving('')
    }
  }

  const handleCreateFriend = (event) => {
    event.preventDefault()
    setSaving('friend')
    refreshAfter(async () => {
      await createFriend(friendForm)
      setFriendForm({ email: '', display_name: '' })
    })
  }

  const handleCreateProject = (event) => {
    event.preventDefault()
    setSaving('project')
    refreshAfter(async () => {
      const { data } = await createGroupProject(projectForm)
      setProjectForm({ name: '', description: '' })
      setSelectedProjectId(data?.id || '')
    })
  }

  const handleAddMember = (event) => {
    event.preventDefault()
    if (!selectedProject) return
    setSaving('member')
    refreshAfter(async () => {
      await addGroupProjectMember(selectedProject.id, memberForm)
      setMemberForm({ email: '', display_name: '' })
    })
  }

  const handleCreateTask = (event) => {
    event.preventDefault()
    if (!selectedProject) return
    setSaving('task')
    refreshAfter(async () => {
      await createGroupTask(selectedProject.id, {
        ...taskForm,
        due_date: toIsoDateTime(taskForm.due_date),
        assigned_member_id: taskForm.assigned_member_id || null,
      })
      setTaskForm({
        title: '',
        assigned_member_id: '',
        due_date: getDefaultTaskDueDate(),
        status: 'Not Started',
        progress_note: '',
      })
    })
  }

  const handleStatusChange = (taskId, status) => {
    refreshAfter(() => updateGroupTask(taskId, { status }))
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#6b5bd6]">Theo dõi nhóm</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Nhóm bạn</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Tạo dự án nhóm, thêm bạn bè và theo dõi tiến độ của từng thành viên.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchOverview} className="mt-2 font-semibold text-red-800 hover:underline">Thử lại</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">Đang tải...</div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">Bạn bè</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{friends.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">Dự án</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{projects.length}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white p-5">
              <p className="text-sm font-semibold text-red-500">Điểm nghẽn</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{allBottlenecks.length}</p>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <form onSubmit={handleCreateFriend} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Kết bạn</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input required type="email" value={friendForm.email} onChange={(event) => setFriendForm((current) => ({ ...current, email: event.target.value }))} className="rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="friend@example.com" />
                <input value={friendForm.display_name} onChange={(event) => setFriendForm((current) => ({ ...current, display_name: event.target.value }))} className="rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Tên hiển thị" />
              </div>
              <button disabled={saving === 'friend'} className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Thêm bạn</button>
              <div className="mt-4 space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="rounded-xl bg-[#fbfaff] px-3 py-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{friend.friend_name || friend.friend_email}</span>
                    <span className="ml-2 text-xs text-slate-400">{friendStatusLabel(friend.status)}</span>
                  </div>
                ))}
              </div>
            </form>

            <form onSubmit={handleCreateProject} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Tạo dự án nhóm</h2>
              <div className="mt-4 space-y-3">
                <input required value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Tên dự án" />
                <textarea value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} className="min-h-20 w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Mô tả ngắn" />
              </div>
              <button disabled={saving === 'project'} className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Tạo dự án</button>
            </form>
          </section>

          <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Dự án</h2>
              <div className="mt-4 space-y-2">
                {projects.map((project) => (
                  <button key={project.id} onClick={() => setSelectedProjectId(project.id)} className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${selectedProject?.id === project.id ? 'bg-[#f0ecf6] text-[#3b309e]' : 'bg-[#fbfaff] text-slate-600 hover:bg-[#f0ecf6]/70'}`}>
                    <span className="block font-semibold">{project.name}</span>
                    <span className="text-xs text-slate-400">{project.summary?.submitted || 0}/{project.summary?.total_tasks || 0} hoàn thành</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedProject ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{selectedProject.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{selectedProject.description || 'Chưa có mô tả'}</p>
                    </div>
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{selectedProject.summary?.bottlenecks || 0} điểm nghẽn</div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <form onSubmit={handleAddMember} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Thêm thành viên</h3>
                    <div className="mt-4 space-y-3">
                      <input required type="email" value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="member@example.com" />
                      <input value={memberForm.display_name} onChange={(event) => setMemberForm((current) => ({ ...current, display_name: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Tên thành viên" />
                    </div>
                    <button className="mt-4 rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6]">Thêm vào dự án</button>
                  </form>

                  <form onSubmit={handleCreateTask} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Giao nhiệm vụ nhóm</h3>
                    <div className="mt-4 space-y-3">
                      <input required value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Tên nhiệm vụ" />
                      <select value={taskForm.assigned_member_id} onChange={(event) => setTaskForm((current) => ({ ...current, assigned_member_id: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]">
                        <option value="">Chưa gán ai</option>
                        {(selectedProject.members || []).map((member) => (
                          <option key={member.id} value={member.id}>{member.display_name || member.email}</option>
                        ))}
                      </select>
                      <input required type="datetime-local" value={taskForm.due_date} onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" />
                      <select value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]">
                        {statusOptions.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                      </select>
                      <textarea value={taskForm.progress_note} onChange={(event) => setTaskForm((current) => ({ ...current, progress_note: event.target.value }))} className="min-h-20 w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Cập nhật tiến độ" />
                    </div>
                    <button className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white">Tạo nhiệm vụ</button>
                  </form>
                </div>

                <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                  <h3 className="font-semibold text-slate-950">Tiến độ thành viên</h3>
                  <div className="mt-4 space-y-3">
                    {(selectedProject.tasks || []).map((task) => (
                      <div key={task.id} className="rounded-xl border border-[#eee8ff] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">{task.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{task.assignee?.display_name || task.assignee?.email || 'Chưa gán ai'} - hạn {formatDateTime(task.due_date)}</p>
                            {task.progress_note && <p className="mt-2 text-sm text-slate-500">{task.progress_note}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.risk ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{riskLabel(task.risk)}</span>
                            <select value={task.status} onChange={(event) => handleStatusChange(task.id, event.target.value)} className="rounded-lg border border-[#e5def8] px-2 py-1.5 text-sm outline-none focus:border-[#6b5bd6]">
                              {statusOptions.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(selectedProject.tasks || []).length === 0 && <p className="rounded-xl bg-[#fbfaff] p-4 text-sm text-slate-500">Chưa có nhiệm vụ nhóm nào.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-500">Tạo dự án nhóm đầu tiên để bắt đầu theo dõi.</div>
            )}
          </section>
        </div>
      )}
    </Layout>
  )
}

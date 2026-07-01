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

const statusOptions = ['Not Started', 'In Progress', 'Submitted']

function toLocalInputValue(date = new Date()) {
  const value = new Date(date)
  value.setHours(value.getHours() + 24)
  value.setMinutes(0, 0, 0)
  return value.toISOString().slice(0, 16)
}

function toIsoValue(value) {
  if (!value) return ''
  return new Date(value).toISOString()
}

function riskLabel(risk) {
  if (risk === 'overdue') return 'Overdue'
  if (risk === 'stale_in_progress') return 'In Progress qua lau'
  return 'On track'
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
    due_date: toLocalInputValue(),
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
      setError(err?.message || 'Could not load friends and groups')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
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
      setError(err?.message || 'Action failed')
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
        due_date: toIsoValue(taskForm.due_date),
        assigned_member_id: taskForm.assigned_member_id || null,
      })
      setTaskForm({
        title: '',
        assigned_member_id: '',
        due_date: toLocalInputValue(),
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
          <p className="text-sm font-semibold text-[#6b5bd6]">Team tracking</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Friends & Groups</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Tao project nhom, them ban be va theo doi ai dang lam den dau, ai dang bi nghen.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button onClick={fetchOverview} className="mt-2 font-semibold text-red-800 hover:underline">Thu lai</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-400">Dang tai...</div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">Friends</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{friends.length}</p>
            </div>
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <p className="text-sm font-semibold text-slate-500">Projects</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{projects.length}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-white p-5">
              <p className="text-sm font-semibold text-red-500">Bottlenecks</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{allBottlenecks.length}</p>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <form onSubmit={handleCreateFriend} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Ket ban</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input required type="email" value={friendForm.email} onChange={(event) => setFriendForm((current) => ({ ...current, email: event.target.value }))} className="rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="friend@example.com" />
                <input value={friendForm.display_name} onChange={(event) => setFriendForm((current) => ({ ...current, display_name: event.target.value }))} className="rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Ten hien thi" />
              </div>
              <button disabled={saving === 'friend'} className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Them ban</button>
              <div className="mt-4 space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="rounded-xl bg-[#fbfaff] px-3 py-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{friend.friend_name || friend.friend_email}</span>
                    <span className="ml-2 text-xs text-slate-400">{friend.status}</span>
                  </div>
                ))}
              </div>
            </form>

            <form onSubmit={handleCreateProject} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Tao project nhom</h2>
              <div className="mt-4 space-y-3">
                <input required value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Ten project" />
                <textarea value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} className="min-h-20 w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Mo ta ngan" />
              </div>
              <button disabled={saving === 'project'} className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Tao project</button>
            </form>
          </section>

          <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-950">Projects</h2>
              <div className="mt-4 space-y-2">
                {projects.map((project) => (
                  <button key={project.id} onClick={() => setSelectedProjectId(project.id)} className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${selectedProject?.id === project.id ? 'bg-[#f0ecf6] text-[#3b309e]' : 'bg-[#fbfaff] text-slate-600 hover:bg-[#f0ecf6]/70'}`}>
                    <span className="block font-semibold">{project.name}</span>
                    <span className="text-xs text-slate-400">{project.summary?.submitted || 0}/{project.summary?.total_tasks || 0} done</span>
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
                      <p className="mt-1 text-sm text-slate-500">{selectedProject.description || 'Chua co mo ta'}</p>
                    </div>
                    <div className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{selectedProject.summary?.bottlenecks || 0} bottlenecks</div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <form onSubmit={handleAddMember} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Them thanh vien</h3>
                    <div className="mt-4 space-y-3">
                      <input required type="email" value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="member@example.com" />
                      <input value={memberForm.display_name} onChange={(event) => setMemberForm((current) => ({ ...current, display_name: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Ten thanh vien" />
                    </div>
                    <button className="mt-4 rounded-lg bg-[#f0ebff] px-4 py-2 text-sm font-semibold text-[#5140b6]">Them vao project</button>
                  </form>

                  <form onSubmit={handleCreateTask} className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                    <h3 className="font-semibold text-slate-950">Giao task nhom</h3>
                    <div className="mt-4 space-y-3">
                      <input required value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Ten task" />
                      <select value={taskForm.assigned_member_id} onChange={(event) => setTaskForm((current) => ({ ...current, assigned_member_id: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]">
                        <option value="">Chua gan ai</option>
                        {(selectedProject.members || []).map((member) => (
                          <option key={member.id} value={member.id}>{member.display_name || member.email}</option>
                        ))}
                      </select>
                      <input required type="datetime-local" value={taskForm.due_date} onChange={(event) => setTaskForm((current) => ({ ...current, due_date: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" />
                      <select value={taskForm.status} onChange={(event) => setTaskForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]">
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                      <textarea value={taskForm.progress_note} onChange={(event) => setTaskForm((current) => ({ ...current, progress_note: event.target.value }))} className="min-h-20 w-full rounded-lg border border-[#e5def8] px-3 py-2 text-sm outline-none focus:border-[#6b5bd6]" placeholder="Cap nhat tien do" />
                    </div>
                    <button className="mt-4 rounded-lg bg-[#5b45d8] px-4 py-2 text-sm font-semibold text-white">Tao task</button>
                  </form>
                </div>

                <div className="rounded-2xl border border-[#e9e2fb] bg-white p-5">
                  <h3 className="font-semibold text-slate-950">Ai dang lam den dau</h3>
                  <div className="mt-4 space-y-3">
                    {(selectedProject.tasks || []).map((task) => (
                      <div key={task.id} className="rounded-xl border border-[#eee8ff] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">{task.title}</p>
                            <p className="mt-1 text-sm text-slate-500">{task.assignee?.display_name || task.assignee?.email || 'Chua gan ai'} - due {new Date(task.due_date).toLocaleString()}</p>
                            {task.progress_note && <p className="mt-2 text-sm text-slate-500">{task.progress_note}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.risk ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{riskLabel(task.risk)}</span>
                            <select value={task.status} onChange={(event) => handleStatusChange(task.id, event.target.value)} className="rounded-lg border border-[#e5def8] px-2 py-1.5 text-sm outline-none focus:border-[#6b5bd6]">
                              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(selectedProject.tasks || []).length === 0 && <p className="rounded-xl bg-[#fbfaff] p-4 text-sm text-slate-500">Chua co task nhom nao.</p>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e9e2fb] bg-white p-8 text-center text-slate-500">Tao project nhom dau tien de bat dau theo doi.</div>
            )}
          </section>
        </div>
      )}
    </Layout>
  )
}

const STORAGE_KEY = 'unideadline_demo_data'

function makeId(prefix) {
  if (crypto.randomUUID) return crypto.randomUUID()
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function addDays(days, hour = 23, minute = 59) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function seedData() {
  const courses = [
    {
      id: makeId('course'),
      course_name: 'Software Project Management',
      course_code: 'BIT304V1',
      semester: 'SUM2026',
    },
    {
      id: makeId('course'),
      course_name: 'Web Application Development',
      course_code: 'WEB301',
      semester: 'SUM2026',
    },
    {
      id: makeId('course'),
      course_name: 'Database Systems',
      course_code: 'DBI202',
      semester: 'SUM2026',
    },
  ]

  const deadlines = [
    {
      id: makeId('deadline'),
      course_id: courses[0].id,
      title: 'Submit project report',
      due_date: addDays(2),
      status: 'In Progress',
      priority: 'High',
      description: 'Prepare the MVP report and screenshots for review.',
      submission_link: 'https://example.com/submit-project',
    },
    {
      id: makeId('deadline'),
      course_id: courses[0].id,
      title: 'Demo checklist',
      due_date: addDays(4, 17, 0),
      status: 'Not Started',
      priority: 'Medium',
      description: 'Run login, dashboard, course, deadline, and responsive checks.',
      submission_link: '',
    },
    {
      id: makeId('deadline'),
      course_id: courses[1].id,
      title: 'React UI exercise',
      due_date: addDays(-1),
      status: 'Not Started',
      priority: 'High',
      description: 'Finish component states and validation.',
      submission_link: 'https://example.com/react-ui',
    },
    {
      id: makeId('deadline'),
      course_id: courses[2].id,
      title: 'ERD revision',
      due_date: addDays(7),
      status: 'Submitted',
      priority: 'Low',
      description: 'Upload revised ERD notes.',
      submission_link: 'https://example.com/erd',
    },
  ]

  return { courses, deadlines }
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const data = seedData()
    saveData(data)
    return data
  }

  try {
    return JSON.parse(raw)
  } catch {
    const data = seedData()
    saveData(data)
    return data
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function withCourse(deadline, courses) {
  const course = courses.find((item) => item.id === deadline.course_id)

  return {
    ...deadline,
    course: course
      ? {
        id: course.id,
        course_name: course.course_name,
        course_code: course.course_code,
      }
      : null,
  }
}

function effectiveStatus(deadline) {
  if (deadline.status === 'Submitted') return 'Submitted'
  return new Date(deadline.due_date) < new Date() ? 'Overdue' : deadline.status
}

function filterDeadlines(deadlines, courses, params) {
  return deadlines
    .map((deadline) => withCourse(deadline, courses))
    .filter((deadline) => {
      const q = params.get('q')?.toLowerCase()
      const status = params.get('status')
      const priority = params.get('priority')
      const courseId = params.get('course_id')

      if (q && !`${deadline.title} ${deadline.description}`.toLowerCase().includes(q)) return false
      if (status && effectiveStatus(deadline) !== status) return false
      if (priority && deadline.priority !== priority) return false
      if (courseId && deadline.course_id !== courseId) return false
      return true
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
}

function getWeeklyDashboard(data, params) {
  const weekStartParam = params.get('week_start')
  const start = weekStartParam ? new Date(`${weekStartParam}T00:00:00`) : new Date()
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  const deadlines = data.deadlines
    .filter((deadline) => {
      const dueDate = new Date(deadline.due_date)
      return dueDate >= start && dueDate <= end
    })
    .map((deadline) => withCourse(deadline, data.courses))

  return {
    week_start: start.toISOString().slice(0, 10),
    week_end: end.toISOString().slice(0, 10),
    summary: {
      total: deadlines.length,
      not_started: deadlines.filter((item) => effectiveStatus(item) === 'Not Started').length,
      in_progress: deadlines.filter((item) => effectiveStatus(item) === 'In Progress').length,
      submitted: deadlines.filter((item) => effectiveStatus(item) === 'Submitted').length,
      overdue: deadlines.filter((item) => effectiveStatus(item) === 'Overdue').length,
      high_priority: deadlines.filter((item) => item.priority === 'High').length,
    },
    deadlines,
  }
}

function parsePath(path) {
  const url = new URL(path, 'http://local.test')
  return {
    pathname: url.pathname,
    params: url.searchParams,
  }
}

export function demoRequest(path, options = {}) {
  const method = options.method || 'GET'
  const { pathname, params } = parsePath(path)
  const data = loadData()

  if (pathname === '/courses' && method === 'GET') {
    return data.courses
  }

  if (pathname === '/courses' && method === 'POST') {
    const body = JSON.parse(options.body || '{}')
    const course = {
      id: makeId('course'),
      course_name: body.course_name,
      course_code: body.course_code || '',
      semester: body.semester || '',
    }
    data.courses.unshift(course)
    saveData(data)
    return course
  }

  const courseMatch = pathname.match(/^\/courses\/([^/]+)$/)
  if (courseMatch && method === 'PATCH') {
    const body = JSON.parse(options.body || '{}')
    const course = data.courses.find((item) => item.id === courseMatch[1])
    if (!course) throw new Error('Course not found')
    Object.assign(course, body)
    saveData(data)
    return course
  }

  if (courseMatch && method === 'DELETE') {
    if (data.deadlines.some((deadline) => deadline.course_id === courseMatch[1])) {
      throw new Error('Course has deadlines')
    }
    data.courses = data.courses.filter((item) => item.id !== courseMatch[1])
    saveData(data)
    return { id: courseMatch[1] }
  }

  if (pathname === '/deadlines' && method === 'GET') {
    return filterDeadlines(data.deadlines, data.courses, params)
  }

  if (pathname === '/deadlines' && method === 'POST') {
    const body = JSON.parse(options.body || '{}')
    const deadline = {
      id: makeId('deadline'),
      course_id: body.course_id,
      title: body.title,
      due_date: body.due_date,
      status: body.status || 'Not Started',
      priority: body.priority || 'Medium',
      description: body.description || '',
      submission_link: body.submission_link || '',
    }
    data.deadlines.unshift(deadline)
    saveData(data)
    return withCourse(deadline, data.courses)
  }

  const deadlineMatch = pathname.match(/^\/deadlines\/([^/]+)$/)
  if (deadlineMatch && method === 'GET') {
    const deadline = data.deadlines.find((item) => item.id === deadlineMatch[1])
    if (!deadline) throw new Error('Deadline not found')
    return withCourse(deadline, data.courses)
  }

  if (deadlineMatch && method === 'PATCH') {
    const body = JSON.parse(options.body || '{}')
    const deadline = data.deadlines.find((item) => item.id === deadlineMatch[1])
    if (!deadline) throw new Error('Deadline not found')
    Object.assign(deadline, body)
    saveData(data)
    return withCourse(deadline, data.courses)
  }

  if (deadlineMatch && method === 'DELETE') {
    data.deadlines = data.deadlines.filter((item) => item.id !== deadlineMatch[1])
    saveData(data)
    return { id: deadlineMatch[1] }
  }

  if (pathname === '/dashboard/weekly' && method === 'GET') {
    return getWeeklyDashboard(data, params)
  }

  throw new Error('Demo fallback does not support this endpoint')
}

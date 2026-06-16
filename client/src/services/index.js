export {
  ApiError,
  apiRequest,
  buildQueryString,
  configureApiClient,
  getApiBaseUrl,
} from './apiClient'
export { getCurrentProfile } from './authService'
export {
  createCourse,
  deleteCourse,
  listCourses,
  updateCourse,
} from './courseService'
export {
  createDeadline,
  deleteDeadline,
  getDeadline,
  listDeadlines,
  updateDeadline,
  updateDeadlineReminder,
} from './deadlineService'
export { getWeeklyDashboard } from './dashboardService'
export { getHealth } from './healthService'
export { listReminders } from './reminderService'
export {
  clearStoredSession,
  getStoredAccessToken,
  getStoredSession,
  hasSupabaseAuthConfig,
  signInWithPassword,
  signOut,
} from './supabaseAuthService'

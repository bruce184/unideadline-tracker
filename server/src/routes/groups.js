import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  addProjectMember,
  createFriend,
  createGroupTask,
  createProject,
  getFriendsGroupsOverview,
  updateGroupTask,
} from '../controllers/groupController.js'

const router = express.Router()

router.get('/overview', requireAuth, getFriendsGroupsOverview)
router.post('/friends', requireAuth, createFriend)
router.post('/projects', requireAuth, createProject)
router.post('/projects/:id/members', requireAuth, addProjectMember)
router.post('/projects/:id/tasks', requireAuth, createGroupTask)
router.patch('/tasks/:id', requireAuth, updateGroupTask)

export default router

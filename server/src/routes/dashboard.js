import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getWeeklyDashboard } from '../controllers/dashboardController.js'

const router = express.Router()

router.get('/weekly', requireAuth, getWeeklyDashboard)

export default router

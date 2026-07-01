import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listDeadlines,
  createDeadline,
  getDeadline,
  updateDeadline,
  deleteDeadline,
} from '../controllers/deadlineController.js'

const router = express.Router()

router.get('/', requireAuth, listDeadlines)
router.post('/', requireAuth, createDeadline)
router.get('/:id', requireAuth, getDeadline)
router.patch('/:id', requireAuth, updateDeadline)
router.delete('/:id', requireAuth, deleteDeadline)

export default router

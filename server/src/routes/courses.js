import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js'

const router = express.Router()

router.get('/', requireAuth, listCourses)
router.post('/', requireAuth, createCourse)
router.patch('/:id', requireAuth, updateCourse)
router.delete('/:id', requireAuth, deleteCourse)

export default router

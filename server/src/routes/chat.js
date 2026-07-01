import express from 'express'
import { handleChatAI } from '../controllers/chatController.js'

const router = express.Router()
router.post('/', handleChatAI)
export default router
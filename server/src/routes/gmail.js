import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  startGmailAuth,
  gmailCallback,
  getGmailStatus,
  importFromGmail,
  disconnectGmail,
} from '../controllers/gmailController.js'

const router = express.Router()

// auth + callback không dùng requireAuth vì là full-page redirect từ Google
router.get('/auth', startGmailAuth)
router.get('/callback', gmailCallback)

router.get('/status', requireAuth, getGmailStatus)
router.post('/import', requireAuth, importFromGmail)
router.post('/disconnect', requireAuth, disconnectGmail)

export default router
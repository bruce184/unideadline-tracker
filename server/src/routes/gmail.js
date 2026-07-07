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

router.post('/auth-url', requireAuth, startGmailAuth)
router.get('/callback', gmailCallback)

router.get('/status', requireAuth, getGmailStatus)
router.post('/import', requireAuth, importFromGmail)
router.post('/disconnect', requireAuth, disconnectGmail)

export default router

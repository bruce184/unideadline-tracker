import { GoogleGenAI } from '@google/genai'
import { getSupabase, getSupabaseAdmin } from '../config/supabase.js'
import { sendError, sendSuccess } from '../utils/responses.js'
import { signState, verifyState } from '../utils/gmailOAuthState.js'
import {
  findGmailConnection,
  upsertGmailConnection,
  deleteGmailConnection,
  findDeadlineByGmailMessageId,
  insertDeadlineFromGmail,
} from '../models/gmailModel.js'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function getValidAccessToken(userId) {
  const { data: conn } = await findGmailConnection(userId)
  if (!conn) return null

  const expiresAt = new Date(conn.token_expires_at).getTime()
  if (expiresAt - Date.now() > 60 * 1000) return conn.access_token

  // Refresh
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: conn.refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  const payload = await res.json()

  if (!res.ok) {
    await deleteGmailConnection(userId)
    return null
  }

  await upsertGmailConnection(userId, {
    access_token: payload.access_token,
    refresh_token: conn.refresh_token,
    token_expires_at: new Date(Date.now() + payload.expires_in * 1000).toISOString(),
    connected_at: conn.connected_at,
  })

  return payload.access_token
}

function extractEmailBody(payload) {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64url').toString('utf-8')
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64url').toString('utf-8')
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64url').toString('utf-8')
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    }
  }

  return ''
}

async function parseDeadlineWithGemini(subject, body) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `Bạn là AI chuyên phân tích email để tìm thông tin deadline/hạn nộp bài tập.

Đọc email sau và trả về JSON:
- Nếu email CÓ chứa thông tin deadline/hạn nộp/due date/assignment:
  {"found": true, "title": "tên bài tập hoặc sự kiện", "due_date": "ISO 8601 datetime (ví dụ: 2026-07-10T23:59:00)", "description": "mô tả ngắn nếu có"}
- Nếu email KHÔNG chứa thông tin deadline:
  {"found": false}

Lưu ý:
- Nếu email chỉ thông báo chấm điểm, không có deadline sắp tới → {"found": false}
- due_date phải là datetime hợp lệ, nếu chỉ có ngày thì thêm T23:59:00
- Năm hiện tại là ${new Date().getFullYear()}
- Chỉ trả về JSON thuần, không markdown, không giải thích

Subject: ${subject}
Body: ${body.slice(0, 2000)}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.1 },
    })

    const text = response.text.replace(/```json|```/g, '').trim()
    return JSON.parse(text)
  } catch {
    return { found: false }
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/gmail/auth?access_token=...
 * Full-page redirect → không có Authorization header → access_token qua query param
 */
export async function startGmailAuth(req, res) {
  const accessToken = req.query.access_token

  if (!accessToken) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Missing access token')
  }

  const { data, error } = await getSupabase().auth.getUser(accessToken)

  if (error || !data?.user) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid access token')
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state: signState(data.user.id),
  })

  return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
}

/**
 * GET /api/v1/gmail/callback
 */
export async function gmailCallback(req, res) {
  const { code, state, error: googleError } = req.query

  if (googleError) {
    return res.redirect(`${CLIENT_ORIGIN}/integrations?gmail=error`)
  }

  const userId = verifyState(state)

  if (!userId || !code) {
    return res.redirect(`${CLIENT_ORIGIN}/integrations?gmail=error`)
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenPayload = await tokenRes.json()

    if (!tokenRes.ok || !tokenPayload.refresh_token) {
      throw new Error(tokenPayload.error_description || 'Token exchange failed')
    }

    const { data: savedConn, error: saveError } = await upsertGmailConnection(userId, {
      access_token: tokenPayload.access_token,
      refresh_token: tokenPayload.refresh_token,
      token_expires_at: new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString(),
      connected_at: new Date().toISOString(),
    })

    console.log('[Gmail callback] upsert result:', savedConn, 'error:', saveError)

    if (saveError) {
      console.error('[Gmail callback] Failed to save connection:', saveError)
      return res.redirect(`${CLIENT_ORIGIN}/integrations?gmail=error`)
    }

    return res.redirect(`${CLIENT_ORIGIN}/integrations?gmail=connected`)
  } catch (err) {
    console.error('Gmail OAuth callback error:', err)
    return res.redirect(`${CLIENT_ORIGIN}/integrations?gmail=error`)
  }
}

/**
 * GET /api/v1/gmail/status
 */
export async function getGmailStatus(req, res) {
  const { data } = await findGmailConnection(req.user.id)
  return sendSuccess(res, {
    connected: Boolean(data),
    connectedAt: data?.connected_at || null,
  })
}

/**
 * POST /api/v1/gmail/disconnect
 */
export async function disconnectGmail(req, res) {
  await deleteGmailConnection(req.user.id)
  return sendSuccess(res, {}, 'Đã ngắt kết nối Gmail')
}

async function getFirstCourseId(userId) {
  const { data } = await getSupabaseAdmin()
    .from('courses')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()
  return data?.id || null
}

/**
 * POST /api/v1/gmail/import
 * body: { days: 7 | 30 }
 */
export async function importFromGmail(req, res) {
  const userId = req.user.id
  const days = parseInt(req.body.days) === 30 ? 30 : 7

  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) {
    return sendError(res, 401, 'GMAIL_NOT_CONNECTED', 'Chưa kết nối Gmail')
  }

  // Timestamp để filter email (Gmail dùng Unix timestamp tính bằng giây)
  const afterTimestamp = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)

  // 1. Lấy danh sách message IDs
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=after:${afterTimestamp}&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const listPayload = await listRes.json()

  if (!listRes.ok) {
    return sendError(res, 502, 'GMAIL_API_ERROR', listPayload.error?.message || 'Lỗi Gmail API')
  }

  const messages = listPayload.messages || []

  if (messages.length === 0) {
    return sendSuccess(res, { imported: 0, skipped: 0, total: 0 }, 'Không có email mới')
  }

  let imported = 0
  let skipped = 0

  // Lấy course_id đầu tiên của user (course_id NOT NULL trong schema)
  const defaultCourseId = await getFirstCourseId(userId)

  for (const { id: messageId } of messages) {
    try {
      // 2. Kiểm tra dedupe trước khi gọi API lấy nội dung
      const { data: existing } = await findDeadlineByGmailMessageId(userId, messageId)
      if (existing) {
        skipped += 1
        continue
      }

      // 3. Lấy nội dung email
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (!msgRes.ok) {
        skipped += 1
        continue
      }

      const msg = await msgRes.json()

      const headers = msg.payload?.headers || []
      const subject = headers.find(h => h.name === 'Subject')?.value || '(Không có tiêu đề)'
      const body = extractEmailBody(msg.payload || {})

      // 4. Gemini parse
      const parsed = await parseDeadlineWithGemini(subject, body)

      if (!parsed.found) {
        skipped += 1
        continue
      }

      // 5. Validate due_date
      const dueDate = new Date(parsed.due_date)
      if (isNaN(dueDate.getTime())) {
        skipped += 1
        continue
      }

      // 6. Insert deadline
      const { error: insertError } = await insertDeadlineFromGmail({
        user_id: userId,
        title: parsed.title || subject,
        due_date: dueDate.toISOString(),
        description: parsed.description || null,
        gmail_message_id: messageId,
        course_id: defaultCourseId,
        status: 'Not Started',
        priority: 'Medium',
      })

      if (insertError) {
        console.error(`Insert deadline failed:`, insertError.message)
        skipped += 1
        continue
      }

      imported += 1
    } catch (err) {
      console.error(`Import email ${messageId} failed:`, err.message)
      skipped += 1
    }
  }

  return sendSuccess(
    res,
    { imported, skipped, total: messages.length },
    'Import hoàn tất'
  )
}
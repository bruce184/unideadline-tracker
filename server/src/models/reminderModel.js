import { getSupabaseAdmin } from '../config/supabase.js'

/**
 * BUG-02 fix: The old code used `.eq('deadline.user_id', userId)` which is an
 * embedded filter on a related table. When using the service-role key (which
 * bypasses RLS), this filter is NOT guaranteed to work — it can silently return
 * reminders belonging to other users.
 *
 * Fix: First collect deadline_ids that belong to the user, then filter reminders
 * by those ids. This makes ownership check explicit and safe.
 */
export async function findOwnedReminders({ userId, filters, from, to }) {
  // Step 1: get deadline IDs owned by this user
  const { data: deadlines, error: deadlineError } = await getSupabaseAdmin()
    .from('deadlines')
    .select('id')
    .eq('user_id', userId)

  if (deadlineError) {
    return { data: null, error: deadlineError, count: 0 }
  }

  const deadlineIds = (deadlines || []).map((d) => d.id)

  if (deadlineIds.length === 0) {
    return { data: [], error: null, count: 0 }
  }

  // Step 2: query reminders restricted to those deadline IDs
  let query = getSupabaseAdmin()
    .from('reminders')
    .select(`
      id,
      deadline_id,
      reminder_time,
      offset_days,
      channel,
      sent_status,
      created_at,
      deadline:deadlines!inner (
        id,
        title,
        due_date
      )
    `, { count: 'exact' })
    .in('deadline_id', deadlineIds)

  if (filters.sent_status) {
    query = query.eq('sent_status', filters.sent_status)
  }

  if (filters.from) {
    query = query.gte('reminder_time', filters.from)
  }

  if (filters.to) {
    query = query.lte('reminder_time', filters.to)
  }

  return query
    .order('reminder_time', { ascending: true })
    .range(from, to)
}

export function deletePendingReminders(deadlineId, channel) {
  let query = getSupabaseAdmin()
    .from('reminders')
    .delete()
    .eq('deadline_id', deadlineId)
    .eq('sent_status', 'pending')

  if (channel) {
    query = query.eq('channel', channel)
  }

  return query
}

export function upsertReminderRows(rows) {
  return getSupabaseAdmin()
    .from('reminders')
    .upsert(rows, {
      onConflict: 'deadline_id,offset_days,channel',
    })
    .select('id, deadline_id, reminder_time, offset_days, channel, sent_status, created_at')
}

/**
 * Lấy các reminder đã tới giờ gửi, còn ở trạng thái 'pending', theo channel chỉ định.
 *
 * MAJ-04 fix: The old code used `.neq('deadline.status', 'Submitted')` which is an
 * embedded filter on a related table — unreliable with the service-role key.
 * Fix: Fetch all pending due reminders, then filter out Submitted ones in JS.
 * The result set is small (due reminders in a 10-min window), so this is safe.
 */
export async function findDueReminders(channel, nowIso) {
  const { data, error } = await getSupabaseAdmin()
    .from('reminders')
    .select(`
      id,
      deadline_id,
      reminder_time,
      offset_days,
      channel,
      sent_status,
      deadline:deadlines!inner (
        id,
        title,
        due_date,
        status,
        user_id
      )
    `)
    .eq('channel', channel)
    .eq('sent_status', 'pending')
    .lte('reminder_time', nowIso)

  if (error) {
    return { data: null, error }
  }

  // Filter out reminders for already-Submitted deadlines in application layer
  const filtered = (data || []).filter(
    (r) => r.deadline?.status !== 'Submitted'
  )

  return { data: filtered, error: null }
}

export function markReminderStatus(reminderId, sentStatus) {
  return getSupabaseAdmin()
    .from('reminders')
    .update({ sent_status: sentStatus })
    .eq('id', reminderId)
}
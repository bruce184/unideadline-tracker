import { getSupabaseAdmin } from '../config/supabase.js'

export function findOwnedReminders({ userId, filters, from, to }) {
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
    .eq('deadline.user_id', userId)

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

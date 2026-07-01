const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|([+-])(\d{2}):(\d{2}))$/

export function parsePagination(query) {
  const page = parseInteger(query.page, 1)
  const limit = parseInteger(query.limit, 20)

  if (!page || page < 1) {
    return { error: 'page must be an integer greater than or equal to 1' }
  }

  if (!limit || limit < 1 || limit > 100) {
    return { error: 'limit must be an integer between 1 and 100' }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  return { page, limit, from, to }
}

export function buildPaginationMeta(page, limit, total = 0) {
  return {
    page,
    limit,
    total,
    total_pages: total === 0 ? 0 : Math.ceil(total / limit),
  }
}

export function parseSortOrder(value, defaultValue = 'asc') {
  if (value === undefined) {
    return defaultValue
  }

  const sortOrder = String(value).toLowerCase()

  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    return null
  }

  return sortOrder
}

export function isValidIsoDateTime(value, { allowDateOnly = true } = {}) {
  if (value === undefined) {
    return true
  }

  if (typeof value !== 'string') {
    return false
  }

  const dateMatch = value.match(ISO_DATE_PATTERN)

  if (allowDateOnly && dateMatch) {
    return isValidCalendarDate(dateMatch[1], dateMatch[2], dateMatch[3])
  }

  const dateTimeMatch = value.match(ISO_DATE_TIME_PATTERN)

  if (!dateTimeMatch) {
    return false
  }

  const [, year, month, day, hour, minute, second = '0', , zone, , offsetHour, offsetMinute] = dateTimeMatch

  if (!isValidCalendarDate(year, month, day)) {
    return false
  }

  if (Number(hour) > 23 || Number(minute) > 59 || Number(second) > 59) {
    return false
  }

  if (zone !== 'Z') {
    const offsetHours = Number(offsetHour)
    const offsetMinutes = Number(offsetMinute)

    if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours === 14 && offsetMinutes !== 0)) {
      return false
    }
  }

  return !Number.isNaN(Date.parse(value))
}

export function sanitizeSearchTerm(value) {
  const trimmed = String(value || '').trim()

  if (!trimmed) {
    return ''
  }

  return trimmed
    .replace(/[%(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
}

function parseInteger(value, defaultValue) {
  if (value === undefined) {
    return defaultValue
  }

  const text = String(value).trim()

  if (!/^\d+$/.test(text)) {
    return null
  }

  return Number(text)
}

function isValidCalendarDate(yearValue, monthValue, dayValue) {
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)

  if (year < 1 || month < 1 || month > 12 || day < 1) {
    return false
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]

  return day <= daysInMonth[month - 1]
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

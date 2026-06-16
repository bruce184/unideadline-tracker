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

export function isValidIsoDateTime(value) {
  return value === undefined || !Number.isNaN(Date.parse(String(value)))
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

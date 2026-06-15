export function sendSuccess(res, data = {}, message = 'Success', status = 200) {
  return res.status(status).json({
    ok: true,
    data,
    message,
  })
}

export function sendError(
  res,
  status = 500,
  code = 'INTERNAL_SERVER_ERROR',
  message = 'Unexpected server error',
  details
) {
  const payload = {
    ok: false,
    error: {
      code,
      message,
    },
  }

  if (details) {
    payload.error.details = details
  }

  return res.status(status).json(payload)
}
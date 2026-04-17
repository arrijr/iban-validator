export type ApiError = {
  error: string
  code: string
  details?: Record<string, unknown>
  retry_after?: number
}

export function badRequest(message: string, code = 'BAD_REQUEST'): ApiError {
  return { error: message, code }
}

export function rateLimited(retryAfter: number): ApiError {
  return { error: 'Rate limit exceeded', code: 'RATE_LIMITED', retry_after: retryAfter }
}

export function batchLimitExceeded(size: number, limit: number, tier: string): ApiError {
  const upgrade = tier === 'FREE'
    ? 'Upgrade to Basic (10/batch) or Pro (100/batch) to enable batch validation.'
    : 'Upgrade to Pro for batches up to 100.'
  return {
    error: `Batch size ${size} exceeds your plan limit of ${limit}. ${upgrade}`,
    code: 'BATCH_LIMIT_EXCEEDED',
  }
}

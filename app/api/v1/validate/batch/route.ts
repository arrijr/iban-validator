import { NextRequest, NextResponse } from 'next/server'
import { validateIban } from '@/lib/iban'
import { checkRateLimit } from '@/lib/ratelimit'
import { badRequest, rateLimited, batchLimitExceeded } from '@/lib/errors'
import { checkRapidApiProxy, getTier, batchLimitForTier } from '@/lib/auth'

export const maxDuration = 20

const HARD_MAX = 100

export async function POST(req: NextRequest) {
  const forbidden = checkRapidApiProxy(req)
  if (forbidden) return forbidden

  const rl = await checkRateLimit(req)
  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000)
    return NextResponse.json(rateLimited(retryAfter), {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
      },
    })
  }

  const rlHeaders = { 'X-RateLimit-Remaining': String(rl.remaining) }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(badRequest('Request body must be valid JSON'), {
      status: 400,
      headers: rlHeaders,
    })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json(badRequest('Request body must be a JSON object'), {
      status: 400,
      headers: rlHeaders,
    })
  }

  const { ibans } = body as Record<string, unknown>

  if (!Array.isArray(ibans) || ibans.length === 0) {
    return NextResponse.json(badRequest('ibans must be a non-empty array'), {
      status: 400,
      headers: rlHeaders,
    })
  }

  if (ibans.length > HARD_MAX) {
    return NextResponse.json(badRequest(`Maximum ${HARD_MAX} IBANs per batch`), {
      status: 400,
      headers: rlHeaders,
    })
  }

  const tier = getTier(req)
  const tierLimit = batchLimitForTier(tier)

  if (tierLimit === 0) {
    return NextResponse.json(batchLimitExceeded(ibans.length, 0, tier), {
      status: 422,
      headers: rlHeaders,
    })
  }

  if (ibans.length > tierLimit) {
    return NextResponse.json(batchLimitExceeded(ibans.length, tierLimit, tier), {
      status: 422,
      headers: rlHeaders,
    })
  }

  const results = ibans.map((raw) => {
    if (typeof raw !== 'string') {
      return {
        valid: false as const,
        iban: String(raw),
        error_code: 'INVALID_FORMAT' as const,
        error: 'Input does not match IBAN format',
      }
    }
    return validateIban(raw)
  })

  const valid_count = results.filter((r) => r.valid).length
  const invalid_count = results.length - valid_count

  return NextResponse.json(
    {
      results,
      total: results.length,
      valid_count,
      invalid_count,
    },
    { status: 200, headers: rlHeaders }
  )
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-RapidAPI-Key, X-RapidAPI-Proxy-Secret',
    },
  })
}

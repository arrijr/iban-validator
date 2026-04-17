import { NextRequest, NextResponse } from 'next/server'
import { validateIban } from '@/lib/iban'
import { checkRateLimit } from '@/lib/ratelimit'
import { badRequest, rateLimited } from '@/lib/errors'
import { checkRapidApiProxy } from '@/lib/auth'

export const maxDuration = 10

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

  const { iban } = body as Record<string, unknown>

  if (typeof iban !== 'string' || !iban.trim()) {
    return NextResponse.json(badRequest('Missing required field: iban', 'MISSING_FIELD'), {
      status: 400,
      headers: rlHeaders,
    })
  }

  const result = validateIban(iban)
  return NextResponse.json(result, { status: 200, headers: rlHeaders })
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

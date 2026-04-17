import { NextRequest, NextResponse } from 'next/server'

const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET

export function checkRapidApiProxy(req: NextRequest): NextResponse | null {
  if (!PROXY_SECRET) return null

  const received = req.headers.get('x-rapidapi-proxy-secret')
  if (received !== PROXY_SECRET) {
    return NextResponse.json(
      {
        error: 'This API is only accessible through RapidAPI. Subscribe at https://rapidapi.com',
        code: 'FORBIDDEN',
      },
      { status: 403 }
    )
  }

  return null
}

export type Tier = 'FREE' | 'BASIC' | 'PRO' | 'BUSINESS'

export function getTier(req: NextRequest): Tier {
  const sub = (req.headers.get('x-rapidapi-subscription') ?? '').toUpperCase().trim()
  if (sub === 'BASIC') return 'BASIC'
  if (sub === 'PRO') return 'PRO'
  if (sub === 'BUSINESS' || sub === 'ULTRA' || sub === 'MEGA') return 'BUSINESS'
  return 'FREE'
}

export function batchLimitForTier(tier: Tier): number {
  switch (tier) {
    case 'BASIC': return 10
    case 'PRO': return 100
    case 'BUSINESS': return 100
    case 'FREE':
    default: return 0
  }
}

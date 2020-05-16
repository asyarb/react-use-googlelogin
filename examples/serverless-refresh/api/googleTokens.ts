import { NowApiHandler } from '@now/node'
import fetch from 'node-fetch'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_TOKEN_API = 'https://oauth2.googleapis.com/token'
const IS_PROD = process.env.NODE_ENV === 'production'

interface Cookies {
  gt?: string
}
interface GoogleResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
  refresh_token?: string
}
interface GetTokenArgs {
  code?: string
  refreshToken?: string
}

export interface TokenRequestBody {
  code?: string
}
export interface TokenResponse {
  body: {
    accessToken: string
    expiresAt: number
    scope: string
    tokenType: 'Bearer'
  }
  errors?: string
}

const getGoogleTokens = async ({ code, refreshToken }: GetTokenArgs) => {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })
  if (code) {
    body.append('code', code)
    body.append('redirect_uri', 'http://localhost:3000')
    body.append('grant_type', 'authorization_code')
  } else if (refreshToken) {
    body.append('refresh_token', refreshToken)
    body.append('grant_type', 'refresh_token')
  } else {
    throw new Error('Must provide code or refreshToken.')
  }

  const res = await fetch(GOOGLE_TOKEN_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const data = (await res.json()) as GoogleResponse

  return data
}

const handler: NowApiHandler = async (req, res) => {
  const code = (req?.body as TokenRequestBody)?.code
  const { gt: refreshToken } = req.cookies as Cookies

  let data: GoogleResponse
  if (code) data = await getGoogleTokens({ code })
  else if (refreshToken) data = await getGoogleTokens({ refreshToken })
  else throw new Error('Must provide code or refreshToken')

  const response: TokenResponse = {
    body: {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope,
      tokenType: data.token_type,
    },
  }

  if (code && data.refresh_token) {
    let cookieStr = `gt=${data.refresh_token}; Max-Age=2592000; Path=/; HttpOnly`
    if (IS_PROD) cookieStr += '; Secure'

    res.setHeader('Set-Cookie', cookieStr)
  }

  res.json(response)
}

export default handler

import React, { useContext, useState, useEffect } from 'react'
import {
  useGoogleLogin,
  GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'
import { TokenRequestBody, TokenResponse } from '../api/googleTokens'

interface TokenObj {
  accessToken?: string
  expiresAt?: number
}
interface ContextValue
  extends Omit<
    GoogleLoginHookReturnValue,
    'signIn' | 'grantOfflineAccess' | 'auth2'
  > {
  fetchWithRefresh: (
    inupt: RequestInfo,
    init?: RequestInit
  ) => Promise<Response>
  signInWithTokens: () => Promise<boolean>
}

/**
 * TS helper for using React.createContext() without needing
 * to check for `undefined` all the time. If you are using JS, feel free
 * to just use React.createContext() directly.
 */
const createContext = <A extends {} | null>() => {
  const ctx = React.createContext<A | undefined>(undefined)

  const useCtx = () => {
    const contextValue = useContext(ctx)

    if (contextValue === undefined)
      throw new Error('useCtx must be inside a Provider with a value')

    return contextValue
  }

  return [useCtx, ctx.Provider] as const
}

const [useGoogleAuth, AuthProvider] = createContext<ContextValue>()

export const GoogleAuthProvider: React.FC = ({ children }) => {
  const {
    googleUser,
    isInitialized,
    grantOfflineAccess,
    signOut,
    isSignedIn,
  } = useGoogleLogin({
    clientId: 'your-client-id',
  })
  const [tokenObj, setTokenObj] = useState<TokenObj>({})

  /**
   * Use this function to sign into Google while also
   * setting up our `refreshToken` as a `HttpOnly` cookie
   * from our serverless endpoint.
   */
  const signInWithTokens = async () => {
    const code = await grantOfflineAccess()
    if (!code) return false

    const reqBody: TokenRequestBody = {
      code,
    }
    const res = await fetch('/api/googleTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    })
    const data = (await res.json()) as TokenResponse

    setTokenObj({
      accessToken: data.body.accessToken,
      expiresAt: data.body.expiresAt,
    })

    return true
  }

  /**
   * Helper utility to make a call to our serverless endpoint
   * to refresh our `accessToken` if it has expired.
   */
  const refreshAccessToken = async () => {
    const res = await fetch('/api/googleTokens')
    const data = (await res.json()) as TokenResponse

    const tokenObj: TokenObj = {
      accessToken: data.body.accessToken,
      expiresAt: data.body.expiresAt,
    }

    setTokenObj(tokenObj)

    return tokenObj
  }

  /**
   * A wrapper function around `fetch` that handles automatically refreshing
   * our `accessToken` if it is within 5 minutes of expiring.
   *
   * Behaves identically to `fetch` otherwise.
   */
  const fetchWithRefresh: ContextValue['fetchWithRefresh'] = async (
    input,
    init
  ) => {
    if (!tokenObj.expiresAt || !tokenObj.accessToken) throw new Error()

    let accessToken = tokenObj.accessToken
    // The token is within 5 minutes of expiring
    const shouldRefreshToken = tokenObj.expiresAt - 300 * 1000 - Date.now() <= 0

    if (shouldRefreshToken) {
      accessToken =
        (await refreshAccessToken()).accessToken ?? tokenObj.accessToken
    }

    return fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  /**
   * This effect handles updating our tracked `accessToken` if our user
   * is persisted across page reloads.
   *
   * If a user signs out, handles clearing their `accessToken` as well.
   */
  useEffect(() => {
    if (!isInitialized) return
    if (!googleUser) {
      setTokenObj({})
      return
    }

    setTokenObj({
      accessToken: googleUser?.accessToken,
      expiresAt: googleUser?.tokenObj?.expires_at,
    })
  }, [isInitialized, googleUser])

  return (
    <AuthProvider
      value={{
        isSignedIn,
        isInitialized,
        googleUser,
        signOut,
        signInWithTokens,
        fetchWithRefresh,
      }}
    >
      {children}
    </AuthProvider>
  )
}
export { useGoogleAuth }

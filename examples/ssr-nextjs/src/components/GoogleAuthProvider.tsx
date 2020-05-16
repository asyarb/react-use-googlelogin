import React, { useContext } from 'react'
import {
  useGoogleLogin,
  GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'
import { TokenRequestBody } from '../pages/api/googleTokens'

interface ContextValue
  extends Omit<
    GoogleLoginHookReturnValue,
    'grantOfflineAccess' | 'auth2' | 'refreshUser' | 'signIn'
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
    refreshUser,
  } = useGoogleLogin({
    clientId: 'your-client-id',
  })

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
    await fetch('/api/googleTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    })

    return true
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
    let accessToken = googleUser.accessToken
    // The token is within 5 minutes of expiring
    const shouldRefreshToken =
      googleUser.expiresAt - 300 * 1000 - Date.now() <= 0

    if (shouldRefreshToken) {
      const tokenObj = await refreshUser()
      accessToken = tokenObj?.accessToken ?? accessToken
    }

    return fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

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

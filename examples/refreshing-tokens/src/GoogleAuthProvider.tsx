import React, { useContext } from 'react'
import {
  useGoogleLogin,
  GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'

interface ContextValue extends Omit<GoogleLoginHookReturnValue, 'signIn'> {
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

  return (
    <AuthProvider
      value={{
        isSignedIn,
        isInitialized,
        googleUser,
        signOut,
        grantOfflineAccess,
        fetchWithRefresh,
      }}
    >
      {children}
    </AuthProvider>
  )
}
export { useGoogleAuth }

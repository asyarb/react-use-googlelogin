import React, { useContext } from 'react'
import {
  useGoogleLogin,
} from 'react-use-googlelogin'

/**
 * TS helper for using React.createContext() without needing
 * to check for `undefined` all the time. If you are using JS, feel free
 * to just use React.createContext() directly.
 */
const createContext = () => {
  const ctx = React.createContext<A | undefined>(undefined)

  const useCtx = () => {
    const contextValue = useContext(ctx)

    if (contextValue === undefined)
      throw new Error('useCtx must be inside a Provider with a value')

    return contextValue
  }

  return [useCtx, ctx.Provider] 
}

const [useGoogleAuth, AuthProvider] = createContext<ContextValue>()

export const GoogleAuthProvider = ({ children }) => {
  const {
    googleUser,
    isInitialized,
    grantOfflineAccess,
    signOut,
    isSignedIn,
    refreshUser,
  } = useGoogleLogin({
    clientId:
      '253609759251-4m5j92ji446hv4h8e1jefbi63u40ctr1.apps.googleusercontent.com',
  })

  /**
   * A wrapper function around `fetch` that handles automatically refreshing
   * our `accessToken` if it is within 5 minutes of expiring.
   *
   * Behaves identically to `fetch` otherwise.
   */
  const fetchWithRefresh = async (
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
        signIn: grantOfflineAccess,
        isSignedIn,
        isInitialized,
        googleUser,
        signOut,
        fetchWithRefresh,
      }}
    >
      {children}
    </AuthProvider>
  )
}
export { useGoogleAuth }

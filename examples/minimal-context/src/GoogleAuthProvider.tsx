import React, { useContext } from 'react'
import {
  useGoogleLogin,
  GoogleLoginHookReturnValue,
} from 'react-use-googlelogin'

/**
 * A helper to create a `context` and `Provider` with no upfront default value. Avoids
 * and having to check for undefined all the time in TS-land.
 *
 * In JS-Land, you could just use `React.createContext` as normal.
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

const [useGoogleAuth, AuthProvider] = createContext<
  GoogleLoginHookReturnValue
>()

export const GoogleAuthProvider: React.FC = ({ children }) => {
  const hookData = useGoogleLogin({
    clientId:
      '253609759251-4m5j92ji446hv4h8e1jefbi63u40ctr1.apps.googleusercontent.com',
  })

  return <AuthProvider value={hookData}>{children}</AuthProvider>
}
export { useGoogleAuth }

import React from 'react'
import mod from 'react-use-googlelogin'
import { ErrorBoundary } from 'react-error-boundary'

const { useGoogleLogin } = mod

const Fallback = () => {
  return <div>Something went wrong.</div>
}

export const App = () => {
  const {
    googleUser,
    signIn,
    signOut,
    isSignedIn,
    grantOfflineAccess,
  } = useGoogleLogin({
    clientId:
      '253609759251-4m5j92ji446hv4h8e1jefbi63u40ctr1.apps.googleusercontent.com',
  })

  const handleOffline = async () => {
    const code = await grantOfflineAccess()
    console.log(code)
  }

  return (
    <ErrorBoundary FallbackComponent={Fallback}>
      <button onClick={() => signIn()}>Sign in</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={handleOffline}>Grant Offline Access</button>

      {isSignedIn && (
        <div>
          <h1>{googleUser?.profileObj?.name}</h1>
          <img src={googleUser?.profileObj?.imageUrl} alt="Profile avatar" />
        </div>
      )}
    </ErrorBoundary>
  )
}

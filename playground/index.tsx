import React from 'react'
import ReactDOM from 'react-dom'

import { useGoogleLogin } from '../dist'

export const Example = () => {
  const {
    googleUser,
    signIn,
    isSignedIn,
    signOut,
    grantOfflineAccess,
  } = useGoogleLogin({
    clientId:
      '253609759251-4m5j92ji446hv4h8e1jefbi63u40ctr1.apps.googleusercontent.com',
  })

  const handleClick = () => signIn()
  const handleOffline = async () => {
    const code = await grantOfflineAccess()
    console.log(code)
  }

  return (
    <div>
      <button onClick={handleClick}>Sign in</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={handleOffline}>Grant Offline Access</button>

      {isSignedIn && (
        <div>
          <h1>{googleUser.profileObj.name}</h1>
          <img src={googleUser.profileObj.imageUrl} alt="Profile avatar" />
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Example />, document.getElementById('root'))

import React from 'react'
import ReactDOM from 'react-dom'

import { GoogleAuthProvider, useGoogleAuth } from './GoogleAuthProvider'
import './index.css'

const App = () => {
  const { signIn, signOut, googleUser, isSignedIn } = useGoogleAuth()

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={() => signIn()} style={{ marginRight: '1rem' }}>
        Sign in
      </button>
      <button onClick={signOut}>Sign Out</button>

      {isSignedIn && (
        <div>
          <h1>{googleUser.profileObj.name}</h1>
          <img src={googleUser.profileObj.imageUrl} alt="Avatar." />
        </div>
      )}
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

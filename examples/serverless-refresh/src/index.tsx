import React from 'react'
import ReactDOM from 'react-dom'

import { GoogleAuthProvider, useGoogleAuth } from './GoogleAuthProvider'
import './index.css'

const App = () => {
  const {
    signInWithTokens,
    signOut,
    googleUser,
    isSignedIn,
    fetchWithRefresh,
  } = useGoogleAuth()

  const handleRequest = async () => {
    const res = await fetchWithRefresh('/')
  }

  return (
    <div
      style={{
        padding: '1rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gap: '1rem',
          justifyContent: 'start',
        }}
      >
        <button onClick={signInWithTokens}>Sign in</button>
        <button onClick={signOut}>Sign Out</button>
        <button onClick={handleRequest}>Make request to Google's API.</button>
      </div>

      {isSignedIn && (
        <div>
          <h1>{googleUser!.profileObj!.name}</h1>
          <img src={googleUser!.profileObj!.imageUrl} alt="Avatar." />
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

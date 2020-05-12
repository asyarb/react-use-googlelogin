import React from 'react'
import ReactDOM from 'react-dom'
import { useGoogleLogin } from 'react-use-googlelogin'

import './index.css'

const App = () => {
  const { signIn, signOut, googleUser, isSignedIn } = useGoogleLogin({
    clientId:
      '253609759251-4m5j92ji446hv4h8e1jefbi63u40ctr1.apps.googleusercontent.com',
  })

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={signIn} style={{ marginRight: '1rem' }}>
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
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

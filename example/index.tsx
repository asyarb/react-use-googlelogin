import React from 'react'
import ReactDOM from 'react-dom'

import { useGoogleLogin } from '../.'

export const Example = () => {
  const { googleUser, signIn } = useGoogleLogin({
    clientId: 'your-client-id',
  })

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <button onClick={() => signIn()}>Sign in</button>
      {googleUser && googleUser.profileObj && (
        <div>
          <h1>{googleUser.profileObj.name}</h1>
          <img
            src={googleUser.profileObj.imageUrl}
            alt="Profile avatar"
            style={{ borderRadius: '50%' }}
          />
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Example />, document.getElementById('root'))

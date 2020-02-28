import React from 'react'
import ReactDOM from 'react-dom'

import { useGoogleLogin } from '../src'

export const Example = () => {
  const { googleUser, signIn } = useGoogleLogin({
    clientId: 'your-client-id',
  })

  return (
    <div>
      <button onClick={signIn}>Sign in</button>

      {googleUser?.profileObj && (
        <div>
          <h1>{googleUser.profileObj.name}</h1>
          <img src={googleUser.profileObj.imageUrl} alt="Profile avatar" />
        </div>
      )}
    </div>
  )
}

ReactDOM.render(<Example />, document.getElementById('root'))

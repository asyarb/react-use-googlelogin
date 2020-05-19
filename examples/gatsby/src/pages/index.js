import React from "react"
import { useGoogleAuth } from "../components/GoogleAuthProvider"

const IndexPage = () => {
  const { isSignedIn, googleUser, signIn, signOut } = useGoogleAuth()

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => signIn()} style={{ marginRight: "1rem" }}>
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

export default IndexPage

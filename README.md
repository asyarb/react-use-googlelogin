# react-use-googlelogin

<img src="./assets/readme.png" height="50px">

[![NPM](https://img.shields.io/npm/v/react-use-googlelogin.svg?&color=green)](https://www.npmjs.com/package/react-use-googlelogin)

Use
[Google's oAuth2](https://developers.google.com/identity/protocols/OAuth2UserAgent)
with React! This is a small wrapper around Google's oAuth2 JavaScript client
library for accessing Google login functionality in your React app.

You can find a demo here on [Code Sandbox](https://codesandbox.com). _TODO_

## Install

```bash
# npm
npm install --save react-use-googlelogin

# yarn
yarn add react-use-googlelogin
```

## Usage

⚠ **Important**: You will need to have an active application and `clientID` from
Google's developer console.
[Refer to "before you begin" for more information](https://developers.google.com/identity/sign-in/web/sign-in)
on creating a `clientID` for your application.

### Sample Using Context

```jsx
import React from 'react'
import { useGoogleLogin } from 'react-use-googlelogin'

const GoogleAuthContext = React.createContext() // Not necessary, but recommended.

export const GoogleAuthProvider = ({ children }) => {
  const googleAuth = useGoogleLogin({
    clientId: process.env.GOOGLE_CLIENT_ID, // Your clientID from Google.
  })

  return (
    <GoogleAuthContext.Provider value={googleAuth}>
      {/* The rest of your app */}
      {children}
    </GoogleAuthContext.Provider>
  )
}

export const useGoogleAuth = () => React.useContext(GoogleAuthContext)

// In another component...
const GoogleLoginButton = () => {
  const { signIn } = useGoogleAuth()

  return <button onClick={signIn}>Sign in with Google</button>
}
```

**As a React Hook**, you can destructure these values:

- `googleUser`
- `auth2`
- `signIn`
- `signOut`
- `isSignedIn`
- `isInitialized`

### googleUser

A `GoogleUser` instance representing the logged in user. Contains the user's
verifiable ID token in the `id_token` key. Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/backend-auth)
on verifying ID tokens on your backend.

By default, contains basic user information within the `profileObj` key.

If no user is logged in, this value is `null`.

```jsx
const Profile = () => {
  const { googleUser } = useGoogleLogin()

  return (
    <div>
      <h1>{googleUser.profileObj.name}</h1>
      <p>{googleUser.profileObj.email}</p>
      <img src={googleUser.profileObj.imageUrl} />
    </div>
  )
}
```

This object is the same raw `GoogleUser` object returned by
`gapi.auth2.getAuthInstance().currentUser.get()`. Use this object with the
appropriate Google API functions to fetch other data from the user's profile.

> A `GoogleUser` object represents one user account. GoogleUser objects are
> typically obtained by calling `GoogleAuth.currentUser.get()`.

Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#users)
for more info.

### auth2

The `GoogleAuth` instance that was initialized when the hook was run. You
normally shouldn't need to use this directly, but it is provided if needed.

> GoogleAuth is a singleton class that provides methods to allow the user to
> sign in with a Google account, get the user's current sign-in status, get
> specific data from the user's Google profile, request additional scopes, and
> sign out from the current account.

For more information, refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#authentication)

### signIn()

A function that will prompt the user to login via Google. Will use the sign-in
flow specified by the `uxMode` parameter.

On success, this function returns `googleUser`. This is useful if immediate
access to `googleUser` is needed following a sign in. We would otherwise need to
wait for a re-render to see the hook value updated.

If the sign in flow fails for any reason, `signIn()` returns `undefined`.

```jsx
const GoogleLoginButton = () => {
  const { signIn } = useGoogleLogin()

  const handleSignIn = async () => {
    const googleUser = await signIn() // if you need immediate access to `googleUser`, get it from signIn() directly
  }
}
```

`signIn` can also take a configuration object that you can customize. For
information on the available options, refer to:
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#gapiauth2signinoptions)

### signOut()

Signs out the current user and disconnects the current oAuth2 client. Sets the
`googleUser` back to `null` and clears all persistent session storage.

### isSignedIn

A boolean that is `true` when a user is actively logged in, and `false` when
otherwise.

```jsx
const Page = () => {
  const { isSignedIn } = useGoogleLogin()

  return (
    <div>
      <h2>Some regular stuff</h2>
      {isSignedIn && <p>We are logged in!</p>}
    </div>
  )
}
```

### isInitialized

A boolean that is `true` once the `window.gapi` object is directly available,
and `false` otherwise. Please see the [persisiting users](#persisting-users)
section for more information about using `isInitialized`.

## API

Specify any of the options defined below:

| Name              | Type    | Default              | Description                                                                                                                                                                                                                             |     |
| ----------------- | ------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| clientId          | String  | ---                  | **Required**. The clientID for your application from Google's developer console.                                                                                                                                                        |     |
| persist           | Boolean | true                 | Toggle whether `googleUser` should be persisted from `sessionStorage` on page refresh.                                                                                                                                                  |     |
| hostedDomain      | String  | ---                  | The G Suite domain to which users must belong to sign in. If blank, all google accounts can login.                                                                                                                                      |     |
| autoSignIn        | String  | 'none'               | Enum allowing either `none`, `prompt` or `auto`. If set to `prompt`, will attempt to automatically sign the user in with the full ux flow (popup, redirect). If set to `auto`, will attempt to automatically login without any ux flow. |     |
| redirectUri       | String  | ''                   | If `uxMode` is set to `redirect`, this is the address a user will be sent to after resolving the Google auth flow.                                                                                                                      |     |
| scope             | String  | 'profile email'      | The scopes to request, as a space-delimited string. Optional if `fetch_basic_profile` is set to true.                                                                                                                                   |     |
| cookiePolicy      | String  | 'single_host_origin' | The domains for which to create sign-in cookies. Either a URI, `single_host_origin`, or none                                                                                                                                            |     |
| fetchBasicProfile | Boolean | true                 | Allows fetching of users' basic profile information when they sign in. Adds 'profile', 'email' and 'openid' to the requested scopes.                                                                                                    |     |
| uxMode            | String  | 'popup'              | Enum of either `popup` or `redirect`. If `redirect`, will redirect the user to the uri specified in `redirectUri` after login flow.                                                                                                     |     |

## Persisting Users

By default, `useGoogleLogin` will handle persisting `googleUser` on page refresh
by using the stored values in `sessionStorage` that Google's `gapi` client
automatically stores.

If you wish to opt-out of this behavior, set `persist` to `false` when calling
`useGoogleLogin()`.

### Dealing with a flash of an unauthenticated view:

Due to the nature of client-side-only authentication, it's not possible to
completely prevent a brief moment of unauthenticated state on page refresh. To
help with this, `useGoogleLogin` returns `isInitialized`.

`isInitialized` will be `false` until Google's API has been loaded and any
logged in user has been persisted to `googleUser` from `sessionStorage`.

If you prevent rendering of a component reliant on authenticated state until
`isInitialized` is `true`, you can momentarily hide any of these components
(preventing a janky rapid state change) until you know they are logged in or
not.

```jsx
// In this case, a user has already logged in but prior, but has refreshed the page:

const Page = () => {
  const { isSignedIn, isInitalized } = useGoogleLogin()

  return (
    <div>
      <h2>Content</h2>
      {isInitialized && (
        <>
          {isSignedIn ? (
            <button onClick={signOut}>Sign Out</button>
          ) : (
            <button onClick={signIn}>Sign In</button>
          )}
        </>
      )}
    </div>
  )
}
```

In the above example, the `<button>` will only display "Sign Out" on page load
instead of rapidly swapping between "Sign In" and "Sign Out".

## License

MIT.

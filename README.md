# react-use-googlelogin <!-- omit in toc -->

<img src="./assets/readme.png" height="50px">

[![NPM](https://img.shields.io/npm/v/react-use-googlelogin.svg?&color=green)](https://www.npmjs.com/package/react-use-googlelogin)

Use
[Google's oAuth2](https://developers.google.com/identity/protocols/OAuth2UserAgent)
with React! This is a small wrapper around Google's oAuth2 JavaScript client
library for accessing Google login functionality in your React app.

- [Install](#install)
- [Usage](#usage)
  - [Sample Using Context](#sample-using-context)
  - [Examples](#examples)
- [Hook Return Values](#hook-return-values)
  - [googleUser](#googleuser)
  - [signIn()](#signin)
  - [signOut()](#signout)
  - [isSignedIn](#issignedin)
  - [grantOfflineAccess()](#grantofflineaccess)
    - [Google's Official docs on refreshing tokens on a backend](#googles-official-docs-on-refreshing-tokens-on-a-backend)
  - [refreshUser()](#refreshuser)
  - [isInitialized](#isinitialized)
  - [auth2](#auth2)
- [API](#api)
- [Persisting Users](#persisting-users)
  - [Dealing with a flash of an unauthenticated view:](#dealing-with-a-flash-of-an-unauthenticated-view)
- [License](#license)

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

### Examples

See below for example integrations.

- [Minimal](https://github.com/asyarb/react-use-googlelogin/tree/master/examples/minimal)
- [Minimal w/ context](https://github.com/asyarb/react-use-googlelogin/tree/master/examples/minimal-context)
- [Refreshing Tokens](https://github.com/asyarb/react-use-googlelogin/tree/master/examples/refreshing-tokens)
- [Gatsby](https://github.com/asyarb/react-use-googlelogin/tree/master/examples/gatsby)
- [SSR content with NextJS] - Coming Soon

## Hook Return Values

**As a React Hook**, you can destructure these values:

- `googleUser`
- `signIn`
- `signOut`
- `isSignedIn`
- `isInitialized`
- `grantOfflineAccess`
- `auth2`

### googleUser

An instance of `GoogleUser` representing the logged in user. Contains the user's
verifiable ID token in the `tokenId` key. Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/backend-auth)
on verifying ID tokens on your backend.

By default, this `GoogleUser` is enhanced with additional keys for the
`accessToken` and its corresponding `expiresAt` key. If `fetchBasicProfile` is
`true`, the information can be found in the `profileObj` key.

If no user is logged in, this will be `undefined`.

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

This object is the same `GoogleUser` object returned by
`gapi.auth2.getAuthInstance().currentUser.get()`. Use the `accessToken` in this
object in conjunctino with Google's API endpoints to fetch other data for the
user.

Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#users)
for more info.

### signIn()

A function that will prompt the user to login via Google. Will use the sign-in
flow specified by the `uxMode` parameter.

On success, this function returns `googleUser`. This is useful if immediate
access to `googleUser` is needed following a sign in. We would otherwise need to
wait for a re-render to see the hook value updated.

If the sign in flow fails for any reason, `signIn()` returns `false`.

```jsx
const GoogleLoginButton = () => {
  const { signIn } = useGoogleLogin()

  const handleSignIn = async () => {
    const googleUser = await signIn() // if you need immediate access to `googleUser`, get it from signIn() directly
  }
}
```

`signIn` can also take a configuration object. For information on the available
options, refer to:
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#gapiauth2signinoptions)

### signOut()

Signs out the current user and disconnects the current oAuth2 client. It also
sets `googleUser` back to `undefined` and clears all persistent session storage.

### isSignedIn

A boolean that is `true` when a user is actively logged in, and `false`
otherwise.

```jsx
const Page = () => {
  const { isSignedIn } = useGoogleLogin()

  return (
    <div>
      <h2>Some unauthenticated content.</h2>
      {isSignedIn && <p>We are logged in!</p>}
    </div>
  )
}
```

### grantOfflineAccess()

A function that will sign in a user and prompt them for long-term access. Will
use the sign-in flow specified by the `uxMode` parameter.

Signing in a user with this function allows usage of `refreshUser` to get new
`accessToken`s. This is useful if the default 1 hour duration is too limiting
for your app.

This function returns an authorization `code` that can be exchanged for a
`refreshToken` and `accessTokens` on your backend if needed.

#### Google's Official docs on refreshing tokens on a backend

- [Google's server docs](https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code)
- [Google's client docs](https://developers.google.com/identity/sign-in/web/reference#googleauthgrantofflineaccessoptions)

### refreshUser()

A function that will refresh the `accessToken` for the currently logged in
`googleUser`. To use this function, a user must have logged in via
`grantOfflineAccess`.

On success, the function will return an object containing the new `accessToken`
and corresponding `expiresAt` epoch time.

Under the hood, this calls `GoogleUser.reloadAuthResponse()` and handles the
react state updates. See
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#googleuserreloadauthresponse)
for more info.

### isInitialized

A boolean that is `true` once the `window.gapi` object is available, and `false`
otherwise. Please see the [persisiting users](#persisting-users) section for
more information about using `isInitialized`.

### auth2

The `GoogleAuth` instance that was initialized when the hook was initially run.
You shouldn't need to use this directly, but it is provided if necessary.

> GoogleAuth is a singleton class that provides methods to allow the user to
> sign in with a Google account, get the user's current sign-in status, get
> specific data from the user's Google profile, request additional scopes, and
> sign out from the current account.

For more information, refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#authentication)

## API

Specify any of the options defined below:

| Name              | Type    | Default              | Description                                                                                                     |
| ----------------- | ------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| clientId          | String  | ---                  | **Required**. The clientID for your application from Google's developer console.                                |
| persist           | Boolean | true                 | Toggle whether `googleUser` should be persisted from `sessionStorage` on page refresh.                          |
| uxMode            | String  | 'popup'              | Enum of either `popup` or `redirect`. If set to `redirect`, `redirectUri` must also be set.                     |
| redirectUri       | String  | ''                   | If `uxMode` is set to `redirect`, this is the address a user will be sent to after the login flow.              |
| scope             | String  | 'profile email'      | The scopes to request, as a space-delimited string. **Optional** if `fetch_basic_profile` is set to `true`.     |
| fetchBasicProfile | Boolean | true                 | Fetches common user profile information on login. Adds `profile`, `email` and `openid` to the requested scopes. |
| cookiePolicy      | String  | 'single_host_origin' | The domains for which to create sign-in cookies. Either a URI, `single_host_origin`, or `none`.                 |
| hostedDomain      | String  | ---                  | The G Suite domain to which users must belong to sign in. If blank, all google accounts can login.              |

## Persisting Users

By default, `useGoogleLogin` will handle persisting `googleUser` on page refresh
by using values in `sessionStorage` that Google's `gapi` client automatically
stores.

If you wish to opt-out of this behavior, set `persist` to `false` when calling
`useGoogleLogin()`.

### Dealing with a flash of an unauthenticated view:

Due to the nature of client-side-only authentication, it's not possible to
completely prevent a brief moment of unauthenticated state on hard page refresh
for pages that are server-side rendered (SSR'd). To help with this,
`useGoogleLogin` returns `isInitialized`.

`isInitialized` will be `false` until Google's API has been loaded and any
logged in user has been persisted to `googleUser` from `sessionStorage`.

If you prevent the rendering of a component reliant on authenticated state until
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

> Please keep in mind that this workaround will result in these components
> **not** being rendered in SSR'd content. In the future, this library plans to
> provide an example integration for SSR.

## License

MIT.

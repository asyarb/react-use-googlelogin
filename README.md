<p align="center">
  <img src="./assets/readme.png" height="50px">
</p>

<h1 align="center">react-use-googlelogin</h1>

[![NPM](https://img.shields.io/npm/v/react-use-googlelogin.svg?&color=green)](https://www.npmjs.com/package/react-use-googlelogin)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-use-googlelogin.svg?logoColor=brightgreen)

Use
[Google's oAuth2](https://developers.google.com/identity/protocols/OAuth2UserAgent)
with React! This is a small wrapper over Google's oAuth2 JavaScript client
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

  const handleSignIn = async () => {
    await signIn()
  }

  return <button onClick={handleSignIn}>Sign in with Google</button>
}
```

**As a React Hook**, you can destructure these values:

- `googleUser`
- `signIn`
- `signOut`
- `isLoggedIn`

### googleUser

A `GoogleAuth` instance representing the logged in user. Contains the user's
verifiable ID token in the `id_token` key. Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/backend-auth)
on verifying ID tokens on your backend.

Contains basic user information within the `profileObj` key.

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

This object is the same raw `GoogleAuth` object returned by
`gapi.auth2.getAuthInstance()`. Use this object with the appropriate Google API
functions to fetch other data from the user's Google profile.

> `GoogleAuth` is a singleton class that allows you to get additional specific
> data from a user's Google profile and request for additional scopes if they
> are under the scopes specified in your developer console.

Refer to
[Google's docs](https://developers.google.com/identity/sign-in/web/reference#authentication)
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
    const googleUser = await signIn() // if you need immediate access to `googleUser`, get it from signIn() instead of waiting for a re-render.
  }
}
```

### signOut()

Signs out the current user and disconnects the current oAuth2 client. Sets the
`googleUser` back to `null`.

### isLoggedIn

A boolean that is `true` when a user is actively logged in, and `false` when
otherwise.

```jsx
const Page = () => {
  const { isLoggedIn } = useGoogleLogin()

  return (
    <div>
      <h2>Some regular stuff</h2>
      {isLoggedIn && <p>We are logged in!</p>}
    </div>
  )
}
```

## API

Specify any of the options defined below:

```js
useGoogleLogin({
  clientId: String!,
  hostedDomain: String,
  discoveryDocs: Array,
  responseType: String,
  redirectUri: String,
  scope: String,
  accessType: String,
  cookiePolicy: String,
  fetchBasicProfile: Boolean,
  autoSignIn: String,
  uxMode: String
})
```

| Name              | Type    | Default              | Description                                                                                                                                                                                                                             |     |
| ----------------- | ------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| clientId          | String  | ---                  | **Required**. The clientID for your application from Google's developer console.                                                                                                                                                        |     |
| hostedDomain      | String  | ---                  | The G Suite domain to which users must belong to sign in. If blank, all google accounts can login.                                                                                                                                      |     |
| autoSignIn        | String  | 'none'               | Enum allowing either `none`, `prompt` or `auto`. If set to `prompt`, will attempt to automatically sign the user in with the full ux flow (popup, redirect). If set to `auto`, will attempt to automatically login without any ux flow. |     |
| discoveryDocs     | Array   | []                   | For info on discovery docs, refer to: https://developers.google.com/discovery/v1/using                                                                                                                                                  |     |
| redirectUri       | String  | ''                   | If `uxMode` is set to `redirect`, this is the address a user will be sent to after resolving the Google auth flow.                                                                                                                      |     |
| scope             | String  | 'profile email'      | The scopes to request, as a space-delimited string. Optional if `fetch_basic_profile` is set to true.                                                                                                                                   |     |
| accessType        | String  | 'online'             | An enum allowing either `online` or `offline`. If `offline` with `responseType` of `code`, the hook will return a refresh token in `googleUser`.                                                                                        |     |
| cookiePolicy      | String  | 'single_host_origin' | The domains for which to create sign-in cookies. Either a URI, `single_host_origin`, or none                                                                                                                                            |     |
| fetchBasicProfile | Boolean | true                 | Allows fetching of users' basic profile information when they sign in. Adds 'profile', 'email' and 'openid' to the requested scopes.                                                                                                    |     |
| uxMode            | String  | 'popup'              | Enum of either `popup` or `redirect`. If `redirect`, will redirect the user to the uri specified in `redirectUri` after login flow.                                                                                                     |     |

## Gotchas

### The user is lost if I refresh the page!

This is "intended". I didn't want to make any assumptions as to how developers
would want to persist user information, so it's left up to the developer to do
so.

The hook does provide a `autoSignIn` option that can automatically
re-authenticate a user when the app refreshes, but this may not provide the most
ideal UX for some use cases.

For a more seamless UX, a solution leveraging `localStorage` or cookies is
recommended.

## License

MIT.

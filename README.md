# React-Use-GoogleLogin

React hook to use the Google oAuth2 client JavaScript [library](https://developers.google.com/identity/protocols/OAuth2UserAgent).

## Install

```bash
# npm
npm install --save react-use-googlelogin

# yarn
yarn add react-use-googlelogin
```

## How To Use

Run the hook like you would any other and pass in your `clientId`:

```js
import React from 'react'
import { useGoogleLogin } from 'react-use-googlelogin'

const Example = () => {
  const { googleUser, signIn, signOut } = useGoogleLogin({
    clientId: process.env.GOOGLE_CLIENT_ID,
  })

  return (
    <div>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>

      {googleUser && (
        <div>
          <h1>{googleUser.profileObj.name}</h1>
          <p>{googleUser.profileObj.email}</p>
          <img src={googleUser.profileObj.imageUrl} />
        </div>
      )}
    </div>
  )
}
```

Specify any other options as defined below:

## API

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

| Name              | Type    | Default              | Description                                                                                                                                                                                                                                                    |     |
| ----------------- | ------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| clientId          | String  | ---                  | **Required**. The clientID for your application from Google's developer console.                                                                                                                                                                               |     |
| hostedDomain      | String  | ---                  | The G Suite domain to which users must belong to sign in. If blank, all google accounts can login.                                                                                                                                                             |     |
| autoSignIn        | String  | 'none'               | Enum allowing either `none`, `prompt` or `auto`. If set to `prompt`, when hook is run, will attempt to automatically sign the user in with the full ux flow (popup, redirect). If set to `auto`, will just attempt to automatically login without any ux flow. |     |
| discoveryDocs     | Array   | []                   | For info on discovery docs, refer to: https://developers.google.com/discovery/v1/using                                                                                                                                                                         |     |
| redirectUri       | String  | ''                   | If `uxMode` is set to `redirect`, this is the address a user will be sent to after resolving the Google auth flow.                                                                                                                                             |     |
| scope             | String  | 'profile email'      | The scopes to request, as a space-delimited string. Optional if `fetch_basic_profile` is set to true.                                                                                                                                                          |     |
| accessType        | String  | 'online'             | An enum allowing either `online` or `offline`. If `offline` with `responseType` of `code`, the hook will return a refresh token in `googleUser`.                                                                                                               |     |
| cookiePolicy      | String  | 'single_host_origin' | The domains for which to create sign-in cookies. Either a URI, `single_host_origin`, or none                                                                                                                                                                   |     |
| fetchBasicProfile | Boolean | true                 | Allows fetching of users' basic profile information when they sign in. Adds 'profile', 'email' and 'openid' to the requested scopes.                                                                                                                           |     |
| uxMode            | String  | 'popup'              | Enum of either `popup` or `redirect`. If `redirect`, will redirect the user to the uri specified in `redirectUri` after login flow.                                                                                                                            |     |

## Return Values

`useGoogleLogin` returns the following values via an object:

- `googleUser`
- `googleAuthObj`
- `signIn`
- `signOut`

### googleUser

An object representing the logged in user. Contains the user's verifiable ID token in the `id_token` key. Refer to [https://developers.google.com/identity/sign-in/web/backend-auth](https://developers.google.com/identity/sign-in/web/backend-auth) on verifying ID tokens.

Contains basic user information within the `profileObj` key. 

If no user is logged in, this value object is set to `null`.

```js
const { googleUser } = useGoogleLogin()

// Check if a user is logged in:
if (googleUser) {
  // ... user is logged in
}
```

### signIn()

A function that will prompt the user to login via Google. Will use the sign-in flow specified by the `uxMode` parameter. On success, `googleUser` and `googleAuthObj` will be set.

### signOut()

A funciton that will sign out and disconnect the current oAuth2 client. Also sets the `googleUser` and `googleAuthObj` back to `null`.

### googleAuthObj

The raw `GoogleAuth` object returned by `gapi.auth2.getAuthInstance()`. This instance of `GoogleAuth` will have the current user already tied to it via `gapi.auth2.signIn()`, and have access to the scopes specfied in `scope`. Use this object with the appropriate Google API functions to fetch other data from the user's Google profile.

> `GoogleAuth` is a singleton class that allows you to get additional specific data from a user's Google profile and request for additional scopes if they are under the scopes specified in your developer console. 

Refer to [Google's docs](https://developers.google.com/identity/sign-in/web/reference#authentication) for more info.


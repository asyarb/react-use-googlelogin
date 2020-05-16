# Refresh Tokens With Serverless Functions

Example of using `react-use-googlelogin` with serverless functions on
[Vercel](https://vercel.com/). Refresh tokens and server-side code is necessary
to have auth access that exceeds 1 hour.

In addition to your `clientId`, you'll also need your `clientSecret` to exchange
`refreshTokens` and authorization `code`'s for `accessTokens`.

## Running

To run this example:

```bash
# Install deps with yarn
yarn

# Or use npm
npm i

# Start the development server and lambda endpoints
yarn start:lambda

# Or use npm
npm start:lambda
```

Be sure to replace the placeholder `clientId` with your own.

## High-level overview

1. Authenticate a user using `grantOfflineAccess` and send the authorization
   `code` to your server.
2. On your server, make a request to Google's token API while sending along
   `code` to exchange it for a `refreshToken`.
3. Set the `refreshToken` as a `HttpOnly` cookie in the response back to your
   client.
4. Whenever the `expiresAt` on `googleUser` has passed, make a request back to
   your server for a new `accessToken`.
5. Since we set our `refreshToken` as a cookie in `3`, we can access it on our
   server and call Google's token API for a new `accessToken`.
6. Return the new `accessToken` to the client for use in future API calls.
7. Repeat steps `4` - `6` as necessary.

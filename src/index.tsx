import { useState, useRef } from 'react'

import { useExternalScript } from './useExternalScript'
import { DOM_ID, GOOGLE_API_URL } from './constants'
import {
  GoogleUser,
  HookConfig,
  HookState,
  HookReturnValue,
  TokenObj,
} from './types'

export type GoogleLoginHookReturnValue = HookReturnValue

/**
 * Retrieves basic profile information for a given user.
 * @private
 *
 * @param user - `GoogleUser` instance to get basic info on.
 */
const getAdditionalUserData = (
  user: GoogleUser,
  fetchBasicProfile: boolean
) => {
  const authResponse = user.getAuthResponse()

  user.tokenObj = authResponse
  user.tokenId = authResponse.id_token
  user.accessToken = authResponse.access_token
  user.expiresAt = authResponse.expires_at

  if (!fetchBasicProfile) return

  const basicProfile = user.getBasicProfile()

  user.googleId = basicProfile.getId()
  user.profileObj = {
    googleId: basicProfile.getId(),
    imageUrl: basicProfile.getImageUrl(),
    email: basicProfile.getEmail(),
    name: basicProfile.getName(),
    givenName: basicProfile.getGivenName(),
    familyName: basicProfile.getFamilyName(),
  }
}

/**
 * React hook for working with the google oAuth client library.
 *
 * @param config - The configuration for your Google authentication flow.
 *
 * @returns The `GoogleUser` instance with properties to work with Google
 * client authentication.
 */
export const useGoogleLogin = ({
  clientId,
  hostedDomain,
  redirectUri,
  scope = 'profile email openid',
  cookiePolicy = 'single_host_origin',
  fetchBasicProfile = true,
  uxMode = 'popup',
  persist = true,
}: HookConfig): HookReturnValue => {
  if (!clientId) throw new Error('clientId is required.')

  const [state, setState] = useState<HookState>({
    googleUser: undefined,
    auth2: undefined,
    isSignedIn: false,
    isInitialized: false,
  })
  const latestAccessTokenRef = useRef<string | undefined>(undefined)
  const latestExpiresAtRef = useRef<number | undefined>(undefined)

  /**
   * Attempts to sign in a user with Google's oAuth2 client.
   * @public
   *
   * @param options - Configutation parameters for GoogleAuth.signIn()
   * @returns The GoogleUser instance for the signed in user.
   */
  const signIn = async (
    options?: gapi.auth2.SigninOptions
  ): Promise<GoogleUser | undefined> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    try {
      const googleUser = await auth2.signIn(options)
      getAdditionalUserData(googleUser, fetchBasicProfile)

      return googleUser
    } catch (err) {
      if (__DEV__)
        console.error('Received error when signing in: ' + err?.details)
      return
    }
  }

  /**
   * Signs out and disconnects the oAuth2 client. Sets `googleUser` to undefined.
   * @public
   *
   * @returns `true` if successful, `false` otherwise.
   */
  const signOut = async (): Promise<boolean> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    if (!auth2) return false

    await auth2.signOut()
    auth2.disconnect()

    return true
  }

  /**
   * Attempts to get permission from the user to access the specified `scopes` offline.
   * If the user grants access, this function will return the `authorizationCode` that
   * can be exchanged for a `refreshToken` on your own server or backend service.
   * @public
   *
   * @remarks
   * You must sign in a user with this function in order to retain access for longer
   * than 1 hour.
   *
   * @param options - Configuration options for granting offline access.
   * @returns The authorization `code` if permission was granted, `undefined` otherwise.
   */
  const grantOfflineAccess = async (
    options?: gapi.auth2.OfflineAccessOptions
  ): Promise<string | undefined> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    try {
      const { code } = await auth2.grantOfflineAccess(options)

      return code
    } catch (err) {
      if (__DEV__)
        console.error(
          'Received error when granting offline access: ' + err?.details
        )
      return
    }
  }

  /**
   * Refreshes the current logged in user's `accessToken`.
   *
   * @remarks
   * To use this function, the user must have signed in via `grantOfflineAccess`.
   *
   * @returns An object containing the new `accessToken` and its corresponding
   * `expiresAt`.
   */
  const refreshUser = async (): Promise<TokenObj | undefined> => {
    try {
      const auth2 = window.gapi.auth2.getAuthInstance()
      const googleUser = auth2.currentUser.get()

      const tokenObj = await googleUser?.reloadAuthResponse()
      if (!tokenObj) {
        if (__DEV__)
          console.error('Something went wrong refreshing the current user.')

        return
      }

      latestAccessTokenRef.current = tokenObj.access_token
      latestExpiresAtRef.current = tokenObj.expires_at

      return {
        accessToken: tokenObj.access_token,
        expiresAt: tokenObj.expires_at,
        idToken: tokenObj.id_token
      }
    } catch (err) {
      if (__DEV__)
        console.error('Received error when refreshing tokens: ' + err?.details)
      return
    }
  }

  /**
   * Callback function passed to Google's auth listener. This is the primary
   * mechanism to keep the hook's state/return values in sync with Google's
   * window `gapi` objects. All stateful logic **should** be performed in
   * here.
   * @private
   *
   * @remarks
   * Due to the way closures work, we cannot access `state` directly
   * in this function. (yay stale closures) Normally we'd instantiate and
   * disconnect the listener on every render so we have the correct `state`
   * values but Google doesn't provide a way to disconnect their listener. Go figure.
   *
   * This function **also** may not be called with the most up-to-date `GoogleUser`.
   * Google decided that `reloadAuthResponse` will invoke this listener, but not
   * actually provide a `googleUser` object with the most up-to-date tokens.
   * In most auth change scenarios this isn't an issue except when refreshing
   * with `refreshUser`.
   *
   * To remedy this, we need to keep a ref that tracks the latest `accessToken`
   * and `expiresAt` values whenever we refresh, and use those instead when they're
   * available since they'll contain the up-to-date values.
   *
   * It's worth noting that we could just use the callback version `setState` here,
   * and update state in `refreshUser`, but this causes causes an additional re-render
   * by setting state twice. React's batching **could* help here, but it is pretty
   * un-deterministic and in my testing wouldn't kick in this particular case.
   *
   * @param googleUser GoogleUser object from the `currentUser` property.
   */
  const handleAuthChange = (googleUser: GoogleUser) => {
    const isSignedIn = googleUser.isSignedIn()
    const auth2 = window.gapi.auth2.getAuthInstance()

    // If `tokenId` is present, we've already performed this step so skip it.
    if (isSignedIn && !googleUser.tokenId)
      getAdditionalUserData(googleUser, fetchBasicProfile)

    setState({
      auth2,
      googleUser: isSignedIn
        ? {
            ...googleUser,
            accessToken: latestAccessTokenRef.current ?? googleUser.accessToken,
            expiresAt: latestExpiresAtRef.current ?? googleUser.expiresAt,
            tokenObj: {
              ...(googleUser.tokenObj as gapi.auth2.AuthResponse),
              access_token:
                latestAccessTokenRef.current ??
                googleUser.tokenObj!.access_token,
              expires_at:
                latestExpiresAtRef.current ?? googleUser.tokenObj!.expires_at,
            },
          }
        : undefined,
      isSignedIn,
      isInitialized: true,
    })
  }

  useExternalScript(DOM_ID, GOOGLE_API_URL, () => {
    const config: gapi.auth2.ClientConfig = {
      client_id: clientId,
      cookie_policy: cookiePolicy,
      hosted_domain: hostedDomain,
      fetch_basic_profile: fetchBasicProfile,
      ux_mode: uxMode,
      redirect_uri: redirectUri,
      scope,
    }

    /**
     * According to Google's documentation:
     *
     * Warning: do not call Promise.resolve() or similar with the result of gapi.auth2.init().
     * The GoogleAuth object returned implements the `then()` method which resolves with itself.
     * As a result, `Promise.resolve()` or `await` will cause infinite recursion.
     */
    const handleLoad = () => {
      window.gapi.auth2.init(config).then(auth2 => {
        const googleUser = auth2.currentUser.get()
        const isSignedIn = googleUser.isSignedIn()
        auth2.currentUser.listen(handleAuthChange)

        if (!persist) {
          signOut()
          return
        }

        if (isSignedIn) getAdditionalUserData(googleUser, fetchBasicProfile)
        setState({ googleUser, auth2, isSignedIn, isInitialized: true })
      })
    }

    window.gapi.load('auth2', handleLoad)
  })

  return {
    ...state,
    signIn,
    signOut,
    grantOfflineAccess,
    refreshUser,
  }
}

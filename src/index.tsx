import { useState } from 'react'

import { useExternalScript } from './useExternalScript'
import { DOM_ID, GOOGLE_API_URL } from './constants'
import { GoogleUser, HookConfig, HookState } from './types'

/**
 * Retrieves basic profile information for a given user.
 * @private
 *
 * @param user - `GoogleUser` instance to get basic info on.
 */
const getAndSetBasicProfile = (user: GoogleUser) => {
  const basicProfile = user.getBasicProfile()
  const authResponse = user.getAuthResponse()

  user.googleId = basicProfile.getId()
  user.tokenObj = authResponse
  user.tokenId = authResponse.id_token
  user.accessToken = authResponse.access_token

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
}: HookConfig) => {
  if (!clientId) throw new Error('clientId is required.')

  const [state, setState] = useState<HookState>({
    googleUser: undefined,
    auth2: undefined,
    isSignedIn: false,
    isInitialized: false,
  })

  /**
   * Attempts to sign in a user with Google's oAuth2 client.
   * @public
   *
   * @param options - Configutation parameters for GoogleAuth.signIn()
   *
   * @returns The GoogleUser instance for the signed in user.
   */
  const signIn = async (
    options?: gapi.auth2.SigninOptions
  ): Promise<GoogleUser | undefined> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    try {
      const googleUser = await auth2.signIn(options)
      if (fetchBasicProfile) getAndSetBasicProfile(googleUser)

      return googleUser
    } catch (err) {
      if (__DEV__) console.error('Received error when signing in: ' + err)
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
   * If the user grant's access, this function will return the `authorizationCode` that
   * can be exchanged for a `refreshToken` on your own server or backend service.
   * @public
   *
   * @param options - Configuration options for granting offline access.
   *
   * @returns The authorization code if permissino was granted, `undefined` otherwise.
   */
  const grantOfflineAccess = async (
    options: gapi.auth2.OfflineAccessOptions
  ): Promise<string | undefined> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    try {
      const { code } = await auth2.grantOfflineAccess(options)

      return code
    } catch (err) {
      if (__DEV__) console.error('Received error when signing in: ' + err)
      return
    }
  }

  /**
   * Callback function passed to Google's auth listener. Updates the hook's
   * state based on the type of auth change event.
   * @private
   *
   * @param googleUser - GoogleUser object for the corresponding user whose
   * auth state has changed.
   */
  const handleAuthChange = (googleUser: gapi.auth2.GoogleUser) => {
    const isSignedIn = googleUser.isSignedIn()
    const auth2 = window.gapi.auth2.getAuthInstance()

    setState({
      auth2,
      googleUser: isSignedIn ? googleUser : undefined,
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

        if (fetchBasicProfile && isSignedIn) getAndSetBasicProfile(googleUser)
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
  }
}

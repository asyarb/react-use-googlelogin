import { useState } from 'react'

import { useExternalScript } from './useExternalScript'
import { DOM_ID, GOOGLE_API_URL } from './constants'
import { GoogleUser, HookConfig, HookState } from './types'

/**
 * React hook for working with the google oAuth client library.
 *
 * @param config - The configuration for your Google auth flow.
 *
 * @returns The `GoogleUser` instance with properties to work with Google client authentication.
 */
export const useGoogleLogin = ({
  clientId,
  hostedDomain,
  redirectUri,
  scope = 'profile email openid',
  cookiePolicy = 'single_host_origin',
  fetchBasicProfile = true,
  autoSignIn = 'none',
  uxMode = 'popup',
  persist = true,
}: HookConfig) => {
  if (!clientId) throw new Error('clientId must be specified.')
  if (!['auto', 'prompt', 'none'].includes(autoSignIn))
    throw new Error('autoSignIn must be of type: "none", "prompt" or "auto"')

  const [state, setState] = useState<HookState>({
    googleUser: null,
    auth2: null,
    isSignedIn: false,
    isInitialized: false,
  })

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
   * Attempts to sign in a user with Google's oAuth2 client.
   * @public
   *
   * @param options - Configutation parameters for GoogleAuth.signIn()
   *
   * @throws Error if using offline access with autoSignIn set to 'auto'.
   * @returns The GoogleUser instance for the signed in user.
   */
  const signIn = async (
    options?: gapi.auth2.SigninOptions
  ): Promise<GoogleUser | null> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    try {
      const googleUser = await auth2.signIn(options)
      if (fetchBasicProfile) getAndSetBasicProfile(googleUser)

      return googleUser as GoogleUser
    } catch {
      return null
    }
  }

  /**
   * Signs out and disconnects the oAuth2 client. Sets `googleUser` to undefined.
   * @public
   *
   * @returns `true` if successful, `undefined` otherwise.
   */
  const signOut = async (): Promise<boolean> => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    if (!auth2) return false

    await auth2.signOut()
    auth2.disconnect()

    return true
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

    setState(state => ({
      ...state,
      googleUser: isSignedIn ? googleUser : null,
      isSignedIn,
    }))
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

    const handleLoad = () => {
      window.gapi.auth2.init(config).then(googleAuth => {
        const auth2 = googleAuth
        const googleUser = auth2.currentUser.get()
        const isSignedIn = googleUser.isSignedIn()

        if (persist && fetchBasicProfile && isSignedIn)
          getAndSetBasicProfile(googleUser)

        setState({ googleUser, auth2, isSignedIn, isInitialized: true })

        auth2.currentUser.listen(handleAuthChange)

        if (autoSignIn === 'prompt') signIn({ prompt: 'select_account' })
        if (autoSignIn === 'auto') signIn({ prompt: 'none' })
      })
    }

    window.gapi.load('auth2', handleLoad)
  })

  return {
    ...state,
    signIn,
    signOut,
  }
}

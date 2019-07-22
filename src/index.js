import { useState, useEffect } from 'react'
import { loadDynamicScript } from './loadDynamicScript'

const GOOGLE_API_URL = 'https://apis.google.com/js/api.js'
const DOM_ID = '___GOOGLE_LOGIN___'

/**
 * Retrieves basic profile information for a given user.
 * @private
 *
 * @param {Object} user - GoogleUser instance to get basic info on.
 *
 * @returns undefined
 */
const getBasicProfile = user => {
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
 * Google oAuth config object
 * @typedef {Object} GoogleConfig
 * @property {string} clientId - clientID from Google's console.
 * @property {string} hostedDomain - G Suite domain to restrict logins to.
 * @property {Array} discoveryDocs
 * @property {string} responseType
 * @property {string} redirectUri - URI to redirect to after auth.
 * @property {string} scope - Scopes to request for.
 * @property {string} accessType - Enum of 'offline' or 'online'.
 * @property {string} cookiePolicy - Specify dfomain to create sign-in cookies.
 * @property {Boolean} fetchBasicProfile - Allow's fetching of user's basic profile info on sign in.
 * @property {string} autoSignIn - Enum of 'none', 'prompt' or 'auto'.
 * @property {string} uxMode - Enum of 'popup' or 'redirect'. Determines the sign in flow.
 */

/**
 * React hook for working with the google oAuth client library.
 *
 * @param {GoogleConfig} config - The {@link GoogleConfig} for your Google auth flow.
 * @returns A destructurable object with keys to work with Google Auth.
 */
export const useGoogleLogin = ({
  clientId,
  hostedDomain,
  discoveryDocs = [],
  responseType,
  redirectUri,
  scope = 'profile email',
  accessType = 'online',
  cookiePolicy = 'single_host_origin',
  fetchBasicProfile = true,
  autoSignIn = 'none',
  uxMode = 'popup',
  persist = true,
}) => {
  const allowedSignInFlows = ['auto', 'prompt', 'none']
  if (!clientId) throw new Error('clientId must be specified.')
  if (!allowedSignInFlows.includes(autoSignIn))
    throw new Error('autoSignIn must be of type: "none", "prompt" or "auto"')

  const [state, setState] = useState(() => ({
    googleUser: undefined,
    isSignedIn: false,
    isInitialized: false,
    auth2: undefined,
  }))

  /**
   * Attempts to sign in a user with Google's oAuth2 client.
   *
   * @param {Object} options - Configutation parameters for GoogleAuth.signIn()
   *
   * @throws Error if using offline access with autoSignIn set to 'auto'.
   * @returns The GoogleUser instance for the signed in user.
   */
  const signIn = async options => {
    const auth2 = window.gapi.auth2.getAuthInstance()
    if (responseType === 'code') return await auth2.grantOfflineAccess(options)

    try {
      const googleUser = await auth2.signIn(options)
      if (fetchBasicProfile) getBasicProfile(googleUser)

      setState(state => ({
        ...state,
        googleUser,
        isSignedIn: googleUser.isSignedIn(),
      }))

      return googleUser
    } catch {
      return undefined
    }
  }

  /**
   * Signs out and disconnects the oAuth2 client. Sets `googleUser` to undefined.
   *
   * @returns true if successful.
   */
  const signOut = async () => {
    const auth2 = window.gapi.auth2.getAuthInstance()

    if (!auth2) return

    await auth2.signOut()
    auth2.disconnect()
    setState(state => ({
      ...state,
      googleUser: undefined,
      auth2: undefined,
      isSignedIn: false,
    }))

    return true
  }

  useEffect(() => {
    loadDynamicScript(DOM_ID, GOOGLE_API_URL, () => {
      const params = {
        client_id: clientId,
        cookie_policy: cookiePolicy,
        hosted_domain: hostedDomain,
        fetch_basic_profile: fetchBasicProfile,
        discoveryDocs,
        ux_mode: uxMode,
        redirect_uri: redirectUri,
        scope,
        access_type: responseType === 'code' ? 'offline' : accessType,
      }

      const handleLoad = async () => {
        const auth2 = await window.gapi.auth2.init(params)
        const googleUser = auth2.currentUser.get()
        const isSignedIn = googleUser.isSignedIn()

        if (persist && fetchBasicProfile && isSignedIn)
          getBasicProfile(googleUser)

        setState(state => ({
          ...state,
          googleUser,
          isInitialized: true,
          auth2,
          isSignedIn,
        }))

        if (autoSignIn === 'prompt') signIn({ prompt: 'select_account' })
        if (autoSignIn === 'auto') signIn({ prompt: 'none' })
      }

      window.gapi.load('auth2', handleLoad)
    })
  }, [])

  return {
    ...state,
    signIn,
    signOut,
  }
}

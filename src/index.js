import { useEffect, useState, useRef } from 'react'

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
}) => {
  const [googleUser, setGoogleUser] = useState(null)
  const googleApi = useRef()

  // Error handling
  const allowedSignInFlows = ['auto', 'prompt', 'none']
  if (!allowedSignInFlows.includes(autoSignIn))
    throw new Error('autoSignIn must be of type: "none", "prompt" or "auto"')
  if (!clientId) throw new Error('clientId must be specified.')

  // Called after a user has been successfully signed in. 'res' is a
  // GoogleAuth() api object that can make API calls based on the
  // scopes provided from hook params.
  const fetchProfileDetails = res => {
    const basicProfile = res.getBasicProfile()
    const authResponse = res.getAuthResponse()

    res.googleId = basicProfile.getId()
    res.tokenObj = authResponse
    res.tokenId = authResponse.id_token
    res.accessToken = authResponse.access_token

    res.profileObj = {
      googleId: basicProfile.getId(),
      imageUrl: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
      name: basicProfile.getName(),
      givenName: basicProfile.getGivenName(),
      familyName: basicProfile.getFamilyName(),
    }
  }

  // Signs in a user with the oAuth2 client and sets the GoogleAuth state.
  // If successful, returns the GoogleAuth object for the associated user.
  const signIn = async () => {
    try {
      const auth2 = googleApi.current.auth2.getAuthInstance()

      if (responseType === 'code') {
        return await auth2.grantOfflineAccess({ prompt: 'select_account' })
      }

      const res = await auth2.signIn({ prompt: 'select_account' })
      setGoogleUser(res)
      fetchProfileDetails(res)

      return res
    } catch {
      return false
    }
  }

  // Clears the googleAuth and googleUser state and disconnects the google api oauth2 client.
  const signOut = async () => {
    if (googleApi.current) {
      const auth2 = googleApi.current.auth2.getAuthInstance()

      if (auth2 !== null) {
        await auth2.signOut()
        auth2.disconnect()
      }

      setGoogleUser(null)
    }
  }

  // Asynchronously retrieves Google's client-side oAuth script and inserts it
  // into the <head> element.
  // Returns: A promise that resolves to the window.gapi object.
  const createGoogleApi = () =>
    new Promise(res => {
      if (document.querySelector('#google-login')) return

      const element = document.createElement('script')
      element.id = 'google-login'
      element.onload = () => res(window.gapi)
      element.src = 'https://apis.google.com/js/api.js'

      document.head.appendChild(element)
    })

  // Initializes an oAuth2 client from the gapi object. If the 'autoSignIn' option is
  // set to 'prompt' or 'auto', this will attempt to automatically authenticate
  // once the oAuth2 client has been initialized.
  const initOAuthClient = () => {
    const params = {
      client_id: clientId,
      cookie_policy: cookiePolicy,
      hosted_domain: hostedDomain,
      fetch_basic_profile: fetchBasicProfile,
      discoveryDocs,
      ux_mode: uxMode,
      redirect_uri: redirectUri,
      scope,
      access_type: accessType,
    }

    if (responseType === 'code') {
      params.access_type = 'offline'
    }

    googleApi.current.load('auth2', async () => {
      try {
        if (!googleApi.current.auth2.getAuthInstance()) {
          const res = await googleApi.current.auth2.init(params)

          if (autoSignIn === 'auto') fetchProfileDetails(res.currentUser.get())
        }

        if (autoSignIn === 'prompt') {
          signIn()
        }
      } catch ({ error, details }) {
        throw new Error(`${error}: ${details}`)
      }
    })
  }

  // Allows for async/await in useEffect()
  const asyncEffect = async () => {
    googleApi.current = await createGoogleApi()
    initOAuthClient()
  }

  useEffect(() => {
    asyncEffect()
  }, [])

  // Hook API
  return {
    googleUser,
    signIn,
    signOut,
    isLoggedIn: Boolean(googleUser),
  }
}

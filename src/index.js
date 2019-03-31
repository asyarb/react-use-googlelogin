import React from 'react'

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
  const [googleUser, setGoogleUser] = React.useState(null)
  const [googleAuthObj, setGoogleAuthObj] = React.useState(null)
  const googleApi = React.useRef()

  const allowedSignInFlows = ['auto', 'prompt', 'none']
  if (!allowedSignInFlows.includes(autoSignIn))
    throw new Error('autoSignIn must be of type: "none", "prompt" or "auto"')

  const handleSigninSuccess = React.useCallback(res => {
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

    setGoogleUser(res)
  }, [])

  const signIn = React.useCallback(async () => {
    const auth2 = googleApi.current.auth2.getAuthInstance()

    if (responseType === 'code') {
      return await auth2.grantOfflineAccess({ prompt: '' })
    }

    const res = await auth2.signIn({ prompt: '' })
    setGoogleAuthObj(res)
    handleSigninSuccess(res)
  }, [responseType, handleSigninSuccess])

  const signOut = async () => {
    if (googleApi.current) {
      const auth2 = googleApi.current.auth2.getAuthInstance()

      if (auth2 !== null) {
        await auth2.signOut()
        auth2.disconnect()
      }

      setGoogleUser(null)
      setGoogleAuthObj(null)
    }
  }

  const createGoogleApi = React.useCallback(
    () =>
      new Promise(res => {
        // First, check if the script has been included already.
        if (document.querySelector('#google-login')) return

        // Otherwise, asynchronously get it.
        const element = document.createElement('script')
        element.id = 'google-login'
        element.onload = () => res(window.gapi)
        element.src = 'https://apis.google.com/js/api.js'

        document.head.appendChild(element)
      }),
    []
  )

  const initOAuthClient = React.useCallback(() => {
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
      if (!googleApi.current.auth2.getAuthInstance()) {
        const res = await googleApi.current.auth2.init(params)

        if (autoSignIn === 'auto' && res.autoSignIn.get())
          handleSigninSuccess(res.currentUser.get())
      }

      if (autoSignIn === 'prompt') {
        signIn()
      }
    })
  }, [
    accessType,
    clientId,
    cookiePolicy,
    discoveryDocs,
    fetchBasicProfile,
    googleApi,
    handleSigninSuccess,
    hostedDomain,
    autoSignIn,
    redirectUri,
    responseType,
    scope,
    signIn,
    uxMode,
  ])

  const asyncEffect = React.useCallback(async () => {
    googleApi.current = await createGoogleApi()
    initOAuthClient()
  }, [createGoogleApi, initOAuthClient])

  React.useEffect(() => {
    asyncEffect()
  }, [asyncEffect])

  return { googleUser, signIn, googleAuthObj, signOut }
}

interface GoogleProfile {
  googleId?: string
  imageUrl?: string
  email?: string
  name?: string
  givenName?: string
  familyName?: string
}

export interface GoogleUser extends gapi.auth2.GoogleUser {
  /**
   * The ID from the Basic Google profile.
   */
  googleId?: string

  /**
   * The raw token object `AuthResponse` from Google.
   */
  tokenObj?: gapi.auth2.AuthResponse

  /**
   * The `id_token` from Google's `AuthResponse`.
   */
  tokenId?: string

  /**
   * The `access_token` from Google's `AuthResponse`.
   */
  accessToken?: string

  /**
   * The full basic profile object from Google. Retrieved if
   * `fetchBasicProfile` is set to `true`.
   */
  profileObj?: GoogleProfile
}

/**
 * Configuration options for the hook.
 * @public
 */
export interface HookConfig {
  /**
   * The clientID for your application from Google's developer console.
   */
  clientId: string

  /**
   * The domains for which to create sign-in cookies. Must be a URI, `single_host_origin`, or `none`.
   *
   * @default `single_host_origin`
   */
  cookiePolicy?: `single_host_origin` | `none` | string

  /**
   * The scopes to request, as a space-delimited string. This option is optional if `fetchBasicProfile` is
   * `false`.
   *
   * @default 'profile email openid'
   */
  scope?: string

  /**
   * Allows fetching of users' basic profile information when they sign in. If using this option,
   * must set the `scope` option to include `profile email openid`.
   *
   * @default `true`
   */
  fetchBasicProfile?: boolean

  /**
   * The G Suite domain to which users must belong to sign in. If blank, all Google accounts can sign in.
   *
   * NOTE: Usage of this option does not GUARANTEE that the user will be from the specified domain, since
   * this could be modified client-side.
   */
  hostedDomain?: string

  /**
   * Enum of either `popup` or `redirect`. If `redirect`, will redirect the user to the uri specified
   * in `redirectUri` after login flow.
   *
   * @default 'popup'
   */
  uxMode?: 'popup' | 'redirect'

  /**
   * If `uxMode` is set to `redirect`, this is the address a user will be sent to after resolving the
   * Google auth flow.
   */
  redirectUri?: string

  /**
   * Toggle whether `googleUser` should be persisted from `sessionStorage` on page refresh.
   */
  persist?: boolean
}

export interface HookState {
  googleUser?: GoogleUser
  auth2?: gapi.auth2.GoogleAuth
  isSignedIn: boolean
  isInitialized: boolean
}

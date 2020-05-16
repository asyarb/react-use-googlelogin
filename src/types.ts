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
   * The raw token object from Google.
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
   * The epoch time in milliseconds that the `accessToken`
   * will expire in.
   */
  expiresAt?: number

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
   * The scopes to request, as a space-delimited string. Optional if `fetchBasicProfile` is `true`.
   *
   * @default 'profile email openid'
   */
  scope?: string

  /**
   * Allows fetching of users' basic profile information when they sign in. If using this option,
   * the `scope` option must include `profile email openid`.
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

export interface TokenObj {
  accessToken: string
  /** Epoch time in milliseconds the `accessToken` will expire. */
  expiresAt: number
}

export interface HookState {
  googleUser?: GoogleUser
  auth2?: gapi.auth2.GoogleAuth
  isSignedIn: boolean
  isInitialized: boolean
}

export interface HookReturnValue extends HookState {
  signIn: (
    options?: gapi.auth2.SigninOptions
  ) => Promise<GoogleUser | undefined>
  signOut: () => Promise<boolean>
  grantOfflineAccess: (
    options?: gapi.auth2.OfflineAccessOptions
  ) => Promise<string | undefined>
  refreshUser: () => Promise<TokenObj | undefined>
}

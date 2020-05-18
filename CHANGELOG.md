# Changelog

All notable changes to this project will be documented in this file. See
[standard-version](https://github.com/conventional-changelog/standard-version)
for commit guidelines.

### [0.12.4](https://github.com/asyarb/react-use-googlelogin/compare/v0.12.3...v0.12.4) (2020-05-18)

### Bug Fixes

- stale closure issue when refreshing user tokens
  ([1be072c](https://github.com/asyarb/react-use-googlelogin/commit/1be072c05192084a5edba73b5d0529fa9a09ed94))

### [0.12.3](https://github.com/asyarb/react-use-googlelogin/compare/v0.12.2...v0.12.3) (2020-05-16)

### Features

- `refreshUser` function
  ([8c418cf](https://github.com/asyarb/react-use-googlelogin/commit/8c418cfe6d6e71ed8f0692ae9afed71369ff3c29))

### [0.12.2](https://github.com/asyarb/react-use-googlelogin/compare/v0.12.1...v0.12.2) (2020-05-16)

### Features

- add `expiresAt` to root GoogleUser
  ([08903ea](https://github.com/asyarb/react-use-googlelogin/commit/08903ea976dec45aa10b5b77814c1657ce251e48))

### [0.12.1](https://github.com/asyarb/react-use-googlelogin/compare/v0.12.0...v0.12.1) (2020-05-13)

### Features

- examples and hook return value type
  ([a35882e](https://github.com/asyarb/react-use-googlelogin/commit/a35882e7cae5134b84bae6ff401c7191a50468b5))
- minimal example
  ([af6229a](https://github.com/asyarb/react-use-googlelogin/commit/af6229a34c7498935b4b1953bff46d046f28b68e))

## [0.12.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.11.2...v0.12.0) (2020-05-12)

### ⚠ BREAKING CHANGES

- Setting `persist` to `false` will now ensure that the user is not persisted on
  page refresh.

Removed `autoSignIn` from config since this use case is handled by `persist`.

### Features

- always get token data
  ([4021e7f](https://github.com/asyarb/react-use-googlelogin/commit/4021e7fafa9b0e65a0268c6ebfd8a743340eefc6))
- grantOfflineAccess function from hook
  ([8ff9a02](https://github.com/asyarb/react-use-googlelogin/commit/8ff9a02f44d913a6d0ac406c33e12a4421c37428))

### Bug Fixes

- crashing when granting offline access
  ([4660c1d](https://github.com/asyarb/react-use-googlelogin/commit/4660c1d03cb90cca6e680a24e007525945711fff))
- only fetch basic profile when needed in handle auth change
  ([eacdbad](https://github.com/asyarb/react-use-googlelogin/commit/eacdbad5f0086b8505bc62ce0e638a28e9e1e32f))
- typo for offline access dev log
  ([46d1feb](https://github.com/asyarb/react-use-googlelogin/commit/46d1feb2b5b352f0f2ae4b4aaaa38b93a50ad8a2))
- typo in code doc
  ([f8d9283](https://github.com/asyarb/react-use-googlelogin/commit/f8d9283f5fe231514800b34d50686b9a1ced8cca))

### [0.11.2](https://github.com/asyarb/react-use-googlelogin/compare/v0.11.1...v0.11.2) (2020-02-29)

### [0.11.1](https://github.com/asyarb/react-use-googlelogin/compare/v0.11.0...v0.11.1) (2019-10-11)

## [0.11.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.10.0...v0.11.0) (2019-09-09)

### ⚠ BREAKING CHANGES

- hook no longer receives discovery docs or access type parameters since they
  were erroneously there

### Features

- conver to typescript
  ([9aa3b25](https://github.com/asyarb/react-use-googlelogin/commit/9aa3b25))
- some type fixes and simple example
  ([473410d](https://github.com/asyarb/react-use-googlelogin/commit/473410d))
- update example
  ([04bbd81](https://github.com/asyarb/react-use-googlelogin/commit/04bbd81))

## [0.10.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.9.0...v0.10.0) (2019-07-22)

### Features

- include browserslist configuration
  ([73cecdb](https://github.com/asyarb/react-use-googlelogin/commit/73cecdb))

### BREAKING CHANGES

- dropped IE11 support

## [0.9.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.8.0...v0.9.0) (2019-07-22)

### Features

- utilize currentUser listener to update hook state
  ([7f6c009](https://github.com/asyarb/react-use-googlelogin/commit/7f6c009))

## [0.8.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.7.0...v0.8.0) (2019-07-22)

### Bug Fixes

- use google's session storage to persist users
  ([06d21d5](https://github.com/asyarb/react-use-googlelogin/commit/06d21d5))

### Features

- sessionStorage persistence
  ([05ddbf8](https://github.com/asyarb/react-use-googlelogin/commit/05ddbf8))
- update deps and move async effect into useEffect
  ([6adde05](https://github.com/asyarb/react-use-googlelogin/commit/6adde05))

## [0.7.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.6.0...v0.7.0) (2019-06-28)

### Bug Fixes

- use Boolean instead of double negation
  ([a3da8d1](https://github.com/asyarb/react-use-googlelogin/commit/a3da8d1))

### Features

- add build step
  ([fbbce42](https://github.com/asyarb/react-use-googlelogin/commit/fbbce42))

## [0.6.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.5.0...v0.6.0) (2019-06-09)

### Features

- cleanup callbacks
  ([1780339](https://github.com/asyarb/react-use-googlelogin/commit/1780339))

## [0.5.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.4.1...v0.5.0) (2019-06-09)

### Features

- update deps
  ([b3d5780](https://github.com/asyarb/react-use-googlelogin/commit/b3d5780))

## [0.4.1](https://github.com/asyarb/react-use-googlelogin/compare/v0.4.0...v0.4.1) (2019-04-10)

# [0.4.0](https://github.com/asyarb/react-use-googlelogin/compare/v0.3.1...v0.4.0) (2019-04-10)

### Features

- cleanup api, add isLoggedIn bool
  ([642ba04](https://github.com/asyarb/react-use-googlelogin/commit/642ba04))
- cleanup api, add isLoggedIn()
  ([a91f144](https://github.com/asyarb/react-use-googlelogin/commit/a91f144))

## [0.3.1](https://github.com/asyarb/react-use-googlelogin/compare/v0.3.0...v0.3.1) (2019-04-07)

### BREAKING CHANGES

- removed `googleAuthObj`, `googleUser` is functionally the same.

### Features

- `signIn()` now returns `googleUser`. Updated readme to reflect

## [0.2.3](https://github.com/asyarb/react-use-googlelogin/compare/v0.2.1...v0.2.3) (2019-03-31)

### Bug Fixes

- update package name
  ([e6b3e52](https://github.com/asyarb/react-use-googlelogin/commit/e6b3e52))

## [0.2.2](https://github.com/asyarb/react-use-googlelogin/compare/v0.2.1...v0.2.2) (2019-03-31)

## [0.2.1](https://github.com/asyarb/react-use-googlelogin/compare/v0.2.0...v0.2.1) (2019-03-31)

# 0.2.0 (2019-03-31)

### Features

- error handling
  ([b31fb1e](https://github.com/asyarb/react-use-googleoauth/commit/b31fb1e))
- init
  ([0472ecd](https://github.com/asyarb/react-use-googleoauth/commit/0472ecd))
- readme and comment code
  ([c7f238a](https://github.com/asyarb/react-use-googleoauth/commit/c7f238a))
- update deps
  ([ca48a94](https://github.com/asyarb/react-use-googleoauth/commit/ca48a94))

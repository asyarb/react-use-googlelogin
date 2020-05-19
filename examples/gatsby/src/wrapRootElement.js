import React from "react"
import { GoogleAuthProvider } from "./components/GoogleAuthProvider"

export const wrapRootElement = ({ element }) => {
  return <GoogleAuthProvider>{element}</GoogleAuthProvider>
}

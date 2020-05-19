import React from 'react'

export const Layout = ({ children }) => {
  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '0 1rem 1.5rem',
      }}
    >
      <main>{children}</main>
    </div>
  )
}

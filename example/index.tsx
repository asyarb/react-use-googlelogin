import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { useResizeObserver } from '../.'

export const Example = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [sizes, setSizes] = useState({ width: '200px', height: '200px' })
  const rect = useResizeObserver({ ref })

  useEffect(() => {
    const interval = setInterval(() => {
      setSizes(sizes => {
        if (sizes.width === '200px') return { width: '100px', height: '100px' }
        else return { width: '200px', height: '200px' }
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        fontFamily: 'system-ui',
      }}
    >
      <div
        ref={ref}
        style={{
          width: sizes.width,
          height: sizes.height,
          backgroundColor: 'blue',
          padding: '3rem',
          transitionProperty: 'width, height',
          transition: 'width .5s ease, height .5s ease',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          width: `${rect.width / 2}px`,
          height: `${rect.height / 2}px`,
          backgroundColor: 'green',
          padding: '3rem',
        }}
      >
        I am always half the size!
      </div>
    </div>
  )
}

ReactDOM.render(<Example />, document.getElementById('root'))

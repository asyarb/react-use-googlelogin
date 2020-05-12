import { useEffect } from 'react'

/**
 * Loads an internal script into a tag under the provided `id`. Useful for libraries
 * such as Stripe checkout and Google maps.
 * @private
 *
 * @param id - ID to give the created DOM node.
 * @param src - URL to load the script from.
 * @param callback - Callback to run when the script is loaded.
 */
export const useExternalScript = (
  id: string,
  src: string,
  callback: () => void
) => {
  useEffect(() => {
    const isLoaded = Boolean(document.getElementById(id))
    if (isLoaded) return

    const script = document.createElement('script')
    script.src = src
    script.id = id

    document.body.appendChild(script)

    if (callback) script.onload = callback
    if (isLoaded && callback) callback()
    // We're missing deps here, but we really only want to call this once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

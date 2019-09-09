/**
 * Allows for runtime loading of an external script. Useful for libraries
 * such as Stripe checkout and google maps.
 * @private
 *
 * @param id - ID to give the created DOM node.
 * @param src - URL to load the script from.
 * @param callback - Callback to run when the script is loaded.
 *
 * @returns `true` if the script at the specified ID has been loaded, undefined otherwise.
 */
export const loadDynamicScript = (
  id: string,
  src: string,
  callback: () => void
) => {
  const isLoaded = Boolean(document.getElementById(id))
  if (isLoaded) return

  const script = document.createElement('script')
  script.src = src
  script.id = id

  document.body.appendChild(script)

  if (callback) script.onload = callback
  if (isLoaded && callback) callback()
}

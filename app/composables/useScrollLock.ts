export const useScrollLock = () => {
  let scrollY = 0

  const lock = () => {
    scrollY = window.scrollY

    document.body.style.position = 'fixed' // Lock whole web element inspect
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'

    // Prevent layout shift (important on desktop)
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.paddingRight = `${scrollbarWidth}px`
  }

  const unlock = () => {
    document.body.style.position = ''  // Unlock whole web element inspect
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''

    window.scrollTo(0, scrollY)

    // Prevent layout shift (important on desktop)
    document.body.style.paddingRight = ''
  }

  return { lock, unlock }
}
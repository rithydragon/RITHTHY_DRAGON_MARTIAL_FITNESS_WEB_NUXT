/**
 * useAnimate — global scroll-triggered animation system using [data-animate].
 * Observes elements with [data-animate] and adds .is-visible when in viewport.
 * Reacts to dynamic DOM changes (page navigation, v-for re-renders, modals).
 */
export function useAnimate() {
  let observer = null
  let mutationObserver = null

  function init() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    )

    // Catch elements added to the DOM after init (route changes, filters, modals)
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      mutationObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue
            if (node.matches?.('[data-animate]:not(.is-visible)')) {
              observer.observe(node)
            }
            node.querySelectorAll?.('[data-animate]:not(.is-visible)').forEach((el) => observer.observe(el))
          }
        }
      })
      mutationObserver.observe(document.body, { childList: true, subtree: true })
    }

    observeAll()
  }

  function observeAll() {
    if (!observer || typeof document === 'undefined') return
    const elements = document.querySelectorAll('[data-animate]:not(.is-visible)')
    elements.forEach((el) => observer.observe(el))
  }

  function refresh() {
    observeAll()
  }

  function cleanup() {
    observer?.disconnect()
    observer = null
    mutationObserver?.disconnect()
    mutationObserver = null
  }

  return {
    init,
    refresh,
    cleanup,
  }
}

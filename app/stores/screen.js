import { defineStore } from 'pinia'

/**
 * Screen / viewport store — tracks breakpoint state reactively.
 * Breakpoints follow the 8px spacing system defined in main.scss.
 */
export const useScreenStore = defineStore('screen', {
  state: () => ({
    width: 0,
    height: 0,
    scrollY: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isScrolled: false,
  }),

  getters: {
    breakpoint: (state) => {
      if (state.width < 640) return 'xs'
      if (state.width < 768) return 'sm'
      if (state.width < 1024) return 'md'
      if (state.width < 1280) return 'lg'
      return 'xl'
    },
    isTouch: (state) => state.width < 1024,
    isMenuOpen: (state) => state._menuOpen,
  },

  actions: {
    init() {
      if (typeof window === 'undefined') return
      this.update()
      window.addEventListener('resize', this.update, { passive: true })
      window.addEventListener('scroll', this.onScroll, { passive: true })
    },

    update() {
      if (typeof window === 'undefined') return
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.isMobile = this.width < 768
      this.isTablet = this.width >= 768 && this.width < 1024
      this.isDesktop = this.width >= 1024
    },

    onScroll() {
      if (typeof window === 'undefined') return
      this.scrollY = window.scrollY
      this.isScrolled = this.scrollY > 60
    },

    cleanup() {
      if (typeof window === 'undefined') return
      window.removeEventListener('resize', this.update)
      window.removeEventListener('scroll', this.onScroll)
    },
  },
})

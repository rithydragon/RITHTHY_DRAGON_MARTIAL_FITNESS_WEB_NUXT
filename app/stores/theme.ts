import { defineStore } from 'pinia'

export type ThemeMode = 'dark' | 'light' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolved: 'dark' | 'light'
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    mode: 'dark',
    resolved: 'dark',
  }),

  getters: {
    isDark: (state) => state.resolved === 'dark',
    isLight: (state) => state.resolved === 'light',
  },

  actions: {
    init() {
      const stored = this.getStored()
      if (stored) this.mode = stored
      this.resolve()
      this.apply()

      if (typeof window !== 'undefined') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.mode === 'system') {
            this.resolve()
            this.apply()
          }
        })
      }
    },

    setMode(mode: ThemeMode) {
      this.mode = mode
      this.resolve()
      this.apply()
      this.persist()
    },

    toggle() {
      this.setMode(this.resolved === 'dark' ? 'light' : 'dark')
    },

    resolve() {
      if (this.mode === 'system') {
        if (typeof window !== 'undefined') {
          this.resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
          this.resolved = 'dark'
        }
      } else {
        this.resolved = this.mode
      }
    },

    apply() {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      root.classList.remove('dark', 'light')
      root.classList.add(this.resolved)
      root.setAttribute('data-theme', this.resolved)
    },

    getStored(): ThemeMode | null {
      if (typeof localStorage === 'undefined') return null
      return (localStorage.getItem('rmf-theme') as ThemeMode) || null
    },

    persist() {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem('rmf-theme', this.mode)
    },
  },
})

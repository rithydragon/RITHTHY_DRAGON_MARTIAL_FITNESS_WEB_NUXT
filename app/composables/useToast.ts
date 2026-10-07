import { string } from "zod"

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'type'
export type ToastColor = 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'purple' | 'color'

export interface ToastMessage {
  id: number
  title: string
  message?: string
  description?: string
  type: ToastType
  color: ToastColor
  icon?: string
  timeout?: number
}

const toasts = ref<ToastMessage[]>([])
let nextId = 0

export const useToast = () => {
  const add1 = (
    toast: Omit<ToastMessage, 'id'>,
    duration: number = 5000
  ) => {
    const id = nextId++
    toasts.value.push({ ...toast, id })

    if (duration > 0) {
      setTimeout(() => {
        // removeToast(id)
        setTimeout(() => removeToast(id), duration)
      }, duration)
    }

    return id
  }

  const add = (
    toast: {
      title: string
      message?: string
      description: string
      color?: ToastColor
      icon?: string
      type: ToastType
      timeout?: number
    }
  ) => {
    const id = nextId++
    toasts.value.push({
      id,
      title: toast.title,
      message: toast.message,
      description: toast.description,
      color: toast.color || 'blue',
      type: toast.type || 'info',
      icon: toast.icon || 'ri-information-line',
      timeout: toast.timeout ?? 4500
    })

    return id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // =========================
  // ✅ SHORTCUTS (ADDED)
  // =========================

  const success = (title: string, message: string, description?: string, type?: ToastType, color?: ToastColor, duration = 4000) =>
    add({ title, message, description, icon: 'ri-check-line', type: type || 'success', color: color || 'green' }, duration)

  const error = (title: string, message: string, description?: string, color?: ToastColor, type?: ToastType, duration = 6000) =>
    add({ title, message, description, icon: 'ri-close-circle-line', type: type || 'error', color: color || 'red' }, duration)

  const warning = (title: string, message: string, description?: string, color?: ToastColor, type?: ToastType, duration = 5000) =>
    add({ title, message, description, icon: 'ri-error-warning-line', type: type || 'warning', color: color || 'amber' }, duration)

  const info = (title: string, message?: string, description?: string, color?: ToastColor, type?: ToastType, duration = 4000) =>
    add({ title, message, description, icon: 'ri-information-line', type: type || 'info', color: color || 'blue' }, duration)

  return {
    toasts: readonly(toasts),
    add,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
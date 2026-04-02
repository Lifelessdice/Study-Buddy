import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let nextId = 1

export function pushToast({ type = 'info', title = '', message = '', timeout = 3500 }) {
  const id = nextId++
  state.toasts.push({ id, type, title, message })

  if (timeout && timeout > 0) {
    setTimeout(() => removeToast(id), timeout)
  }
}

export function removeToast(id) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx !== -1) state.toasts.splice(idx, 1)
}

export function notifySuccess(message, title = 'Success') {
  pushToast({ type: 'success', title, message })
}

export function notifyError(message, title = 'Error') {
  pushToast({ type: 'error', title, message })
}

export function notifyInfo(message, title = 'Info') {
  pushToast({ type: 'info', title, message })
}

export function useToasts() {
  return state
}

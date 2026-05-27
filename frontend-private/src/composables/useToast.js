import { readonly, ref } from 'vue'

let idCounter = 1
const toastsState = ref([])

function removeToast(id) {
  toastsState.value = toastsState.value.filter((t) => t.id !== id)
}

function toast(message, type = 'default') {
  const id = idCounter++
  toastsState.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 3000)
}

export function useToast() {
  return {
    toasts: readonly(toastsState),
    toast,
    removeToast,
  }
}

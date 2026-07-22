import { ref, watch, onBeforeUnmount } from 'vue'

export function useDebouncedValue(source, delay = 300) {
  const debounced = ref(source.value)
  let timer = null

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return debounced
}
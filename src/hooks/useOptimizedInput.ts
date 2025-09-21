import { useCallback, useRef, useState } from 'react'

/**
 * Hook to optimize input performance on mobile devices
 * Reduces input latency by debouncing and optimizing re-renders
 */
export function useOptimizedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    
    // Update immediately for better UX
    setValue(newValue)
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounce any side effects (like validation)
    timeoutRef.current = setTimeout(() => {
      // Any expensive operations can go here
    }, 100)
  }, [])

  const handleFocus = useCallback(() => {
    // Force hardware acceleration on focus
    if (inputRef.current) {
      inputRef.current.style.transform = 'translateZ(0)'
      inputRef.current.style.willChange = 'transform'
    }
  }, [])

  const handleBlur = useCallback(() => {
    // Clean up after blur
    if (inputRef.current) {
      inputRef.current.style.willChange = 'auto'
    }
  }, [])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    value,
    setValue,
    inputRef,
    handleChange,
    handleFocus,
    handleBlur,
    cleanup
  }
}

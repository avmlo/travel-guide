'use client'
import { useState, useCallback } from 'react'

export function useComposition() {
  const [isComposing, setIsComposing] = useState(false)
  const onCompositionStart = useCallback(() => setIsComposing(true), [])
  const onCompositionEnd = useCallback(() => setIsComposing(false), [])
  return { isComposing, onCompositionStart, onCompositionEnd }
}



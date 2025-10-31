'use client'
import { useEffect, useRef } from 'react'

export function useInfiniteScroll({ onLoadMore, hasMore, isLoading, threshold = 400 }: {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!hasMore || isLoading) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting) onLoadMore()
    }, { rootMargin: `${threshold}px` })
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, isLoading, onLoadMore, threshold])
  return ref
}



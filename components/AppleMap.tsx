'use client';

import { useEffect, useRef, useState } from 'react'

type PlaceInput = {
  name: string
  city?: string
}

interface AppleMapProps {
  places: PlaceInput[]
  className?: string
  onSelectPlace?: (index: number) => void
}

declare global {
  interface Window {
    mapkit?: any
  }
}

export function AppleMap({ places, className, onSelectPlace }: AppleMapProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function ensureMapkit() {
      if (window.mapkit) return
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js'
        s.async = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('Failed to load mapkit'))
        document.head.appendChild(s)
      })
    }

    async function init() {
      try {
        await ensureMapkit()
        if (cancelled) return

        // Authorization callback fetches a short-lived JWT from our API
        window.mapkit.init({
          authorizationCallback: function (done: (token: string) => void) {
            fetch('/api/mapkit-token')
              .then(r => r.text())
              .then(token => done(token))
              .catch(() => done(''))
          },
        })

        setReady(true)
      } catch {
        setReady(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !ref.current || !window.mapkit) return

    const map = new window.mapkit.Map(ref.current, {
      showsUserLocationControl: false,
      showsCompass: window.mapkit.FeatureVisibility.Hidden,
      showsZoomControl: true,
    })

    const geocoder = new window.mapkit.Geocoder({ language: 'en' })
    const annotations: any[] = []
    const group = new window.mapkit.AnnotationGroup([])

    // Helper to add an annotation
    function addAnnotation(coord: any, title: string, idx: number) {
      const ann = new window.mapkit.MarkerAnnotation(coord, { title })
      ann.color = '#111111'
      ann.glyphText = '•'
      ann.selected = false
      ann.addEventListener('select', () => onSelectPlace?.(idx))
      annotations.push(ann)
    }

    // Geocode each place
    const lookups = places.map((p, idx) => {
      const q = [p.name, p.city].filter(Boolean).join(' ')
      return new Promise<void>((resolve) => {
        geocoder.lookup(q, (err: any, data: any) => {
          if (!err && data && data.results && data.results[0]) {
            const coord = data.results[0].coordinate
            addAnnotation(coord, p.name, idx)
          }
          resolve()
        })
      })
    })

    Promise.all(lookups).then(() => {
      if (annotations.length > 0) {
        group.annotations = annotations
        map.addAnnotationGroup(group)
        const rect = window.mapkit.AnnotationGroup.boundingMapRectForAnnotations(annotations)
        if (rect && !rect.isEmpty()) {
          map.setVisibleMapRect(rect, true)
        }
      }
    })

    return () => {
      try {
        map.removeAnnotationGroup(group)
      } catch {}
    }
  }, [ready, places, onSelectPlace])

  return <div ref={ref} className={className} />
}



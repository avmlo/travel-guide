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
  const [failed, setFailed] = useState<string | null>(null)

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
              .then(r => {
                if (!r.ok) throw new Error('Bad token response')
                return r.text()
              })
              .then(token => {
                if (!token) throw new Error('Empty token')
                done(token)
              })
              .catch((e) => {
                setFailed('token')
                done('')
              })
          },
        })

        setReady(true)
      } catch (e) {
        setReady(false)
        setFailed('init')
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready || !ref.current || !window.mapkit) return

    let map: any
    try {
      map = new window.mapkit.Map(ref.current, {
        showsUserLocationControl: false,
        showsCompass: window.mapkit.FeatureVisibility.Hidden,
        showsZoomControl: true,
      })
    } catch (e) {
      setFailed('map')
      return
    }

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
    const lookups = (places || []).map((p, idx) => {
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

  if (failed) {
    const q = places && places[0] ? [places[0].name, places[0].city].filter(Boolean).join(' ') : 'Places'
    return (
      <div className={`flex items-center justify-center ${className || ''}`}>
        <a
          href={`https://maps.apple.com/?q=${encodeURIComponent(q)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          Open in Apple Maps
        </a>
      </div>
    )
  }

  return <div ref={ref} className={className} />
}



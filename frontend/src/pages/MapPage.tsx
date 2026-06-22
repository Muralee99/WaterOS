import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GlassCard } from '@/components/ui/GlassCard'
import { reservoirApi } from '@/services/api'
import type { Reservoir } from '@/types'

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  const { data: reservoirs } = useQuery({
    queryKey: ['reservoirs'],
    queryFn: () => reservoirApi.list().then((r) => r.data),
  })

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      if (reservoirs) {
        reservoirs.forEach((r: Reservoir) => {
          if (r.latitude && r.longitude) {
            const color = r.fill_percentage > 85 ? '#EF4444' :
                          r.fill_percentage > 70 ? '#F59E0B' : '#3B82F6'

            const marker = L.circleMarker([r.latitude, r.longitude], {
              radius: 10,
              fillColor: color,
              color: color,
              weight: 2,
              opacity: 0.9,
              fillOpacity: 0.7,
            }).addTo(map)

            marker.bindPopup(`
              <div style="background:#0d1117;color:#e2e8f0;padding:12px;border-radius:8px;min-width:200px;font-family:sans-serif">
                <h3 style="margin:0 0 8px;font-size:14px;color:#60a5fa">${r.name}</h3>
                <p style="margin:2px 0;font-size:12px">📍 ${r.location}</p>
                <p style="margin:2px 0;font-size:12px">💧 Level: ${r.fill_percentage?.toFixed(1)}%</p>
                <p style="margin:2px 0;font-size:12px">⬆️ Inflow: ${r.inflow_rate} m³/s</p>
                <p style="margin:2px 0;font-size:12px">⬇️ Outflow: ${r.outflow_rate} m³/s</p>
                <p style="margin:2px 0;font-size:12px">⚠️ Risk: ${r.overflow_risk}</p>
              </div>
            `, { className: 'leaflet-dark-popup' })
          }
        })
      }

      // Add legend
      const legend = new (L.Control.extend({
        onAdd() {
          const div = L.DomUtil.create('div')
          div.innerHTML = `
            <div style="background:rgba(13,17,23,0.9);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;font-family:sans-serif;font-size:11px;color:#94a3b8">
              <p style="color:#e2e8f0;font-weight:600;margin:0 0 8px">Reservoir Levels</p>
              <div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="width:10px;height:10px;border-radius:50%;background:#EF4444;display:inline-block"></span>Critical (>85%)</div>
              <div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="width:10px;height:10px;border-radius:50%;background:#F59E0B;display:inline-block"></span>Warning (70-85%)</div>
              <div style="display:flex;align-items:center;gap:6px;margin:3px 0"><span style="width:10px;height:10px;border-radius:50%;background:#3B82F6;display:inline-block"></span>Normal (<70%)</div>
            </div>
          `
          return div
        },
      }))({ position: 'bottomright' })
      legend.addTo(map)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [reservoirs])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">World Map</h1>
        <p className="text-sm text-slate-500 mt-0.5">Interactive map showing reservoirs, sensors, and real-time conditions</p>
      </div>

      <GlassCard className="overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div ref={mapRef} className="w-full h-full" />
      </GlassCard>
    </div>
  )
}

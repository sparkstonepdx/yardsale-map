import { onMount, onCleanup, createEffect } from 'solid-js'
import { noShadowDOM } from 'solid-element'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet-fullscreen'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'

import { config, records, raw, isConfigured } from './store'
import { getSellingItems, toStringArray } from './utils/config'
import { type YardSaleRecord } from './utils/sheets'
import { capitalize } from './utils/string'

const DEFAULT_ACCENT = 'oklch(0.7053 0.117868 171.5664)'

const zoomRadii: Record<number, number> = {
  12: 50,
  13: 40,
  14: 30,
  15: 30,
  16: 25,
  17: 20,
}

function popupHtml(record: YardSaleRecord): string {
  const items = getSellingItems(record, config)
  return `
    <div>
      <h2>Selling</h2>
      <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
    </div>`
}

export default function YardSaleMap() {
  noShadowDOM()

  const status = () =>
    !isConfigured()
      ? ''
      : raw.loading
      ? 'Loading data from Google Sheets...'
      : raw.error
      ? 'Error loading data from Google Sheets.'
      : `Loaded ${records().length} locations.`

  let el!: HTMLDivElement
  let map: L.Map | undefined
  let clusterGroup: L.MarkerClusterGroup | undefined
  let boundaryLayer: L.FeatureGroup | undefined

  onMount(() => {
    map = L.map(el, {
      fullscreenControl: true,
    } as L.MapOptions & { fullscreenControl: boolean }).setView([20, 0], 2)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map)

    clusterGroup = L.markerClusterGroup({
      maxClusterRadius: zoom => (zoom > 16 ? 20 : zoomRadii[zoom] ?? 80),
    })
    map.addLayer(clusterGroup)
  })

  // (Re)draw boundaries when the configured URLs or accent change.
  createEffect(() => {
    const urls = toStringArray(config.boundsUrls)
    const color = config.accentColor.trim() || DEFAULT_ACCENT
    if (!map) return
    void drawBounds(urls, color)
  })

  async function drawBounds(urls: string[], color: string) {
    const group = L.featureGroup()
    if (!map) return
    for (const url of urls) {
      const geojson = await fetch(url).then(r => r.json())
      group.addLayer(
        L.geoJSON(geojson, {
          filter: feature =>
            feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon',
          onEachFeature: (feature, featureLayer) => {
            if (feature.properties?.NAME) {
              featureLayer.bindTooltip(capitalize(feature.properties.NAME), {
                permanent: true,
                direction: 'center',
                className: 'ys-area-label',
              })
            }
          },
          style: () => ({ color, weight: 2, fillColor: color, fillOpacity: 0.2 }),
        }),
      )
    }
    if (boundaryLayer) map.removeLayer(boundaryLayer)
    boundaryLayer = group
    group.addTo(map)
    if (!records()?.length) {
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }

  // Re-render markers whenever the visible records change.
  createEffect(() => {
    const list = records()
    if (!clusterGroup || !map) return

    clusterGroup.clearLayers()
    const markers: L.Marker[] = []

    for (const record of list) {
      const lat = parseFloat(record.Latitude ?? '')
      const lng = parseFloat(record.Longitude ?? '')
      if (Number.isNaN(lat) || Number.isNaN(lng)) continue

      const marker = L.marker([lat, lng]).bindPopup(popupHtml(record))
      clusterGroup.addLayer(marker)
      markers.push(marker)
    }

    if (markers.length > 0) {
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.1))
    }
  })

  onCleanup(() => map?.remove())

  return (
    <>
      <div class="ys-status">{status()}</div>
      <div class="ys-map" ref={el} />
    </>
  )
}

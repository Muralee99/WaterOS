declare module 'react-simple-maps' {
  import { ComponentType, ReactNode, MouseEvent } from 'react'

  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: Record<string, unknown>
    style?: Record<string, unknown>
    children?: ReactNode
  }
  export const ComposableMap: ComponentType<ComposableMapProps>

  export interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    maxZoom?: number
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void
    children?: ReactNode
  }
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>

  export interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: Geography[] }) => ReactNode
  }
  export const Geographies: ComponentType<GeographiesProps>

  export interface Geography {
    rsmKey: string
    id: string
    properties: Record<string, unknown>
  }

  export interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: { default?: object; hover?: object; pressed?: object }
    onMouseEnter?: (e: MouseEvent<SVGPathElement>) => void
    onMouseMove?: (e: MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (e: MouseEvent<SVGPathElement>) => void
    onClick?: (e: MouseEvent<SVGPathElement>) => void
  }
  export const Geography: ComponentType<GeographyProps>
}

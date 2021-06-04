import { useEffect, useRef, useState } from 'react'
import { ResizeObserver } from '@juggle/resize-observer'

const combineChartDimensions = (dimensions: any) => {
  const parsedDimensions = {
      ...dimensions,
  }
  return {
      ...parsedDimensions,
      boundedHeight: Math.max(
        parsedDimensions.height
        - parsedDimensions.marginTop
        - parsedDimensions.marginBottom,
        0,
      ),
      boundedWidth: Math.max(
        parsedDimensions.width
        - parsedDimensions.marginLeft
        - parsedDimensions.marginRight,
        0,
      ),
  }
}

export const useChartDimensions = (passedSettings: any) => {
  const ref = useRef()
  const dimensions = combineChartDimensions(
    passedSettings
  )
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  useEffect(() => {
      if (dimensions.width && dimensions.height)
        return;
      const element = ref.current
      const resizeObserver = new ResizeObserver(
        (entries: any) => {
          if (!Array.isArray(entries)) return
          if (!entries.length) return
          const entry = entries[0]
          if (width != entry.contentRect.width)
            setWidth(entry.contentRect.width)
          if (height != entry.contentRect.height)
            setHeight(entry.contentRect.height)
        }
      )
      resizeObserver.observe(element as any)
      return () => resizeObserver.unobserve(element as any)
  }, [])
  const newSettings = combineChartDimensions({
      ...dimensions,
      width: dimensions.width || width,
      height: dimensions.height || height,
  })
  return [ref, newSettings]
}
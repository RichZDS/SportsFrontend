import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export default function Chart({ options, style }) {
  const ref = useRef(null)
  const chartRef = useRef(null)
  useEffect(() => {
    if (!chartRef.current) {
      chartRef.current = echarts.init(ref.current)
      const handler = () => chartRef.current && chartRef.current.resize()
      window.addEventListener('resize', handler)
    }
    chartRef.current.setOption(options || {})
    return () => {}
  }, [options])
  return <div ref={ref} style={style || { height: 360 }} />
}

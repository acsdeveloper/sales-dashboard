'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false })

interface DataRow {
  Level1: string
  Level2: string
  Amount: number
}

export default function SunburstChart({ data }: { data: DataRow[] }) {
  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        tooltip: { formatter: '' },
        series: [{ type: 'sunburst', data: [{ name: 'No Data' }] }],
      }
    }

    const hierarchyMap: Record<string, Record<string, number>> = {}

    data.forEach(row => {
      if (!hierarchyMap[row.Level1]) hierarchyMap[row.Level1] = {}
      hierarchyMap[row.Level1][row.Level2] = (hierarchyMap[row.Level1][row.Level2] || 0) + row.Amount
    })

    const sunburstData = [
      {
        name: 'Spend',
        children: Object.entries(hierarchyMap).map(([level1, level2s]) => ({
          name: level1,
          children: Object.entries(level2s).map(([level2, amount]) => ({
            name: level2,
            value: amount,
          })),
        })),
      },
    ]

    return {
      tooltip: {
        formatter: (params: any) => {
          return `${params.name}: $${(params.value / 1000).toFixed(1)}K`
        },
      },
      series: [{
        type: 'sunburst',
        data: sunburstData,
        radius: [0, '90%'],
        label: { rotate: 'radial', show: false
         },
      }],
    }
  }, [data])

  return <EChartsReact option={option} style={{ height: '300px' }} />
}

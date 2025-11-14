'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'

const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false })

interface DataRow {
  Level1: string
  Level2: string
  Level3: string
  Amount: number
}

export default function TreemapChart({ data }: { data: DataRow[] }) {
  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        tooltip: { formatter: '' },
        series: [{ type: 'treemap', data: [] }],
      }
    }

    // Build hierarchical data structure: Level1 -> Level2 -> Level3
    const hierarchyMap: Record<string, Record<string, Record<string, number>>> = {}

    data.forEach(row => {
      if (!hierarchyMap[row.Level1]) {
        hierarchyMap[row.Level1] = {}
      }
      if (!hierarchyMap[row.Level1][row.Level2]) {
        hierarchyMap[row.Level1][row.Level2] = {}
      }
      hierarchyMap[row.Level1][row.Level2][row.Level3] = 
        (hierarchyMap[row.Level1][row.Level2][row.Level3] || 0) + row.Amount
    })

    // Build tree data with Level1 as root - WITHOUT expanding Level2 children initially
    const treeData = Object.entries(hierarchyMap).map(([level1Name, level2s]) => {
      const level1Total = Object.entries(level2s).reduce((sum, [_, level3s]) => {
        return sum + Object.values(level3s).reduce((l3sum, val) => l3sum + val, 0)
      }, 0)

      const level2Children = Object.entries(level2s).map(([level2Name, level3s]) => {
        const level2Total = Object.values(level3s).reduce((sum, val) => sum + val, 0)
        
        const level3Children = Object.entries(level3s).map(([level3Name, amount]) => ({
          name: level3Name,
          value: amount,
        }))

        return {
          name: level2Name,
          value: level2Total,
          children: level3Children,
        }
      })

      return {
        name: level1Name,
        value: level1Total,
        children: level2Children,
      }
    })

    return {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          return `${params.name}: $${(params.value / 1000).toFixed(1)}K`
        },
      },
      breadcrumb: {
        textStyle: {
          color: '#666',
        },
        itemStyle: {
          borderColor: 'transparent',
          textBorderColor: 'transparent',
        },
      },
      series: [{
        type: 'treemap',
        data: treeData,
        label: { show: true },
        itemStyle: {
          borderRadius: 4,
        },
        leafDepth: 1,
        levels: [
          {
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1,
              gapWidth: 1,
            },
            upperLabel: {
              show: true,
            },
          },
          {
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1,
              gapWidth: 1,
            },
          },
          {
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1,
              gapWidth: 1,
            },
          },
        ],
      }],
    }
  }, [data])

  return (
    <div className="w-full">
      <EChartsReact
        option={option}
        style={{ height: '300px' }}
      />
    </div>
  )
}

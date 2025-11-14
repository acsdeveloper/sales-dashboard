'use client'

import { useMemo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false })

// Updated interface to match your SpendRow type
interface SpendRow {
  PortCo: string  // Changed from number to string
  Invoice: string
  PONo: string
  Date: string
  Supplier: string
  Country: string
  Level1: string
  Level2: string
  Level3: string
  Amount: number
}

interface CountryCoordinates {
  [key: string]: [number, number]
}

const COUNTRY_COORDINATES: CountryCoordinates = {
  USA: [-95.7129, 37.0902],
  UK: [-3.436, 55.3781],
  France: [2.2137, 46.2276],
  Germany: [10.4515, 51.1657],
  Japan: [138.2529, 36.2048],
  China: [104.1954, 35.8617],
  India: [78.9629, 20.5937],
  Canada: [-106.3468, 56.1304],
  Australia: [133.7751, -25.2744],
  Brazil: [-51.9253, -14.235],
  Mexico: [-102.5528, 23.6345],
  Spain: [-3.7492, 40.4637],
  Italy: [12.5674, 41.8719],
  Denmark: [9.5018, 56.2639],
  Netherlands: [5.2913, 52.1326],
  Switzerland: [8.2275, 46.8182],
  Sweden: [18.6435, 60.1282],
  Norway: [8.4689, 60.472],
  NewZealand: [174.886, -40.9006],
  Thailand: [100.9925, 15.87],
  Argentina: [-63.6167, -38.4161],
  Belgium: [4.4699, 50.5039],
  Singapore: [103.8198, 1.3521],
  'South Korea': [127.078, 37.5665],
  Malaysia: [101.6964, 4.2105],
  Chile: [-71.543, -35.6751],
  Austria: [14.5501, 47.5162],
  Poland: [19.1451, 51.9194],
  Portugal: [-8.2245, 39.3999],
  Greece: [21.8243, 39.0742],
}

// Define colors for different categories
const CATEGORY_COLORS: Record<string, string> = {
  'Groceries': '#5470c6',
  'Electronics': '#91cc75',
  'Travel': '#fac858',
  'Featured': '#ee6666',
  'Apparel & Fashion': '#6355a7ff',
  'Apparel & Dashion': '#3ba272',
  'Home & Utilities': '#fc8452',
  'Health & Wellness': '#9a60b4',
  'Automotive': '#ea7ccc',
  'Entertainment': '#5470c6',
  'Dining & Restaurants': '#75ccbfff',
  'Personal Care': '#505372',
}

export default function WorldMapChart({ data, categoryLevel = 'Level1' }: { 
  data: SpendRow[], 
  categoryLevel?: 'Level1' | 'Level2' | 'Level3' 
}) {
  const [mapData, setMapData] = useState<any>(null)
  const [echartsLib, setEchartsLib] = useState<any>(null)

  useEffect(() => {
    fetch('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95368/world.json')
      .then(res => res.json())
      .then(json => setMapData(json))
      .catch(err => console.error('Map loading failed:', err))
  }, [])

  useEffect(() => {
    if (!echartsLib) {
      import('echarts').then(mod => setEchartsLib(mod))
    }
  }, [echartsLib])

  useEffect(() => {
    if (echartsLib && mapData) {
      echartsLib.registerMap('world', mapData)
    }
  }, [echartsLib, mapData])

  const option = useMemo(() => {
    if (!data || !mapData) {
      return {
        geo: {
          map: 'world',
          roam: true,
          itemStyle: { areaColor: '#e7e8ea' },
        },
        series: [],
      }
    }

    // Group data by country and category (using the specified level)
    const countryCategoryData: Record<string, Record<string, number>> = {}
    const countryTotals: Record<string, number> = {}

    data.forEach(row => {
      const category = row[categoryLevel]
      
      if (!countryCategoryData[row.Country]) {
        countryCategoryData[row.Country] = {}
        countryTotals[row.Country] = 0
      }
      
      countryCategoryData[row.Country][category] = 
        (countryCategoryData[row.Country][category] || 0) + row.Amount
      countryTotals[row.Country] += row.Amount
    })

    // Create pie series for each country
    const pieSeries = Object.entries(countryCategoryData)
      .filter(([country]) => COUNTRY_COORDINATES[country])
      .map(([country, categories]) => {
        const coords = COUNTRY_COORDINATES[country]
        const total = countryTotals[country]
        
        // Calculate radius based on total amount
        const radius = Math.min(Math.max(total / 50000, 10), 25)

        // Prepare pie data
        const pieData = Object.entries(categories).map(([category, value]) => ({
          name: category,
          value: value,
          itemStyle: {
            color: CATEGORY_COLORS[category] || '#999'
          }
        }))

        return {
          type: 'pie',
          coordinateSystem: 'geo',
          radius: radius,
          center: coords,
          tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
              const percentage = ((params.value / total) * 100).toFixed(2)
              return `${params.name}: $${(params.value / 1000).toFixed(1)}K (${percentage}%)`
            }
          },
          label: { show: false },
          labelLine: { show: false },
          data: pieData,
          animation: false
        }
      })

    // Get all unique categories for the legend
    const allCategories = new Set<string>()
    data.forEach(row => allCategories.add(row[categoryLevel]))

    return {
      backgroundColor: 'transparent',
      
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesType === 'pie') {
            const total = params.data.data.reduce((sum: number, item: any) => sum + item.value, 0)
            const percentage = ((params.value / total) * 100).toFixed(2)
            return `${params.name}: $${(params.value / 1000).toFixed(1)}K (${percentage}%)`
          }
          return params.name
        }
      },

      legend: {
        data: Array.from(allCategories),
        bottom: 10,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 12
        }
      },

      geo: {
        map: 'world',
        roam: true,
        silent: false,
        itemStyle: { 
          areaColor: '#f5f5f5', 
          borderColor: '#ddd' 
        },
        emphasis: { 
          itemStyle: { 
            areaColor: '#e0e0e0' 
          } 
        },
      },

      series: pieSeries,
    }
  }, [data, mapData, categoryLevel])

  if (!mapData) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500">Loading map…</p>
      </div>
    )
  }

  return <EChartsReact option={option} style={{ height: '300px' }} />
}
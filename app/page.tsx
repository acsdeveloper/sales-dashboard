'use client'

import { useState, useMemo, useEffect } from 'react'
import { parseData, SpendRow } from '@/lib/data-processor'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import KPICards from '@/components/kpi-cards'
import FilterBar from '@/components/filter-bar'
import TreemapChart from '@/components/charts/treemap-chart'
import SunburstChart from '@/components/charts/sunburst-chart'
// import WorldMapChart from '@/components/charts/world-map-chart'
import HeatmapChart from '@/components/charts/heatmap-chart'
import CategoryMapChart from '@/components/charts/world-map-chart'

export default function DashboardPage() {
  const [filters, setFilters] = useState<Record<string, any[]>>({
    companies: [],
    suppliers: [],
    countries: [],
    categories: [],
    years: [],
  })
  const [data, setData] = useState<SpendRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'https://script.google.com/macros/s/AKfycbwQ_3405W9_LhRlyhTeRpCz8WeT7_0_oBHu86ANxL4ZpssAo3_n6e3hIyj6_rDKRY1bow/exec',
          { 
            method: 'GET',
            mode: 'cors',
          }
        )
        
        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`)
        }
        
        const result = await response.json()
        
        
        // Parse the data - handles both array and CSV formats
        const parsedData = parseData(result)
        
        setData(parsedData)
        setError(null)
      } catch (err) {
        setError('Failed to fetch data from API')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.companies.length && !filters.companies.includes(row.PortCo)) return false
      if (filters.suppliers.length && !filters.suppliers.includes(row.Supplier)) return false
      if (filters.countries.length && !filters.countries.includes(row.Country)) return false
      if (filters.categories.length && !filters.categories.includes(row.Level1)) return false
      if (filters.years.length) {
        try {
          const year = new Date(row.Date).getFullYear()
          if (!filters.years.includes(year)) return false
        } catch {
          return false
        }
      }
      return true
    })
  }, [data, filters])

    const filterOptions = useMemo(() => {
    const companies = Array.from(new Set(data.map(d => d.PortCo))).sort()
    const suppliers = Array.from(new Set(data.map(d => d.Supplier).filter(s => s))).sort()
    const countries = Array.from(new Set(data.map(d => d.Country).filter(c => c))).sort()
    const categories = Array.from(new Set(data.map(d => d.Level1).filter(cat => cat))).sort()
    const years = Array.from(new Set(data.map(d => {
      try {
        return new Date(d.Date).getFullYear()
      } catch {
        return null
      }
    }).filter(y => y !== null))).sort((a, b) => (a ?? 0) - (b ?? 0))

    return { companies, suppliers, countries, categories, years }
  }, [data])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-lg text-gray-600">Loading data...</p>
          </div>
        )}
        
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <p className="text-lg text-red-600 font-semibold">{error}</p>
              <p className="text-sm text-red-500 mt-2">Check browser console (F12) for more details</p>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700">Data loaded: {data.length} records | Filtered: {filteredData.length} records</p>
            </div>
            <FilterBar 
              filters={filters}
              setFilters={setFilters}
              options={filterOptions}
            />
            
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
              <KPICards data={filteredData} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Spend by Category</h4>
                  <TreemapChart data={filteredData} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Category Hierarchy</h4>
                  <SunburstChart data={filteredData} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Spend by Country</h4>
                  <CategoryMapChart data={filteredData as SpendRow[]} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-3">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">Spent by Month and Week</h4>
                  <HeatmapChart data={filteredData} />
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  )
}

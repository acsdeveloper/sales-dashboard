'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FilterBarProps {
  filters: Record<string, any[]>
  setFilters: (filters: Record<string, any[]>) => void
  options: Record<string, any[]>
}

export default function FilterBar({ filters, setFilters, options }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const toggleFilter = (category: string, value: any) => {
    const current = filters[category] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    setFilters({ ...filters, [category]: updated })
  }

  const filterCategories = [
    { key: 'companies', label: 'Companies', options: options.companies },
    { key: 'suppliers', label: 'Suppliers', options: options.suppliers },
    { key: 'countries', label: 'Countries', options: options.countries },
    { key: 'categories', label: 'Categories', options: options.categories },
    { key: 'years', label: 'Years', options: options.years },
  ]

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
      <div className="p-4 flex flex-wrap gap-3">
        {filterCategories.map(({ key, label, options: opts }) => (
          <div key={key} className="relative">
            <button
              onClick={() => toggleDropdown(key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
            >
              {label}
              {filters[key]?.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white rounded text-xs">
                  {filters[key].length}
                </span>
              )}
              <ChevronDown size={16} />
            </button>

            {openDropdown === key && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto w-48">
                {opts.map(option => (
                  <label key={option} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={(filters[key] || []).includes(option)}
                      onChange={() => toggleFilter(key, option)}
                      className="rounded"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

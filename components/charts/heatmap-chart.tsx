'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false })

interface DataRow {
  Date: string
  Level1: string
  Amount: number
}

export default function HeatmapChart({ data }: { data: DataRow[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        tooltip: { formatter: '' },
        grid: { height: '80%', top: 10, bottom: 100 },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'category', data: [] },
        visualMap: {
          min: 0,
          max: 100,
          inRange: {
            color: [
              '#dce6ff',
              '#c4d3ff',
              '#a8c1ff',
              '#8aabff',
              '#6d95ff',
              '#4e7eff',
              '#2f67ff',
              '#0f50ff'
            ]
          }
        },
        series: [{ name: 'Spend', type: 'heatmap', data: [] }],
      }
    }

    // Function to get week of month from date
    const getWeekOfMonth = (dateStr: string) => {
      const date = new Date(dateStr);
      const dayOfMonth = date.getDate();
      return Math.min(Math.ceil(dayOfMonth / 7), 5); // Cap at 5 weeks
    };

    // Function to get month name from date
    const getMonthName = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Filter data by selected category if not "All"
    const filteredData = selectedCategory === 'All' 
      ? data 
      : data.filter(row => row.Level1 === selectedCategory);

    // Group data by month and week
    const heatmapData: Record<string, Record<string, number>> = {};

    filteredData.forEach(row => {
      const month = getMonthName(row.Date);
      const week = `Week ${getWeekOfMonth(row.Date)}`;
      
      if (!heatmapData[month]) heatmapData[month] = {};
      heatmapData[month][week] = (heatmapData[month][week] || 0) + row.Amount;
    });

    // Get all unique months in chronological order
    const allDates = data.map(d => new Date(d.Date)).sort((a, b) => a.getTime() - b.getTime());
    const uniqueMonths = Array.from(new Set(allDates.map(date => 
      date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    )));

    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];

    // Create heatmap data
    const heatmapValues = uniqueMonths.flatMap((month, mi) =>
      weeks.map((week, wi) => [mi, wi, heatmapData[month]?.[week] || 0])
    );

    // Find the maximum value for color scale
    const maxValue = heatmapValues.length > 0 ? Math.max(...heatmapValues.map((v: any) => v[2])) : 100;

    // Get all unique categories for the filter
    const categories = ['All', ...Array.from(new Set(data.map(d => d.Level1)))];

    return {
      title: {
        text: `Spend by Month and Week${selectedCategory !== 'All' ? ` - ${selectedCategory}` : ''}`,
        left: 'center'
      },
      tooltip: {
        formatter: (params: any) => {
          return `${uniqueMonths[params.value[0]]} - ${weeks[params.value[1]]}: $${(params.value[2] / 1000).toFixed(1)}K`;
        },
      },
      grid: { 
        height: '70%', 
        top: '15%', 
        bottom: '15%' 
      },
      xAxis: {
        type: 'category',
        data: uniqueMonths,
        splitArea: { show: true },
        axisLabel: { 
          rotate: 45,
          interval: 0 // Show all month labels
        },
      },
      yAxis: {
        type: 'category',
        data: weeks,
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        max: maxValue,
        calculable: true,
        orient: 'vertical',
        left: 'start',
        bottom: '5%',
        inRange: {
          color: [
            '#dce6ff',
            '#c4d3ff',
            '#a8c1ff',
            '#8aabff',
            '#6d95ff',
            '#4e7eff',
            '#2f67ff',
            '#0f50ff'
          ]
        }

      },
      series: [{
        name: 'Spend',
        type: 'heatmap',
        data: heatmapValues,
        emphasis: { itemStyle: { borderColor: '#333', borderWidth: 1 } },
        label: {
          show: true,
          formatter: (params: any) => {
            return params.value[2] > 0 ? `$${(params.value[2] / 1000).toFixed(0)}K` : '';
          },
          fontSize: 10
        }
      }],
    }
  }, [data, selectedCategory])

  // Get all unique categories for the filter buttons
  const categories = ['All', ...Array.from(new Set(data.map(d => d.Level1)))];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {/* {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))} */}
      </div>
      <EChartsReact option={option} style={{ height: '400px' }} />
    </div>
  )
}
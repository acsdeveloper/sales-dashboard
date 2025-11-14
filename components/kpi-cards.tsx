'use client'

interface DataRow {
  PortCo: string
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

interface KPICardsProps {
  data: DataRow[]
}

export default function KPICards({ data }: KPICardsProps) {
  const totalSpend = data.reduce((sum, row) => sum + row.Amount, 0)
  const suppliers = new Set(data.map(row => row.Supplier)).size
  const transactions = data.length
  const poCount = new Set(data.map(row => row.PONo)).size
  const prCount = data.length // Approximation
  const invoiceCount = new Set(data.map(row => row.Invoice)).size

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(1)}K`
  }

  const kpis = [
    { label: 'Spend', value: formatCurrency(totalSpend) },
    { label: 'Suppliers', value: suppliers },
    { label: 'Transactions', value: transactions },
    { label: 'PO Count', value: poCount },
    { label: 'PR Count', value: prCount },
    { label: 'Invoice Count', value: invoiceCount },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white p-5 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">{kpi.label}</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
}

export interface SpendRow {
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

export function parseData(data: any): SpendRow[] {
  // Handle object with data property
  if (data && typeof data === 'object' && !Array.isArray(data) && 'data' in data) {
    const extractedData = data.data
    if (Array.isArray(extractedData)) {
      return extractedData.map(row => ({
        PortCo: String(row.PortCo || ''),
        Invoice: row.Invoice || '',
        PONo: row.PONo || '',
        Date: row.Date || '',
        Supplier: row.Supplier || '',
        Country: row.Country || '',
        Level1: row.Level1 || '',
        Level2: row.Level2 || '',
        Level3: row.Level3 || '',
        Amount: parseFloat(row.Amount) || 0,
      }))
    }
    // If data property is a string, parse as CSV
    if (typeof extractedData === 'string') {
      return parseCSV(extractedData)
    }
  }
  
  // If it's already an array of objects, return it as SpendRow[]
  if (Array.isArray(data)) {
    return data.map(row => ({
      PortCo: String(row.PortCo || ''),
      Invoice: row.Invoice || '',
      PONo: row.PONo || '',
      Date: row.Date || '',
      Supplier: row.Supplier || '',
      Country: row.Country || '',
      Level1: row.Level1 || '',
      Level2: row.Level2 || '',
      Level3: row.Level3 || '',
      Amount: parseFloat(row.Amount) || 0,
    }))
  }
  
  // Otherwise, parse as CSV
  return parseCSV(String(data))
}

export function parseCSV(csvText: string): SpendRow[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    const values = line.split(',')
    return {
      PortCo: values[0]?.trim() || '',
      Invoice: values[1]?.trim() || '',
      PONo: values[2]?.trim() || '',
      Date: values[3]?.trim() || '',
      Supplier: values[4]?.trim() || '',
      Country: values[5]?.trim() || '',
      Level1: values[6]?.trim() || '',
      Level2: values[7]?.trim() || '',
      Level3: values[8]?.trim() || '',
      Amount: parseFloat(values[9]) || 0,
    }
  })
}

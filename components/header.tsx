export default function Header() {
  const startDate = '01/01/2024'
  const endDate = '12/31/2024'

  return (
    <header className="text-white p-4 flex justify-between items-center flex-shrink-0" style={{ backgroundColor: '#363C74' }}>
      <h1 className="text-2xl font-semibold">Spend Overview</h1>
      <div className="flex items-center space-x-4">
        {/* <div className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
          <span className="text-gray-500">From:</span>
          <span className="font-bold ml-2">{startDate}</span>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
          <span className="text-gray-500">To:</span>
          <span className="font-bold ml-2">{endDate}</span>
        </div> */}
      </div>
    </header>
  )
}

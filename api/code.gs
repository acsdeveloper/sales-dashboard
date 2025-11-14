// Create a Google Apps Script file with the following code:

function doGet(e) {
  try {
    // Get the active spreadsheet and the specific sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = e.parameter.sheet || "Sheet1"; // Default to Sheet1 if not specified
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse("Sheet not found: " + sheetName, 404);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Extract headers (first row)
    const headers = data[0];
    
    // Convert the remaining rows to objects
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }
    
    // Return the data as JSON
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: rows,
      count: rows.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return createErrorResponse("Error: " + error.toString(), 500);
  }
}

// Helper function to create error responses
function createErrorResponse(message, code) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: message
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

// Optional: Add a function to get filtered data
function doGetFiltered(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = e.parameter.sheet || "Sheet1";
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return createErrorResponse("Sheet not found: " + sheetName, 404);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Extract headers (first row)
    const headers = data[0];
    
    // Convert the remaining rows to objects
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      rows.push(row);
    }
    
    // Apply filters if provided
    let filteredRows = rows;
    
    // Check for column filters (e.g., ?Level1=Groceries)
    for (const header of headers) {
      if (e.parameter[header]) {
        const filterValue = e.parameter[header];
        filteredRows = filteredRows.filter(row => {
          return String(row[header]) === String(filterValue);
        });
      }
    }
    
    // Check for search parameter (e.g., ?search=Zespri)
    if (e.parameter.search) {
      const searchTerm = e.parameter.search.toLowerCase();
      filteredRows = filteredRows.filter(row => {
        return Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
      });
    }
    
    // Check for limit parameter (e.g., ?limit=10)
    if (e.parameter.limit) {
      const limit = parseInt(e.parameter.limit);
      if (!isNaN(limit) && limit > 0) {
        filteredRows = filteredRows.slice(0, limit);
      }
    }
    
    // Return the filtered data as JSON
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: filteredRows,
      count: filteredRows.length,
      total: rows.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return createErrorResponse("Error: " + error.toString(), 500);
  }
}
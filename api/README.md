# Google Apps Script API Documentation

This directory contains the Google Apps Script code that serves as the backend API for the Spend Overview Dashboard, providing access to Google Sheets data.

## Overview

The API transforms Google Sheets data into JSON format and serves it via HTTP endpoints. It supports both full data retrieval and filtered queries.

## Files

- **code.gs**: Main Google Apps Script code with API endpoints

## Setup Instructions

### 1. Create Google Sheets Spreadsheet

Create a Google Sheets spreadsheet with the following structure:

#### Required Columns (Header Row)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| PortCo | String | Portfolio company name | "Acme Corp" |
| Invoice | String | Invoice number | "INV-2024-001" |
| PONo | String | Purchase order number | "PO-12345" |
| Date | Date | Transaction date | "2024-01-15" |
| Supplier | String | Supplier/vendor name | "Office Supplies Inc" |
| Country | String | Country code or name | "USA" or "United States" |
| Level1 | String | Category level 1 | "Office Supplies" |
| Level2 | String | Category level 2 | "Stationery" |
| Level3 | String | Category level 3 | "Pens & Pencils" |
| Amount | Number | Spend amount | 150.50 |

#### Sample Data

```
PortCo          | Invoice      | PONo     | Date       | Supplier           | Country | Level1          | Level2      | Level3        | Amount
----------------|--------------|----------|------------|--------------------|---------|-----------------|-----------  |---------------|--------
Acme Corp       | INV-001      | PO-1001  | 2024-01-15 | Office Supplies Co | USA     | Office Supplies | Stationery  | Pens          | 150.50
Beta Inc        | INV-002      | PO-1002  | 2024-01-20 | Tech Vendor        | UK      | IT Equipment    | Hardware    | Laptops       | 2500.00
Gamma LLC       | INV-003      | PO-1003  | 2024-02-01 | Food Service       | Canada  | Catering        | Meals       | Lunch         | 450.00
```

### 2. Deploy Google Apps Script

1. **Open Script Editor**
   - Open your Google Sheets spreadsheet
   - Click **Extensions** → **Apps Script**

2. **Add the Code**
   - Delete any existing code in the editor
   - Copy the contents of [`code.gs`](code.gs)
   - Paste into the Apps Script editor
   - Click **Save** (disk icon)

3. **Deploy as Web App**
   - Click **Deploy** → **New deployment**
   - Click the gear icon (⚙️) → Select **Web app**
   - Configure deployment:
     - **Description**: "Spend Dashboard API v1"
     - **Execute as**: Me (your email)
     - **Who has access**: Anyone (for public access) or specific users
   - Click **Deploy**

4. **Authorize the Script**
   - Click **Authorize access**
   - Select your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**

5. **Copy the Web App URL**
   - Copy the **Web app URL** (ends with `/exec`)
   - Save this URL for use in your Next.js application

### 3. Update Next.js Application

Update the API endpoint in [`app/page.tsx`](../app/page.tsx):

```typescript
const response = await fetch(
  'YOUR_WEB_APP_URL_HERE/exec',  // Replace with your URL
  {
    method: 'GET',
    mode: 'cors',
  }
)
```

### 4. Test the API

Open your Web App URL in a browser. You should see JSON output:

```json
{
  "status": "success",
  "data": [
    {
      "PortCo": "Acme Corp",
      "Invoice": "INV-001",
      "PONo": "PO-1001",
      "Date": "2024-01-15",
      "Supplier": "Office Supplies Co",
      "Country": "USA",
      "Level1": "Office Supplies",
      "Level2": "Stationery",
      "Level3": "Pens",
      "Amount": 150.5
    }
  ],
  "count": 1
}
```

## API Endpoints

### GET - Retrieve All Data

**Endpoint**: `https://script.google.com/macros/s/.../exec`

**Method**: GET

**Parameters**:
- `sheet` (optional): Sheet name (default: "Sheet1")

**Example**:
```bash
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?sheet=January2024"
```

**Response**:
```json
{
  "status": "success",
  "data": [...],
  "count": 150
}
```

### GET - Filtered Data (doGetFiltered)

> **Note**: The `doGetFiltered` function is included in `code.gs` but not currently exposed. To use it, change the main function from `doGet` to `doGetFiltered`.

**Method**: GET

**Parameters**:
- `sheet` (optional): Sheet name
- `{ColumnName}` (optional): Filter by column value
- `search` (optional): Search across all columns
- `limit` (optional): Limit number of results

**Examples**:
```bash
# Filter by Level1 category
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?Level1=Office%20Supplies"

# Search for "Acme"
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?search=Acme"

# Limit to 10 results
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?limit=10"

# Combine filters
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?Country=USA&limit=50"
```

**Response**:
```json
{
  "status": "success",
  "data": [...],
  "count": 10,
  "total": 150
}
```

## Code Structure

### doGet(e)

Main endpoint handler that retrieves all data from the spreadsheet.

**Flow**:
1. Get active spreadsheet
2. Retrieve specified sheet (or default to "Sheet1")
3. Extract all data including headers
4. Convert rows to JSON objects
5. Return JSON response

**Error Handling**:
- Returns 404 if sheet not found
- Returns 500 for other errors
- All errors include descriptive messages

### doGetFiltered(e)

Alternative endpoint with filtering capabilities.

**Features**:
- Column-based filtering
- Full-text search
- Result limiting
- Preserves all original functionality of `doGet()`

### createErrorResponse(message, code)

Helper function for consistent error responses.

**Returns**:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Configuration

### Sheet Name

Change the default sheet name:

```javascript
const sheetName = e.parameter.sheet || "YourDefaultSheetName";
```

### CORS Settings

CORS is automatically handled by Google Apps Script when deployed as "Anyone" access.

For restricted access:
1. Deploy with "Anyone with the link"
2. Implement custom CORS headers (not directly supported by Apps Script)

### Data Validation

Add validation before processing:

```javascript
function doGet(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    // Validate sheet has data
    if (sheet.getLastRow() < 2) {
      return createErrorResponse("No data found in sheet", 404);
    }

    const data = sheet.getDataRange().getValues();

    // Validate required columns
    const requiredColumns = ['PortCo', 'Amount', 'Date'];
    const headers = data[0];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      return createErrorResponse(
        `Missing required columns: ${missingColumns.join(', ')}`,
        400
      );
    }

    // Continue with normal processing...
  } catch (error) {
    return createErrorResponse(error.toString(), 500);
  }
}
```

## Security Considerations

### Access Control

**Current Setup**: Anyone with the URL can access the data

**Options**:
1. **Anyone**: Public access (current)
2. **Anyone with the link**: Requires URL knowledge
3. **Specific people**: Requires Google authentication

### API Key Protection

Add simple API key authentication:

```javascript
function doGet(e) {
  const API_KEY = 'your-secret-api-key';

  if (e.parameter.apiKey !== API_KEY) {
    return createErrorResponse("Unauthorized", 401);
  }

  // Continue with normal processing...
}
```

Usage:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?apiKey=your-secret-api-key
```

### Rate Limiting

Google Apps Script has built-in quotas:
- **URL Fetch calls**: 20,000/day
- **Script runtime**: 6 min/execution
- **Triggers**: 90 min/day

See [Quotas for Google Services](https://developers.google.com/apps-script/guides/services/quotas)

## Troubleshooting

### "Sheet not found" Error

**Cause**: Sheet name mismatch

**Solution**:
1. Verify the sheet name in your spreadsheet (case-sensitive)
2. Update the default in `code.gs`: `const sheetName = e.parameter.sheet || "Sheet1"`
3. Or pass the correct name: `?sheet=YourSheetName`

### "Authorization required" Error

**Cause**: Script not properly authorized

**Solution**:
1. Re-deploy the script
2. Complete the authorization flow
3. Ensure execution is set to "Me"

### Empty Data Response

**Cause**:
- No data in spreadsheet
- Headers missing
- Wrong sheet name

**Solution**:
1. Verify data exists in the spreadsheet
2. Ensure first row contains headers
3. Check sheet name parameter

### CORS Errors in Browser

**Cause**: Script not deployed with public access

**Solution**:
1. Re-deploy with "Anyone" access
2. Verify URL ends with `/exec` (not `/dev`)
3. Use the production URL, not development URL

### Slow Response Times

**Cause**: Large dataset processing

**Solutions**:
1. Use filtered endpoint with `limit` parameter
2. Implement server-side caching:
```javascript
const cache = CacheService.getScriptCache();
const cached = cache.get('data');
if (cached) {
  return ContentService.createTextOutput(cached)
    .setMimeType(ContentService.MimeType.JSON);
}
// Process and cache...
cache.put('data', jsonString, 3600); // Cache for 1 hour
```

### Data Type Issues

**Cause**: Number/date conversion

**Solution**: Add type conversion:
```javascript
for (let j = 0; j < headers.length; j++) {
  const value = data[i][j];

  // Handle dates
  if (headers[j] === 'Date' && value instanceof Date) {
    row[headers[j]] = Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }
  // Handle numbers
  else if (headers[j] === 'Amount') {
    row[headers[j]] = Number(value) || 0;
  }
  // Default
  else {
    row[headers[j]] = value;
  }
}
```

## Advanced Features

### Caching

Implement caching for better performance:

```javascript
function doGet(e) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'spreadsheet_data';

  // Try to get cached data
  const cached = cache.get(cacheKey);
  if (cached) {
    return ContentService.createTextOutput(cached)
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Fetch and cache data
  const data = fetchSpreadsheetData();
  const jsonString = JSON.stringify(data);

  // Cache for 10 minutes
  cache.put(cacheKey, jsonString, 600);

  return ContentService.createTextOutput(jsonString)
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Pagination

Add pagination support:

```javascript
function doGet(e) {
  const page = parseInt(e.parameter.page) || 1;
  const pageSize = parseInt(e.parameter.pageSize) || 50;

  const allData = fetchSpreadsheetData();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: allData.slice(startIndex, endIndex),
    page: page,
    pageSize: pageSize,
    total: allData.length,
    totalPages: Math.ceil(allData.length / pageSize)
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Aggregations

Add server-side aggregations:

```javascript
function doGet(e) {
  if (e.parameter.aggregate === 'true') {
    const data = fetchSpreadsheetData();

    const aggregated = {
      totalSpend: data.reduce((sum, row) => sum + row.Amount, 0),
      recordCount: data.length,
      byCategory: {},
      byCountry: {}
    };

    data.forEach(row => {
      // Aggregate by category
      aggregated.byCategory[row.Level1] =
        (aggregated.byCategory[row.Level1] || 0) + row.Amount;

      // Aggregate by country
      aggregated.byCountry[row.Country] =
        (aggregated.byCountry[row.Country] || 0) + row.Amount;
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      aggregations: aggregated
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Return normal data
  return doGetNormal(e);
}
```

## Testing

### Manual Testing

1. Open the Web App URL in browser
2. Verify JSON response structure
3. Test with different sheet parameters
4. Test error cases (invalid sheet name)

### Automated Testing

Create a test suite in Apps Script:

```javascript
function testDoGet() {
  const mockEvent = { parameter: { sheet: 'Sheet1' } };
  const response = doGet(mockEvent);
  const content = response.getContent();
  const data = JSON.parse(content);

  Logger.log('Status: ' + data.status);
  Logger.log('Record count: ' + data.count);

  if (data.status !== 'success') {
    throw new Error('Test failed: ' + data.message);
  }
}
```

Run from **Apps Script** → **Run** → **testDoGet**

## Monitoring

### View Execution Logs

1. Open Apps Script editor
2. Click **Execution** in left sidebar
3. View recent executions with timestamps and status

### Enable Logging

Add logging to your code:

```javascript
function doGet(e) {
  Logger.log('Request received with parameters: ' + JSON.stringify(e.parameter));

  try {
    const data = fetchSpreadsheetData();
    Logger.log('Successfully fetched ' + data.length + ' records');
    return createSuccessResponse(data);
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createErrorResponse(error.toString(), 500);
  }
}
```

View logs: **Apps Script** → **Executions** → Click on execution → **View logs**

## Updating the API

### Redeploy After Changes

1. Make changes to `code.gs`
2. Click **Save**
3. Click **Deploy** → **Manage deployments**
4. Click edit icon (pencil) on existing deployment
5. Update **Version**: New version
6. Click **Deploy**

**Note**: The Web App URL remains the same

### Version Management

Track versions in code comments:

```javascript
/**
 * Spend Dashboard API
 * Version: 1.1.0
 * Last Updated: 2024-01-15
 * Changes: Added filtered endpoint support
 */
```

## Additional Resources

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Spreadsheet Service](https://developers.google.com/apps-script/reference/spreadsheet)
- [Content Service](https://developers.google.com/apps-script/reference/content)
- [Web Apps Guide](https://developers.google.com/apps-script/guides/web)

## Support

For API issues:
1. Check execution logs in Apps Script
2. Verify spreadsheet structure matches requirements
3. Test the Web App URL directly in browser
4. Review this documentation

For deployment issues, see the [Deployment Guide](../.github/DEPLOYMENT.md)

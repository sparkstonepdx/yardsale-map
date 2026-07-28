function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]

  // 🔧 Change this to match your address column header exactly
  const ADDRESS_COLUMN_HEADER = 'Yard Sale Address'

  const addressCol = headers.indexOf(ADDRESS_COLUMN_HEADER) + 1
  if (addressCol === 0) {
    Logger.log('Address column not found. Check your column header name.')
    return
  }

  const lastRow = sheet.getLastRow()
  const address = sheet.getRange(lastRow, addressCol).getValue()

  if (!address) return

  try {
    const location = Maps.newGeocoder().geocode(address)
    const result = location.results[0].geometry.location
    const lat = result.lat
    const lng = result.lng

    let latCol = headers.indexOf('Latitude')
    let lngCol = headers.indexOf('Longitude')

    if (latCol < 1) {
      latCol = sheet.getLastColumn() + 1
      lngCol = latCol + 1
      sheet.getRange(1, latCol).setValue('Latitude')
      sheet.getRange(1, lngCol).setValue('Longitude')
    } else {
      latCol = latCol + 1
      lngCol = lngCol + 1
    }

    sheet.getRange(lastRow, latCol).setValue(lat)
    sheet.getRange(lastRow, lngCol).setValue(lng)
  } catch (err) {
    Logger.log('Geocoding failed: ' + err.message)
  }
}

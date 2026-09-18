// 🔧 Change this to match your address column header exactly
const ADDRESS_COLUMN_HEADER = 'Yard Sale Address'
const LATITUDE_COLUMN_HEADER = 'Latitude'
const LONGITUDE_COLUMN_HEADER = 'Longitude'

// Trigger: "On form submit". Also fires when a respondent edits their response.
function onFormSubmit(e) {
  const sheet =
    e && e.range ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  const row = e && e.range ? e.range.getRow() : sheet.getLastRow()

  geocodeRow_(sheet, row)
}

// Trigger: "On edit". Must be an installable trigger, because simple triggers
// are not allowed to call the Maps service.
function onAddressEdit(e) {
  if (!e || !e.range) return

  const sheet = e.range.getSheet()
  const addressCol = findColumn_(sheet, ADDRESS_COLUMN_HEADER)
  if (!addressCol) return

  const firstCol = e.range.getColumn()
  const lastCol = firstCol + e.range.getNumColumns() - 1
  if (addressCol < firstCol || addressCol > lastCol) return

  const firstRow = Math.max(e.range.getRow(), 2)
  const lastRow = e.range.getRow() + e.range.getNumRows() - 1

  for (let row = firstRow; row <= lastRow; row++) {
    geocodeRow_(sheet, row)
  }
}

// Run by hand to fill in (or repair) every row at once.
function geocodeAllRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()

  for (let row = 2; row <= sheet.getLastRow(); row++) {
    geocodeRow_(sheet, row)
  }
}

function geocodeRow_(sheet, row) {
  if (row < 2) return

  const addressCol = findColumn_(sheet, ADDRESS_COLUMN_HEADER)
  if (!addressCol) {
    Logger.log('Address column not found. Check your column header name.')
    return
  }

  const latCol = findOrCreateColumn_(sheet, LATITUDE_COLUMN_HEADER)
  const lngCol = findOrCreateColumn_(sheet, LONGITUDE_COLUMN_HEADER)
  const address = String(sheet.getRange(row, addressCol).getValue()).trim()

  if (!address) {
    sheet.getRange(row, latCol).clearContent()
    sheet.getRange(row, lngCol).clearContent()
    return
  }

  try {
    const location = Maps.newGeocoder().geocode(address)
    const result = location.results[0]

    if (!result) {
      Logger.log('No geocoding result for row ' + row + ': ' + address)
      return
    }

    sheet.getRange(row, latCol).setValue(result.geometry.location.lat)
    sheet.getRange(row, lngCol).setValue(result.geometry.location.lng)
  } catch (err) {
    Logger.log('Geocoding failed for row ' + row + ': ' + err.message)
  }
}

function findColumn_(sheet, header) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const index = headers.indexOf(header)

  return index === -1 ? 0 : index + 1
}

function findOrCreateColumn_(sheet, header) {
  const existing = findColumn_(sheet, header)
  if (existing) return existing

  const column = sheet.getLastColumn() + 1
  sheet.getRange(1, column).setValue(header)

  return column
}

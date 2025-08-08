/**
* Contains utility functions
*/

const weeksBetween = (oldDate, newDate) => {
  return Math.round((newDate - oldDate) / (7 * 24 * 60 * 60 * 1000));
}

/**
* Sorts the spreadsheet by date
*/
const sortByDate = () => {
  let criticalDriverSS = SpreadsheetApp.openByUrl("YOUR_GOOGLE_SPREADSHEET_URL_HERE"); // Critical Driver Spreadsheet
  let mainSheet = criticalDriverSS.getSheetByName("2020 Productivity"); // Sheet the will be sorted
  
  mainSheet.getRange("A2:M").sort({column: 1});
};
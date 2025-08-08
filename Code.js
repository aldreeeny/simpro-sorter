/**
* This is a function that fires when the webapp receives a GET request
*/
const doGet = (e) => {
  return HtmlService.createHtmlOutput("request received");
}

/**
* This is a function that fires when the webapp receives a POST request
*/
const doPost = (e) => {
  try {
    let newReportId = e.parameter.fileId;
    let report = DriveApp.getFileById(newReportId);
  
    // Critical Driver Spreadsheet. Change link when implementing this to production data.
    let criticalDriverSS = SpreadsheetApp.openByUrl("YOUR_GOOGLE_SPREADSHEET_URL_HERE");
    
    // Data manipulation
    let reportSS = SpreadsheetApp.openById(report.getId());
    let newData = reportSS.getActiveSheet().getDataRange().getValues().filter(row => row[0]!=""); // This will not include blank rows
    let rawDate = reportSS.getActiveSheet().getRange(1, 1).getValue();
    let date = rawDate.substring(rawDate.length-10);
    let isNew = true;    
  
    let audit = []; // Used for audit logs
    let baseData = []; // Used as a basis for comparison
    let counter = 1; // Serves as the row count on the main sheet  
    let mainSheet = criticalDriverSS.getSheetByName("2020 Productivity"); // Sheet the will be integrated with the exported data
    let summarySheet = criticalDriverSS.getSheetByName("Print Version"); // This will be used after dumping data on mainSheet
    let oldDate = mainSheet.getRange("A2:A2").getValue();
    let placeHolder = new Date();
    let latestWeek = weeksBetween(oldDate, placeHolder)+1;
  
    mainSheet.getDataRange().getValues().forEach(row => { // Check if the report's date is included on the main sheet
      if(row[0]!="") { // Skips if blank rows or rows that has no date
        let rowDate = new Date(row[0]);
        let modifiedRowDate = Utilities.formatDate(rowDate, "GMT+0800", "dd/MM/yyyy");
        if(modifiedRowDate == date) {
          isNew = false;
          baseData.push({
            row: counter,
            date: row[0],
            name: row[3],
            hrsScheduled: row[4],
            hrsBilled: row[5]
          });
        }
        counter++;
      }
    });

    if(isNew) {
      let lock = LockService.getScriptLock();      
      try {
          lock.waitLock(30000);
          employees.forEach(employee => {
          let dateParts = date.split("/");
          let newDate = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0] + 1);
          let week = weeksBetween(oldDate, newDate)+1;
          latestWeek = week;

          newData.forEach(newVal => {
            if(newVal[0] == employee.name) {
              let currentRow = mainSheet.getDataRange().getValues().filter(row => row[0]!="").length;
              let placeHolder = [
                Utilities.formatDate(newDate, "UTC+10", "dd/MM/yyyy"),
                months[newDate.getMonth()],
                week,
                employee.name,
                newVal[1],
                newVal[5],
                "",
                `=F${currentRow+1}-G${currentRow+1}`, // Total Hours Formula
                "",
                "",
                `=F${currentRow+1}-I${currentRow+1}`, // Over/Under Target Formula
                `=H${currentRow+1}\/J${currentRow+1}` // Productivity Formula
              ];
        
              // This will be used on the Automated Audit Logs
              audit.push([
                Utilities.formatDate(new Date(), "UTC+10", "dd/MM/yyyy"),
                "2020 Productivity",
                currentRow+1,
                employee.name,
                "",
                newVal[1],
                "",
                newVal[5]
              ]);


              mainSheet.appendRow(placeHolder);
              mainSheet.getRange(currentRow+1, 2, 1, 11).setBackground(employee.color);
              mainSheet.getRange(currentRow+1, 1, 1, 1).setBackground("yellow");
              mainSheet.getRange(currentRow+1, 4, 1, 9).setBorder(true, true, true, true, true, true, "black", SpreadsheetApp.BorderStyle.SOLID);
            }
          });
        });
      } catch(e) {
        return ContentService.createTextOutput(e);
      }
      sortByDate();
      lock.releaseLock();
      if (lock.hasLock()) {
        throw new Error("Lock violation");
      }
    } else {
      newData.forEach(newVal => {
        baseData.forEach(oldVal => {
          if(newVal[0] == oldVal.name) {
            if(oldVal.hrsScheduled != newVal[1] || oldVal.hrsBilled != newVal[5]) {
              mainSheet.getRange(oldVal.row, 5, 1, 1).setValue(newVal[1]);
              mainSheet.getRange(oldVal.row, 6, 1, 1).setValue(newVal[5]);
     
              audit.push([
                Utilities.formatDate(new Date(), "GMT+0800", "dd/MM/yyyy"),
                "2020 Productivity",
                oldVal.row,
                oldVal.name,
                oldVal.hrsScheduled,
                newVal[1],
                oldVal.hrsBilled,
                newVal[5]
              ]);
            }
          }
        });        
      });  
    }
    
    
    // End of data manipulation

    // Audit the changes
    let auditSheet = criticalDriverSS.getSheetByName("Automated Audit Logs");
    let lastRow = auditSheet.getDataRange().getValues().filter(row => row[0] != "").length;
    auditSheet.getRange(lastRow+1, 1, audit.length, audit[0].length).setValues(audit);
    
    // Delete imported file after the data has been integrated to the spreadsheet
    report.setTrashed(true);
    
    
    return ContentService.createTextOutput("Audit Complete.");
  } catch(e) {
    return ContentService.createTextOutput(e);
  }
};
# Simpro Sorter

This Google Apps Script web app automates the integration of employee productivity reports into a master Google Spreadsheet ("Critical Driver Spreadsheet"). It supports both initial data imports and updates, with audit logging and data validation.

## Features

- **Web App Interface:**  
  Accepts GET and POST requests for integration with other systems.
- **Automated Data Import:**  
  Processes uploaded report files and integrates them into the master sheet.
- **Duplicate Detection:**  
  Checks if a report for a given date already exists and updates only if necessary.
- **Audit Logging:**  
  Logs all changes to an "Automated Audit Logs" sheet for traceability.
- **Data Sorting & Formatting:**  
  Automatically sorts the master sheet by date and applies formatting.
- **Concurrency Control:**  
  Uses script locks to prevent concurrent edits.

## File Structure

- `Code.js` — Main web app logic for handling GET/POST requests and processing reports.
- `constants.js` — Employee and month constants used for data mapping and formatting.
- `util.js` — Utility functions (e.g., date calculations, sorting).
- `appsscript.json` — Google Apps Script project configuration.
- `.clasp.json` — CLASP configuration for local development.

## Setup

1. **Google Apps Script Project:**  
   Deploy the scripts as a web app in Google Apps Script.
2. **Spreadsheet Links:**  
   Update the spreadsheet URLs in the code to point to your production data.
3. **Permissions:**  
   Ensure the script has access to Google Drive and Google Sheets.
4. **Web App Deployment:**  
   Deploy as a web app with appropriate access (e.g., "Anyone, even anonymous" for public endpoints).

## Usage

- **POST Request:**  
  Send a POST request with a `fileId` parameter (the ID of the uploaded report file in Google Drive).
- **GET Request:**  
  Returns a simple confirmation message.

## Example POST Payload

```
POST /exec
Content-Type: application/x-www-form-urlencoded

fileId=YOUR_REPORT_FILE_ID
```

## Notes

- The script expects the report file to be a Google Sheet with employee data and a date in cell A1.
- After processing, the uploaded report file is moved to trash.
- All changes are logged for auditing.


import dotenv from 'dotenv';
dotenv.config();

let daysBack = 30; //Number of days back from today to fetch performances
let defaultDuration = 60; //Default event duration in minutes, if not provided by Tessitura 
let perfTypes = ""; //Comma delimited list of performance type IDs to filter on, or empty for all types
let keywords = ""; //Comma delimited list of keywords to filter on, or empty for no keyword filtering
const domainName = "example.org"; //Domain name used in generating unique event UIDs

// Load configuration from environment variables
const baseUrl = process.env.CRM_BASE_URL;
const authToken = process.env.CRM_AUTH_TOKEN;

if (!baseUrl || !authToken) {
  throw new Error('CRM_BASE_URL or CRM_AUTH_TOKEN not set');
}

// Common headers for Tessitura API requests
let tessituraHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Basic ${authToken}`
};

// Function to fetch performances from Tessitura CRM
export async function getPerformances() {
  // Calculate the start date based on daysBack, and add it to the request body as an ISO string
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const requestBody = {
    PerformanceStartDate: startDate.toISOString()
  };
  
  // If there are performance type filters, add them to the request body
  if(perfTypes != "") {
    requestBody.PerformanceTypeIds = perfTypes;
  }

  // If there are keyword filters, add them to the request body
  if(keywords != "") {
    requestBody.KeywordIds = keywords;
    requestBody.KeywordAndOr = "Or";
  }

  // Make the POST request to the Tessitura API
  const response = await fetch(`${baseUrl}/TXN/Performances/Search`, {
    method: 'POST',
    headers: tessituraHeaders,
    body: JSON.stringify(requestBody)
  });

  // Handle non-200 responses
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Tessitura API error (${response.status}): ${text}`
    );
  }

  // Parse the JSON response, and map it to the neccesary iCal format
  // End date/time is calculated with Duration from Tessitura. If Duration is not provided, use the default duration instead
  const data = await response.json();

  return data.map(e => {
    const startDate = new Date(e.PerformanceDate);

    const parsedDuration = Number(e.Duration);
    const durationMinutes =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : defaultDuration;

    return {
        id: `perf-${e.PerformanceId}@${domainName}`,
        title: e.PerformanceDescription,
        start: new Date(e.PerformanceDate),
        end: new Date(startDate.getTime() + durationMinutes * 60000)
        }
    });
}
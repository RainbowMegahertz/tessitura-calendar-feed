import { readFile } from "node:fs/promises";

//Retrieve config values 
const config = JSON.parse(
  await readFile(new URL("../config/config.json", import.meta.url))
);

// Load configuration from environment variables
const baseUrl = process.env.CRM_BASE_URL;
const authToken = process.env.CRM_AUTH_TOKEN;
const envName = process.env.ENV_NAME != undefined && process.env.ENV_NAME != '' ? process.env.ENV_NAME + ': ' : '';

// Common headers for Tessitura API requests
let tessituraHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Basic ${authToken}`
};

// Function to fetch detailed performance information from Tessitura CRM for a given performance ID
async function getPerformanceDetails(performanceId) {
  const detailResponse = await fetch(`${baseUrl}/TXN/Performances/${performanceId}`, {
    method: 'GET',
    headers: tessituraHeaders
  });

  if (!detailResponse.ok) {
    const detailText = await detailResponse.text();
    throw new Error(`Tessitura API error (${detailResponse.status}): ${detailText}`);
  }

  return await detailResponse.json();
}

// Function to fetch performances from Tessitura CRM
export async function getPerformances(options) {
  // Calculate the start and end dates for the Performance search based on the provided options
  const daysBack = options.daysBack;
  const daysForward = options.daysForward;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysForward);

  const requestBody = {
    PerformanceStartDate: startDate.toISOString(),
    PerformanceEndDate: endDate.toISOString()
  };
  
  // If there are performance type filters, add them to the request body
  if(options.performanceTypeIds != "") {
    requestBody.performanceTypeIds = options.performanceTypeIds;
  }

  // If there are keyword filters, add them to the request body
  if(options.keywordIds != "") {
    requestBody.keywordIds = options.keywordIds;
    requestBody.KeywordAndOr = "Or";
  }

  // Make the POST request to the Tessitura API
  const searchResponse = await fetch(`${baseUrl}/TXN/Performances/Search`, {
    method: 'POST',
    headers: tessituraHeaders,
    body: JSON.stringify(requestBody)
  });

  // Handle non-200 responses
  if (!searchResponse.ok) {
    const text = await searchResponse.text();
    throw new Error(
      `Tessitura API error (${searchResponse.status}): ${text}`
    );
  }

  const data = await searchResponse.json();

  return data.map(e => {
    // Fetch detailed performance information for each performance
    const perfDetails = getPerformanceDetails(e.PerformanceId);
    
    let startDateTime = new Date(e.PerformanceDate);

    // Calculate the end date and time based on the performance duration or default duration
    const parsedDuration = Number(e.Duration);
    const durationMinutes =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : options.defaultDuration;
    
    let endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    let allDay = false;

    // If the performance type is in the allDayPerformanceTypes list, set the start time to midnight and the end time to the next day
    if (config.tessitura.allDayPerformanceTypes.includes(e.PerformanceType.Id.toString())) {
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1); // Make end date the day after performance date for all-day events
      allDay = true;
    }

    return {
        id: e.PerformanceId,
        title: envName + e.PerformanceDescription,
        start: startDateTime,
        end: endDateTime,
        allDay: allDay,
        lastModified: perfDetails.UpdatedDateTime || perfDetails.CreatedDateTime,
        notes: '', //todo: populate notes
        url: ''//todo: populate url
        }
    });
}

// Function to fetch plan steps from Tessitura CRM
export async function getSteps(options) {

  // Validate that the workerId is provided
  if (!options.workerId) {
    throw new Error('workerConstituentId is required');
  }

  const params = new URLSearchParams();
  params.append('workerConstituentId', options.workerId);
  params.append('showAllSteps', 'false');
  params.append('includeCompletedSteps', options.includeCompleted ? 'true' : 'false');
  params.append('includeManagedUsers', options.includeManagedUsers ? 'true' : 'false');

  const response = await fetch(
    `${baseUrl}/Finance/Workers/Steps?${params.toString()}`,
    {
      method: 'GET',
      headers: tessituraHeaders
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tessitura API error (${response.status}): ${text}`);
  }

  let data = await response.json();

  return data.map(e => {
    // Convert DueDateTime to a Date object and set the time to midnight for all-day events
    const dueDate = new Date(e.DueDateTime);
    dueDate.setHours(0, 0, 0, 0);

    const lastModifiedSource =
      e.UpdatedDateTime ||
      e.CreatedDateTime;

    return {
      id: e.Id,
      title: envName + e.Description,
      start: dueDate,
      constituent: e.Constituent?.DisplayName ?? e.Plan?.Constituent?.DisplayName ?? e.Issue?.Constituent?.DisplayName ?? "Unknown", 
      lastModified: lastModifiedSource,
      step: e.Type.Description,
      notes: e.Notes,
      priority: e.Priority?.Id ?? 2, // Default to medium priority if not specified
      url: '' //Not working: `${baseUrl.replace(/\/$/, '')}/Step/${e.Id}` 
    };
  });
}
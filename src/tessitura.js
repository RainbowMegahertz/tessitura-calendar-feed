import { readFile } from "node:fs/promises";

//Retrieve config values 
const config = JSON.parse(
  await readFile(new URL("../config/config.json", import.meta.url))
);

// Load configuration from environment variables
const baseUrl = process.env.CRM_BASE_URL;
const authToken = process.env.CRM_AUTH_TOKEN;

// Common headers for Tessitura API requests
let tessituraHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Basic ${authToken}`
};

// Helper function to truncate text to a maximum length
function truncate(text, maxLength = 4000) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

async function getPerformance(performanceId) {
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
  if(options.PerformanceTypeIds != "") {
    requestBody.PerformanceTypeIds = options.PerformanceTypeIds;
  }

  // If there are keyword filters, add them to the request body
  if(options.KeywordIds != "") {
    requestBody.KeywordIds = options.KeywordIds;
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

  // End date/time is calculated with Duration from Tessitura. If Duration is not provided, use the default duration instead
  const data = await searchResponse.json();

  return data.map(e => {
    const perfDetails = getPerformance(e.PerformanceId);
    
    let startDateTime = new Date(e.PerformanceDate);

    const parsedDuration = Number(e.Duration);
    const durationMinutes =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : options.defaultDuration;
    
    let endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    let allDay = false;

    if (config.tessitura.allDayPerformanceTypes.includes(e.PerformanceType.Id.toString())) {
      // If the performance type is in the allDayPerformanceTypes list, set the start time to midnight and the end time to the next day
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime = new Date(startDateTime);
      endDateTime.setDate(endDateTime.getDate() + 1); // Make end date the day after performance date for all-day event
      allDay = true;
    }

    return {
        id: e.PerformanceId,
        title: e.PerformanceDescription,
        start: startDateTime,
        end: endDateTime,
        allDay: allDay,
        lastModified: perfDetails.UpdatedDateTime || perfDetails.CreatedDateTime
        //notes
        //url
        }
    });
}

// Function to fetch plan steps from Tessitura CRM
export async function getPlanSteps(options) {

  if (!options.workerId) {
    throw new Error('workerConstituentId is required');
  }

  const params = new URLSearchParams();
  params.append('workerConstituentId', options.workerId);
  params.append('showAllSteps', 'false');
  params.append('includeCompletedSteps', 'false');
  params.append('includeManagedUsers', 'false');

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
    const dueDate = new Date(e.DueDateTime);
    dueDate.setHours(0, 0, 0, 0);

    const lastModifiedSource =
      e.UpdatedDateTime ||
      e.CreatedDateTime;

    return {
      id: e.Id,
      title: e.Description,
      start: dueDate,
      constituent: e.Constituent?.DisplayName ?? e.Plan?.Constituent?.DisplayName ?? e.Issue?.Constituent?.DisplayName ?? "Unknown", 
      lastModified: lastModifiedSource,
      step: e.Type.Description,
      notes: e.Notes,
      priority: e.Priority?.Id ?? 2, // Default to medium priority if not specified
      url: '' //Not working: `${baseUrl.replace(/\/$/, '')}/Step/${e.Id}` //url/tessitura/#/crm/constituents/35130/plansteps/108/edit
    };
  });
}
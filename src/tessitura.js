import dotenv from 'dotenv';
dotenv.config();

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

// Function to fetch performances from Tessitura CRM
export async function getPerformances(options) {
  // Calculate the start date based on daysBack, and add it to the request body as an ISO string
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - options.daysBack);

  const requestBody = {
    PerformanceStartDate: startDate.toISOString()
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
        : options.defaultDuration;

    return {
        id: e.PerformanceId,
        title: e.PerformanceDescription,
        start: new Date(e.PerformanceDate),
        end: new Date(startDate.getTime() + durationMinutes * 60000)
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
    const due = new Date(e.DueDateTime);
    const dueDate = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate()
    );

    const lastModifiedSource =
      e.UpdatedDateTime ||
      e.CreatedDateTime;

    return {
      id: e.Id,
      description: e.Description,
      constituentName: e.Constituent?.DisplayName ?? "Default name", //e.Constituent.DisplayName
      dueDate,
      lastModified: lastModifiedSource,
      stepTypeDescription: e.Type.Description,
      notes: e.Notes,
      url: `${baseUrl.replace(/\/$/, '')}/Step/${e.Id}` //url/tessitura/#/crm/constituents/35130/plansteps/108/edit
    };
  });
}
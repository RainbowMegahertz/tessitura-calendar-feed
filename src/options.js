// Utility function to parse boolean values from query parameters
function parseBoolean(value) {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

// Function to retrieve options from query parameters
export function getOptions(event = {}) {
  const params = event.queryStringParameters || {};

  return {
    //Global items 
    includeSteps: params.includeSteps != null ? parseBoolean(params.includeSteps) : false,
    includePerformances: params.includePerformances != null ? parseBoolean(params.includePerformances) : false,
    daysBack: params.daysBack != null ? Number(params.daysBack) : 30,
    daysForward: params.daysForward != null ? Number(params.daysForward) : 180,

    //Steps
    workerId: params.workerId != null ? params.workerId : "0",
    includeCompleted: params.includeCompleted != null ? parseBoolean(params.includeCompleted) : false,
    includeManagedUsers: params.includeManagedUsers != null ? parseBoolean(params.includeManagedUsers) : false,

    //Performances 
    defaultDuration: params.defaultDuration != null ? Number(params.defaultDuration) : 60,
    keywordIds: params.keywordIds != null ? params.keywordIds : "",
    performanceTypeIds: params.performanceTypeIds != null ? params.performanceTypeIds : ""
  };
}
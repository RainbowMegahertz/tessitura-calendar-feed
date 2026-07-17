function parseBoolean(value) {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

export function getOptions(event = {}) {
  const params = event.queryStringParameters || {};

  return {
    //Global items 
    includePlanSteps: params.includePlanSteps != null ? parseBoolean(params.includePlanSteps) : false,
    includePerformances: params.includePerformances != null ? parseBoolean(params.includePerformances) : false,
    daysBack: params.daysBack != null ? Number(params.daysBack) : 30,

    //Plan steps
    workerId: params.workerId != null ? params.workerId : "0",
    includeCompleted: params.includeCompleted != null ? parseBoolean(params.includeCompleted) : false,
    includeManagedUsers: params.includeManagedUsers != null ? parseBoolean(params.includeManagedUsers) : false,

    //Performances 
    defaultDuration: params.defaultDuration != null ? Number(params.defaultDuration) : 60,
    KeywordIds: params.KeywordIds != null ? params.KeywordIds : "",
    PerformanceTypeIds: params.PerformanceTypeIds != null ? params.PerformanceTypeIds : ""
  };
}
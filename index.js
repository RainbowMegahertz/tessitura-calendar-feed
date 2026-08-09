import { getOptions } from './src/options.js';
import { getPerformances } from './src/tessitura.js';
import { getSteps } from './src/tessitura.js';
import { startCalendar } from './src/calendar.js';
import { buildCalendar } from './src/calendar.js';
import { readFile } from "node:fs/promises";

export async function handler(event) {
  try {
    //Retrieve options from query parameters
    const options = getOptions(event);

    // Load configuration from environment variables
    if (!process.env.CRM_BASE_URL || !process.env.CRM_AUTH_TOKEN) {
      throw new Error('CRM_BASE_URL or CRM_AUTH_TOKEN not set');
    }

    let calendarText = startCalendar();

    // If includePerformances is true, fetch performances and build the calendar
    if (options.includePerformances) {
      let performances = await getPerformances(options);
      calendarText = buildCalendar(calendarText, performances, "perf", options);
    }

    // If includeSteps is true, fetch plan steps and build the calendar
    if (options.includeSteps) {
      let steps = await getSteps(options);
      calendarText = buildCalendar(calendarText, steps, "step", options);
    }

    // Return the calendar as a downloadable .ics file
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="feed.ics"'
      },
      body: calendarText.toString()
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Error generating calendar'
    };
  }
}
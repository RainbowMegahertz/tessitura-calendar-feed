import { getOptions } from './src/options.js';
import { getPerformances } from './src/tessitura.js';
import { getPlanSteps } from './src/tessitura.js';
import { startCalendar } from './src/calendar.js';
import { buildCalendar } from './src/calendar.js';
import { readFile } from "node:fs/promises";

export async function handler(event) {
  try {
    //Retrieve config values 
    const config = JSON.parse(
      await readFile(new URL("./config/config.json", import.meta.url))
    );

    //Retrieve options from query parameters
    const options = getOptions(event);

    // Load configuration from environment variables
    if (!process.env.CRM_BASE_URL || !process.env.CRM_AUTH_TOKEN) {
      throw new Error('CRM_BASE_URL or CRM_AUTH_TOKEN not set');
    }

    let envName = process.env.ENV_NAME ?? '';

    let calendarText = startCalendar();

    // If includePerformances is true, fetch performances and build the calendar
    if (options.includePerformances) {
      let performances = await getPerformances(options);
      //console.log(JSON.stringify(performances, null, 2));
      calendarText = buildCalendar(calendarText, performances, "perf", options);
    }

    // If includePlanSteps is true, fetch plan steps and build the calendar
    if (options.includePlanSteps) {
      let planSteps = await getPlanSteps(options);
      calendarText = buildCalendar(calendarText, planSteps, "step", options);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"'
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
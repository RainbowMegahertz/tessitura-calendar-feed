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

    // Set the company name and calendar name, and start the calendar
    let companyName = config.calendar.companyName ?? 'DefaultCompanyName'; //process.env.COMPANY_NAME != null ? process.env.COMPANY_NAME : 'DefaultCompanyName'; // Replace with your company name, no spaces in string allowed
    let calendarName = config.calendar.name ?? 'Tessitura Events Calendar'; //process.env.CALENDAR_NAME != null ? process.env.CALENDAR_NAME : 'Tessitura Events Calendar'; // Name of the calendar

    let calendarText = startCalendar(companyName, calendarName);

    // If includePerformances is true, fetch performances and build the calendar
    if (options.includePerformances) {
      let performances = await getPerformances(options);
      //console.log(JSON.stringify(performances, null, 2));
      calendarText = buildCalendar(calendarText, performances, "performances");
    }

    // If includePlanSteps is true, fetch plan steps and build the calendar
    if (options.includePlanSteps) {
      let planSteps = await getPlanSteps(options);
      calendarText = buildCalendar(calendarText, planSteps, "planSteps");
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8'
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

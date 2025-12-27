import { getPerformances } from './src/tessitura.js';
import { buildCalendar } from './src/calendar.js';

export async function handler(event) {
  try {
    const events = await getPerformances();
    const calendarText = buildCalendar(events);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8'
      },
      body: calendarText
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Error generating calendar'
    };
  }
}

import ical from 'ical-generator';

let companyName = 'YourCompanyName'; // Replace with your company name, no spaces in string allowed
let calendarName = 'Tessitura Events Calendar'; // Name of the calendar

// Function to build iCal calendar from Tessitura events
export function buildCalendar(events) {

  // Create a new iCal calendar with required calendar properties
  const calendar = ical({
    name: calendarName,
    prodId: { company: companyName, product: 'TessituraCalendarFeed' }
  });

  // Add each event supplied from Tessitura to the calendar
  events.forEach(event => {
    calendar.createEvent({
      id: event.id,
      summary: event.title,
      start: new Date(event.end),
      end: new Date(event.end)
    });
  });

  //Output the calendar as a string
  return calendar.toString();
}
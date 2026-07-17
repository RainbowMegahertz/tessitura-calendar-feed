import ical from 'ical-generator';

function truncate(text, maxLength = 4000) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function startCalendar(companyName, calendarName) {
  // Create a new iCal calendar with required calendar properties
  let calendar = ical({
    name: calendarName,
    prodId: { company: companyName, product: 'TessituraCalendarFeed' }
  });
  //Output the calendar as a string
  return calendar;
}

// Function to build iCal calendar from Tessitura events
export function buildCalendar(calendar, events, type) {
  const domainHost = process.env.COMPANY_DOMAIN;
  
  // Add each event supplied from Tessitura to the calendar
  if(type === "performances") {
    events.forEach(event => {
      calendar.createEvent({
        id: `perf-${event.id}@${domainHost}`,
        summary: event.title,
        start: new Date(event.start),
        end: new Date(event.end)
      });
    });
  } else if (type === "planSteps") {
    events.forEach(event => {
      const end = new Date(event.dueDate);
      end.setDate(end.getDate() + 1); // Make end date the day after due date for all-day event
      
      const descriptionParts = [];
      if (event.url) {
        descriptionParts.push(event.url);
      }
      if (event.constituentName) {
        descriptionParts.push(event.constituentName);
      }
      if (event.stepTypeDescription) {
        descriptionParts.push(event.stepTypeDescription);
      }
      if (event.notes) {
        descriptionParts.push(event.notes);
      }
      const notes = truncate(descriptionParts.join('\n\n'));

      calendar.createEvent({
        id: `step-${event.id}@${domainHost}`,
        summary: `${event.description} (${event.constituentName})`,
        start: new Date(event.dueDate),
        end: end,
        allDay: true,
        lastModified: event.lastModified,
        description: notes,
        url: event.url,
        busystatus: 'FREE'
      });
    });
  }

  //Output the calendar
  return calendar;
}


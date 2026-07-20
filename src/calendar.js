import ical from 'ical-generator';
import { readFile } from "node:fs/promises";

//Retrieve config values 
const config = JSON.parse(
  await readFile(new URL("../config/config.json", import.meta.url))
);

function truncate(text, maxLength = 4000) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function startCalendar() {
  // Set the company name and calendar name, and start the calendar
  let companyName = config.calendar.companyName ?? 'DefaultCompanyName'; 
  let calendarName = config.calendar.name ?? 'Tessitura Events Calendar';

  // Create a new iCal calendar with required calendar properties
  let calendar = ical({
    name: calendarName,
    prodId: { company: companyName, product: 'TessituraCalendarFeed' }
  });

  return calendar;
}

// Function to build iCal calendar from Tessitura events
export function buildCalendar(calendar, events, type, options) {
  const daysBack = options.daysBack;
  const daysForward = options.daysForward;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysForward);
  
  // Add each event supplied from Tessitura to the calendar
  if(type === "perf") {
    events.forEach(event => {
      if (event.start < startDate || event.start > endDate) {
        return; // Skip events outside the specified date range
      }

      calendar.createEvent({
        id: `${type}-${event.id}@${config.calendar.domain}`,
        summary: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        allDay: event.allDay,
        lastModified: null, //event.lastModified,
        description: '',
        url: '',
        busystatus: event.allDay ? 'FREE' : 'BUSY',
        priority: 5
      });
    });
  } else if (type === "step") {
    events.forEach(event => {
      if (event.start < startDate || event.start > endDate) {
        return; // Skip events outside the specified date range
      }

      const end = new Date(event.start);
      end.setDate(end.getDate() + 1); // Make end date the day after due date for all-day event
      
      const descriptionParts = [];
      if (event.step) {
        descriptionParts.push(event.step);
      }
      if (event.constituent) {
        descriptionParts.push(event.constituent);
      }
      if (event.notes) {
        descriptionParts.push(event.notes);
      }
      if (event.url) {
        descriptionParts.push(event.url);
      }
      const notes = truncate(descriptionParts.join('\n\n'));

      // Map Tessitura priority to iCal priority (1-9 scale)
      const priorities = {
        1: 1, // High priority
        2: 5, // Medium priority
        3: 9 // Low priority
      };

      const priority = priorities[event.priority] ?? 5; // Default to medium if not specified

      calendar.createEvent({
        id: `${type}-${event.id}@${config.calendar.domain}`,
        summary: `${event.title} (${event.constituent})`,
        start: new Date(event.start),
        end: end,
        allDay: true,
        lastModified: event.lastModified,
        description: notes,
        url: event.url,
        busystatus: 'FREE',
        priority: priority
      });
    });
  }

  //Output the calendar
  return calendar;
}
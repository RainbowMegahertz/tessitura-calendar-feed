import http from 'http';
import dotenv from 'dotenv';
import { getPerformances } from './src/tessitura.js';
import { buildCalendar } from './src/calendar.js';

dotenv.config();

// Create HTTP server to serve the iCal feed
const server = http.createServer(async (req, res) => {
  // Only respond to requests for /feed.ics
  if (req.url !== '/feed.ics') {
    res.writeHead(404);
    return res.end('Not found');
  }

  try {
    // Fetch performances from Tessitura
    const events = await getPerformances();

    // Build iCal calendar from fetched events
    const calendarText = buildCalendar(events);

    // Respond with the iCal data
    res.writeHead(200, {
      'Content-Type': 'text/calendar; charset=utf-8'
    });
    res.end(calendarText);
  } 
  catch (err) {
    console.error(err);
    res.writeHead(500);
    res.end('Error generating calendar');
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Calendar feed running at http://localhost:${port}/feed.ics Use Ctrl + C to stop.`);
});

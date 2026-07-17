# Tessitura Calendar Feed

This project publishes public, subscribable calendar feeds (`.ics`) based on performances and/or worker steps in a Tessitura instance. The resulting feeds can be added to Outlook, Google Calendar, Apple Calendar, or any other calendar client that supports iCal subscriptions.

The application is implemented in Node.js and is designed to run as a lightweight serverless function. These instructions assume you are using AWS Lambda, but other options can be used too.

## 💡 Overview

### What this does

- Pulls event and/or worker step data from a Tessitura API endpoint
- Normalizes that data into calendar events
- Serves standards-compliant iCalendar (`.ics`) feeds

### Common use cases

- Internal staff calendars for upcoming performances synced from Tessitura
- A worker tracking their portfolio step due dates on their personal calendar

## 📄 Key files

### `index.js`

- Entry point for the application
- Acts as the HTTP handler 
- Orchestrates the workflow:
  1. Fetch events from the CRM
  2. Generate an iCalendar feed
  3. Return the `.ics` response

### `src/tessitura.js`

- Interfaces with Tessitura API
- Normalizes CRM event data into a predictable internal format

### `src/calendar.js`

- Converts normalized event data into an iCalendar feed

### `config/config.json`

- Holds project-wide defaults, including organization info

### `package.json`

- Defines project metadata
- Declares required dependencies
- Configures the project as an ES module (`"type": "module"`)

## 🤝 Dependencies

- **Node.js** (24.x or newer recommended)
  - Includes native `fetch`, so no HTTP client library is required
- **ical-generator**
  - Used to generate standards-compliant `.ics` calendar output  
  - <https://www.npmjs.com/package/ical-generator>

## 🏗️ Installation

1. Clone this repo locally.

2. Use `npm` to install the `ical-generator` library in the repo.

3. Update settings in `config/config.json` as desired.

4. Follow the instructions in [README-AWS.md](README-AWS.md) to deploy to AWS Lambda.

## ⚙️ Configuration Options

### Environmental Variables

| Key | Value | Required |
| ---- | ------ | ---- |
| `CRM_BASE_URL` | Your Tessitura API base URL | Yes |
| `CRM_AUTH_TOKEN` | Hashed token (user ID, user group ID, location, password) for Basic Authentication header | Yes |
| `ENV_NAME` | The name of the environment e.g. Test, Prod. When supplied, this is appended to event names. | No |

Example .env file (for local development)

### `config.json` 

| Key | Type | Value |
| ---- | ------ | ---- |
| calendar.name | String | The name of your ical feed. |
| calendar.domain | String | Your organization's website domain e.g. example.org. Used for generating unique IDs that calendar programs use to manage changes. |
| calendar.companyName | String | The name of your organization, used as the publisher name for the calendar feed. |

## License and Reuse

This project is intended to be reusable and adaptable for other Tessitura users. You are encouraged to fork or template the repository and adjust it to your organization’s needs.

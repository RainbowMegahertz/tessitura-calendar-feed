# Tessitura Calendar Feed

This project publishes public, subscribable calendar feeds (`.ics`) based on performances and/or worker steps in a Tessitura instance. The resulting feeds can be added to Outlook, Google Calendar, Apple Calendar, or any other calendar client that supports iCal subscriptions.

The application is implemented in Node.js and is designed to run as a lightweight serverless function. These instructions assume you are using AWS Lambda, but other options can be used too.

See [README-Install.md](README-Install.md) for installation instructions.

## 💡 Project Overview

### What this does

- Pulls event and/or worker step data from a Tessitura API
- Normalizes that data into calendar events
- Serves standards-compliant iCalendar (`.ics`) feeds

### Common use cases

- Internal staff calendars for upcoming performances synced from Tessitura
- A worker tracking their portfolio step due dates on their personal calendar

## 📄 Key files

**`index.js`**

- Entry point for the application
- Acts as the HTTP handler
- Orchestrates the workflow:
  1. Fetch events from the CRM
  2. Generate an iCalendar feed
  3. Return the `.ics` response

**`src/tessitura.js`**

- Interfaces with Tessitura API
- Normalizes CRM event data into a predictable internal format

**`src/calendar.js`**

- Converts normalized event data into an iCalendar feed

**`config/config.json`**

- Holds project-wide defaults, including organization info

**`package.json`**

- Defines project metadata
- Declares required dependencies
- Configures the project as an ES module (`"type": "module"`)

## 🤝 Dependencies

- **Tessitura v16**
- **Node.js** (24.x or newer recommended)
  - Includes native `fetch`, so no HTTP client library is required
- **ical-generator**
  - Used to generate standards-compliant `.ics` calendar output  
  - <https://www.npmjs.com/package/ical-generator>

## 📆 Usage

1. Build URLs to your calendar service.

    - Start with the base URL you created during installation, e.g. `https://abc123.execute-api.us-east-1.amazonaws.com/default/tessitura-calendar-feed/`

    - Add URL parameters to define the kinds of events you want in the feed. `includePerformances=true` and/or `includePlanSteps=true` must be included to return any data. See [URL Parameters](#url-parameters) for details.

2. Optional: Load your URL in a browser or Postman to vaidate the results. This is helpful because calendar programs cache feeds and often don't have a refresh option.

3. Subscribe to the feed in your calendar program.

## ⚙️ Configuration Options

### Environmental Variables

| Key | Definition | Required |
| ---- | ------ | ---- |
| `CRM_BASE_URL` | Your Tessitura API base URL | Yes |
| `CRM_AUTH_TOKEN` | Hashed token (user ID, user group ID, location, password) for Basic Authentication header | Yes |
| `ENV_NAME` | The name of the environment e.g. Test, Prod. Optional; when supplied, this is appended to event names. | No |

### `config.json` file

| Key | Type | Definition |
| ---- | ------ | ---- |
| calendar.name | String | The name of your ical feed. |
| calendar.domain | String | Your organization's website domain e.g. example.org. Used for generating unique IDs that calendar programs use to manage changes. |
| calendar.companyName | String | The name of your organization, used as the publisher name for the calendar feed. |

### URL Parameters

#### Global

Either `includePerformances=true` or `includePlanSteps=true` (or both) must be included to return any data in the feed.

| Parameters | Definition | Example |
| ---- | ------ | ---- |
| `includePerformances` | Controls whether performance data is included. | `true`, `false` |
| `includePlanSteps` | Controls whether worker plan step data is included. | `true`, `false` |
| `daysBack` | Number of days in the past to fetch data. Defaults to 30 if not supplied. | `7` |
| `daysForward` | Number of days in the future to fetch data. Defaults to 180 if not supplied. | `360` |

#### Performances

| Parameters | Definition | Example |
| ---- | ------ | ---- |
| `defaultDuration` | For performances without a Duration set, this value is used to determine the duration and end time. Defined in minutes. Defaults to 60 if not supplied. | `120` |
| `KeywordIds` | A comma-delimited list of keyword IDs that limits the performances returned. A performance only needs to have one of the keywords to be returned. | `5,7` |
| `PerformanceTypeIds` | A comma-delimited list of performance type IDs that limits the performances returned. | `12,18,20` |

#### Worker Plan Steps

| Parameters | Definition | Example |
| ---- | ------ | ---- |
| `workerId` | The constituent ID of the worker whose plan steps should be fetched. | `76543` |
| `includeCompleted` | Whether plan steps marked Completed should be included. | `true`, `false` |
| `includeManagedUsers` | Whether to include plan steps from users managed by the worker. | `true`, `false` |

## License and Reuse

This project is intended to be reusable and adaptable for other Tessitura users. You are encouraged to fork or template the repository and adjust it to your organization’s needs.

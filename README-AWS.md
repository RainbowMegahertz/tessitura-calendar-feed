# Deploying the Calendar Feed to AWS Lambda

This guide walks through deploying the Tessitura Calendar Feed to AWS Lambda, starting from creating an AWS account through exposing a public calendar feed endpoint.

No prior AWS experience is assumed.

## Prerequisites

- A GitHub clone of this repository
- Node.js 24.x or newer installed locally
- An AWS account (free tier is sufficient)

## Step 1: Create an AWS Account

1. Go to <https://aws.amazon.com>
2. Click **Create an AWS Account**
3. Follow the prompts to set up billing and identity
4. Log in to the **AWS Management Console**

## Step 2: Create a Lambda Function

1. Navigate to **Lambda** in the AWS Console
2. Click **Create function**
3. Choose **Author from scratch**
4. Set:
   - **Function name:** `tessitura-calendar-feed`
   - **Runtime:** Node.js 24.x
5. Click **Create function**

## Step 3: Configure Environment Variables

1. Open your Lambda function
2. Go to **Configuration → Environment variables**
3. Add the following variables:

| Key | Value |
| ---- | ------ |
| `CRM_BASE_URL` | Your Tessitura API base URL |
| `CRM_AUTH_TOKEN` | Your authentication token |

Save changes.

## Step 4: Prepare the Deployment Package

Lambda requires a ZIP file that includes:

- Source files
- `node_modules`
- `package.json`

### Build the package locally

```bash
npm install --omit=dev
```

Ensure your project folder contains:

1. lambda.js
2. src/
3. node_modules/
4. package.json

### Create the ZIP file

On Windows or macOS:

1. Select the files and folders listed above
2. Use your file explorer’s Compress / Zip feature

Do not use PowerShell Compress-Archive, as it may produce invalid folder structures for Lambda.

## Step 5: Upload Code to Lambda

1. In the Lambda function page, go to **Code**
2. Choose **Update > Update from .zip file**
3. Upload your ZIP file
4. Save

## Step 6: Set the Handler and Timeout

### Handler

Go to Code > Runtime settings > Edit. Ensure the handler is set to **lambda.handler**

### Timeout

1. Go to Configuration → General configuration
2. Set timeout to 30 seconds
3. Save

## Step 7: Create an API Gateway Endpoint

1. In the Lambda function page, click Add trigger
2. Choose API Gateway
3. Choose "Create a new API"
4. Select:

   - API type: HTTP API
   - Security: Open

5. Create the API

AWS will generate a public URL similar to:

```bash
https://xxxxxxxx.execute-api.region.amazonaws.com
```

## Step 8: Test the Calendar Feed

1. Append your route (for example): /feed.ics
2. Open the full URL in a browser or add it to a calendar client as a subscription.

You should receive a valid .ics file.

## Step 9: Subscribe in Calendar Clients

Most calendar applications support subscription URLs:

- Google Calendar: Settings → Add calendar → From URL
- Outlook: Add calendar → Subscribe from web
- Apple Calendar: File → New Calendar Subscription

Once subscribed, the calendar will refresh automatically based on the client’s polling interval.

## Operational Notes

- Lambda logs are available in CloudWatch Logs
- API Gateway returns generic errors; CloudWatch is the source of truth
- Calendar clients may cache aggressively — updates may not appear immediately
- Consider rate limiting or caching if CRM traffic is a concern

## Cleanup and Cost Control

- Free tier is sufficient for most low-volume feeds
- Delete unused Lambda functions and APIs to avoid charges
- Monitor usage via AWS Billing → Cost Explorer

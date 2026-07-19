# 🏗️ Installation

This guide walks through the installation, initial config, and deployment of the Tessitura Calendar Feed to AWS Lambda.

## Step 1: Clone and update

1. Clone this repo locally.

2. Update settings in `config/config.json` as desired.

## Step 2: Install NPM and ical-generator

1. Install a [local version of Node.js](https://nodejs.org/en/download) if you don't already have it.

2. In the repo folder, install the `ical-generator` library:

```bash
npm install ical-generator
```

## Step 3: Tessitura Configuration

Create a user and user group in Tessitura for the integration.

- It's easiest to do this in Prod first and then copy down to other environments.

- The user group will need the following service rights permissions:

  - (ADD/GET) `/Finance/Workers/Steps`

  - (ADD/POST) `/TXN/Performances/Search` (this endpoint is read only but uses the POST verb)

- Generate an authentication string with the credentials you made: Take the `userID:userGroupID:machineLocation:password` string and base64 enacode it.

## Step 4: Create an AWS Account

1. Go to <https://aws.amazon.com>
2. Click **Create an AWS Account**
3. Follow the prompts to set up billing and identity
4. Log in to the **AWS Management Console**

## Step 5: Create a Lambda Function

1. Navigate to **Lambda** in the AWS Console
2. Click **Create function**
3. Choose **Author from scratch**
4. Set:
   - **Function name:** `tessitura-calendar-feed`
   - **Runtime:** Node.js 24.x
5. Click **Create function**

## Step 6: Configure Environment Variables

1. Open your Lambda function
2. Go to **Configuration → Environment variables**
3. Add the variables described in [Environmental Variables](README.md#environmental-variables)
4. Save changes

## Step 7: Prepare the Deployment Package

Select the files and folders listed below and combine them into a ZIP file.

1. index.js
2. package.json
3. src/
4. node_modules/
5. config/

## Step 8: Upload Code to Lambda

1. In the Lambda function page, go to **Code**
2. Choose **Update > Update from .zip file**
3. Upload your ZIP file
4. Save

## Step 9: Set the Timeout

1. Go to Configuration → General configuration
2. Set timeout to 30 seconds
3. Save

## Step 10: Create an API Gateway Endpoint

1. In the Lambda function page, click Add trigger
2. Choose API Gateway
3. Choose "Create a new API"
4. Select:

   - API type: HTTP API
   - Security: Open

5. Create the API

AWS will generate a public URL similar to: `https://abc123.execute-api.us-east-1.amazonaws.com/default/tessitura-calendar-feed/`

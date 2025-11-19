# RUNNING (Local Development)

This document describes how to run the project locally (DynamoDB + MySQL + serverless offline). Follow the steps below.

## Prerequisites

- Ask a member of the cloud team to enable access to AWS, specifically the `claranet-brickly` account.
- Open the AWS SSO portal for Claranet:
  https://it-claranet.awsapps.com/start/#/?tab=accounts

## Set AWS credentials (SSO)

From the AWS SSO portal, copy the export commands for the session and run them in your VS Code terminal. Example exports:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
```

Paste the three export lines in the terminal and press Enter.

## Project setup

1. Remove existing node_modules (if any) and install dependencies:

```bash
rm -rf node_modules
npm install
```

2. Install local DynamoDB (project script):

```bash
npm run dynamodb:install
```

## Environment variables

Create a `.env` file in the project root if it doesn't exist and add the following variables (example values):

```env
DATABASE_URL=...
RECEIVER_EMAIL=...
SENDER_EMAIL=...
BRICKLY_API_KEY_ARN=...
```

Adjust the values to match your local setup / secrets.

## Start Docker services

Bring up required containers:

```bash
docker compose up -d
```

## Seed local DynamoDB (optional)

If your local DB is empty, run the serverless-dynamodb seed command defined in package.json:

```bash
npm run dynamodb:start:dev:interactive
# which runs: sls dynamodb start --stage=dev --seed
```

## Prisma

Generate Prisma client:

```bash
npx prisma generate
```

## Run serverless offline

Start the backend in offline mode (dev stage):

```bash
npm run offline
# script: "offline": "STAGE_NAME=dev sls offline --stage=dev start"
```

## Inspecting DynamoDB data (NoSQL Workbench)

1. Install and open NoSQL Workbench.
2. Create a local connection:
   - Operation Builder → Add connection → DynamoDB local
   - Set a connection name and port `8002`
3. To copy production data into your local DynamoDB (optional):
   - Create a Remote connection to Brickly prod:
     - Region: `eu-south-1`
     - Use AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN) for prod
   - For each table in NoSQL Workbench: use the table menu → Clone table.
     - Destination: your local connection
     - Set "items to clone" to `99999` (or appropriate number)

Notes and tips:
- Ensure your AWS SSO session is active while performing remote operations.
- If ports or credentials differ in your environment, update commands and `.env` accordingly.
- If you face permission issues accessing AWS resources, contact the cloud team to confirm account roles and policies.
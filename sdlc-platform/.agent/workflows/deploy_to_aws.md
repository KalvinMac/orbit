---
description: Guide to manually deploy the SDLC Platform to Amazon Web Services (AWS) using the Management Console.
---

# Deploy SDLC Platform to AWS (Management Console)

This guide outlines the steps to deploy your full-stack application to AWS using the browser-based Management Console.

## Prerequisites

1.  **AWS Account**: An active AWS account.
2.  **Git Repository**: Your code pushed to GitHub, GitLab, or Bitbucket.
3.  **Local Tools**: `docker` and `postgresql-client` (for `pg_dump`/`psql`) installed.

---

## Phase 1: Database Setup (Amazon RDS)

We will use **Amazon RDS for PostgreSQL**.

1.  **Create Database**:
    *   Log in to AWS Console and navigate to **RDS**.
    *   Click **Create database**.
    *   **Choose a database creation method**: Standard create.
    *   **Engine options**: PostgreSQL.
    *   **Templates**: Free tier (if applicable) or Dev/Test.
    *   **Settings**:
        *   **DB instance identifier**: `sdlc-db-instance`.
        *   **Master username**: `postgres`.
        *   **Master password**: Set a strong password.
    *   **Connectivity**:
        *   **Public access**: **Yes** (Temporarily, for data migration).
        *   **VPC security group**: Create new (e.g., `sdlc-db-sg`).
    *   Click **Create database**.

2.  **Configure Security Group** (Allow your IP):
    *   Wait for the database status to be **Available**.
    *   Click the instance name -> **Connectivity & security** tab.
    *   Click the link under **VPC security groups**.
    *   Select the Security Group -> **Inbound rules** -> **Edit inbound rules**.
    *   Add Rule: Type **PostgreSQL**, Source **My IP**.
    *   Save rules.

## Phase 2: Data Migration

Since we enabled public access (limited to your IP), we can push data directly from your local machine.

1.  **Export Local Data**:
    Run this in your local terminal to dump the Docker database:
    ```bash
    docker exec -t sdlc-platform-db-1 pg_dump -U postgres sdlc_platform > dump.sql
    ```

2.  **Import to RDS**:
    Get the **Endpoint** URL from the RDS Console (Connectivity tab).
    ```bash
    # Replace ENDPOINT with your actual RDS endpoint
    psql -h ENDPOINT -U postgres -d postgres -f dump.sql
    ```
    *Note: If the `sdlc_platform` database doesn't exist, the dump script usually creates it. If not, connect first and run `CREATE DATABASE sdlc_platform;`.*

3.  **Secure Database**:
    *   (Optional but recommended) Go back to RDS -> Modify -> **Connectivity** -> **Public access**: **No**.
    *   *Note: If you disable public access, ensure your Backend service (App Runner) is in the same VPC or has a way to connect. Keeping it Public but restricted by Security Group is often easier for simple App Runner setups.*

---

## Phase 3: Backend Deployment (AWS App Runner)

**AWS App Runner** is the easiest way to deploy containerized web apps.

1.  **Create Service**:
    *   Navigate to **AWS App Runner**.
    *   Click **Create service**.
    *   **Repository type**: Source code repository.
    *   **Connect to GitHub**: Follow prompts to authorize.
    *   **Repository**: Select your repo.
    *   **Branch**: `main`.
    *   **Source directory**: `/backend`.
    *   **Deployment settings**: Automatic.

2.  **Configure Build**:
    *   **Runtime**: Node.js 16 (or match your local version).
    *   **Build command**: `npm install && npm run build` (or just `npm install` if using `ts-node`).
    *   **Start command**: `npm start`.
    *   **Port**: `4000`.

3.  **Environment Variables**:
    *   In the **Service settings** step, add variables:
        *   `DB_HOST`: Your RDS Endpoint.
        *   `DB_USER`: `postgres`.
        *   `DB_PASS`: 'ZaQ7wtteV64qrXieacWd'.
        *   `DB_NAME`: `sdlc_platform`.
        *   `PORT`: `4000`.

4.  **Deploy**:
    *   Click **Create & deploy**.
    *   Wait for the service to become active.
    *   Copy the **Default domain** (e.g., `https://xyz.awsapprunner.com`).

---

## Phase 4: Frontend Deployment (AWS Amplify)

**AWS Amplify** handles building and hosting static sites seamlessly.

1.  **Create App**:
    *   Navigate to **AWS Amplify**.
    *   Scroll to **Get started** -> **Host your web app**.
    *   Select **GitHub** -> Continue.

2.  **Configure Build**:
    *   Select Repository and Branch.
    *   **Monorepo settings**: Check "My app is a monorepo".
    *   **Root directory**: `frontend`.
    *   **Build settings**: Amplify usually auto-detects `npm run build`.
    *   **Environment Variables**:
        *   Key: `REACT_APP_API_URL`
        *   Value: Your App Runner URL (e.g., `https://xyz.awsapprunner.com/graphql`).

3.  **Deploy**:
    *   Click **Save and deploy**.
    *   Amplify will build your frontend and deploy it to a global CDN.

---

## Summary

*   **Database**: RDS PostgreSQL (Migrated via local terminal).
*   **Backend**: AWS App Runner (Connected to GitHub).
*   **Frontend**: AWS Amplify (Connected to GitHub).
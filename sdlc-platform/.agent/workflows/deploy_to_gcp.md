---
description: Guide to manually deploy the SDLC Platform to Google Cloud Platform (GCP) ensuring data persistence.
---

# Deploy SDLC Platform to Google Cloud

This guide outlines the steps to deploy your full-stack application (React Frontend, Node.js Backend, PostgreSQL Database) to Google Cloud Platform, including migrating your existing local data.

## Prerequisites

1.  **GCP Project**: A Google Cloud Project with billing enabled.
2.  **Tools**: `gcloud` CLI and `docker` installed locally.
3.  **APIs Enabled**: Cloud Run API, Cloud SQL Admin API, Artifact Registry API, Cloud Build API.

---

## Phase 1: Database Migration (Cloud SQL)

We will use **Cloud SQL for PostgreSQL** as the managed database service.

1.  **Create Cloud SQL Instance**:
    ```bash
    gcloud sql instances create sdlc-db-instance \
        --database-version=POSTGRES_14 \
        --cpu=1 --memory=3840MiB \
        --region=us-central1
    ```

2.  **Set Password**:
    ```bash
    gcloud sql users set-password postgres --instance=sdlc-db-instance --password=YOUR_SECURE_PASSWORD
    ```

3.  **Create Database**:
    ```bash
    gcloud sql databases create sdlc_platform --instance=sdlc-db-instance
    ```

4.  **Dump Local Data**:
    Export your local Docker database data to a SQL file.
    ```bash
    # Replace 'sdlc-platform-db-1' with your actual db container name if different
    docker exec -t sdlc-platform-db-1 pg_dump -U postgres sdlc_platform > dump.sql
    ```

5.  **Import to Cloud SQL**:
    *   Create a Google Cloud Storage bucket and upload `dump.sql`.
    *   Import the file into Cloud SQL:
        ```bash
        gcloud sql import sql sdlc-db-instance gs://YOUR_BUCKET_NAME/dump.sql --database=sdlc_platform
        ```

---

## Phase 2: Backend Deployment (Cloud Run)

We will containerize the backend and run it on **Cloud Run** (serverless containers).

1.  **Configure Artifact Registry**:
    ```bash
    gcloud artifacts repositories create sdlc-repo --repository-format=docker --location=us-central1
    ```

2.  **Build & Push Backend Image**:
    Navigate to `backend/` directory.
    ```bash
    gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/sdlc-repo/backend:v1 .
    ```

3.  **Deploy to Cloud Run**:
    *   Note the **Connection Name** of your Cloud SQL instance (`gcloud sql instances describe sdlc-db-instance`).
    *   Deploy with environment variables pointing to Cloud SQL.
    ```bash
    gcloud run deploy sdlc-backend \
        --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/sdlc-repo/backend:v1 \
        --region us-central1 \
        --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:sdlc-db-instance \
        --set-env-vars DB_HOST=/cloudsql/YOUR_PROJECT_ID:us-central1:sdlc-db-instance \
        --set-env-vars DB_USER=postgres \
        --set-env-vars DB_PASS=YOUR_SECURE_PASSWORD \
        --set-env-vars DB_NAME=sdlc_platform
    ```
    *   *Make note of the generated Backend URL (e.g., https://sdlc-backend-xyz.a.run.app).*

---

## Phase 3: Frontend Deployment

We will build the frontend to point to the live backend and deploy it.

1.  **Update Environment**:
    In your local `frontend/` directory, update (or create) `.env.production`:
    ```
    REACT_APP_API_URL=https://sdlc-backend-xyz.a.run.app/graphql
    ```

2.  **Option A: Cloud Run (Serving Static Files)**
    *   You need a simple `Dockerfile` in `frontend/` that uses Nginx to serve the build.
    *   **Build & Push**:
        ```bash
        gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/sdlc-repo/frontend:v1 .
        ```
    *   **Deploy**:
        ```bash
        gcloud run deploy sdlc-frontend \
            --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/sdlc-repo/frontend:v1 \
            --region us-central1
        ```

3.  **Option B: Firebase Hosting (Simpler for Static Sites)**
    *   `npm run build`
    *   `firebase init` (Select Hosting)
    *   `firebase deploy`

---


---

# Option 2: Using Google Cloud Console (Web UI)

If you prefer using the graphical interface instead of the terminal, follow these steps.

## Phase 1: Database Setup & Migration

**1. Create Cloud SQL Instance**
*   Go to **SQL** in the Cloud Console menu.
*   Click **Create Instance** -> **Choose PostgreSQL**.
*   **Instance ID**: `sdlc-db-instance`.
*   **Password**: Generate or enter a strong password (save this!).
*   **Database version**: PostgreSQL 14 (or matching your local version).
*   **Region**: `us-central1`.
*   Click **Create Instance**. (This takes a few minutes).

**2. Create Database**
*   Once the instance is ready, click on it to open the Overview.
*   Go to the **Databases** tab on the left.
*   Click **Create Database**.
*   Name it `sdlc_platform` and click **Create**.

**3. Import Data**
*   **Export Local Data (One-time Terminal Command)**:
    You must export your data from your local machine first. Run this in your local terminal:
    ```bash
    docker exec -t sdlc-platform-db-1 pg_dump -U postgres sdlc_platform > dump.sql
    ```
*   **Upload to Cloud Storage**:
    *   Go to **Cloud Storage** -> **Buckets**.
    *   Click **Create** to make a temporary bucket (e.g., `sdlc-migration-bucket`).
    *   Open the bucket and click **Upload Files** -> Select your `dump.sql`.
*   **Import to Cloud SQL**:
    *   Go back to your **SQL** instance.
    *   Click **Import**.
    *   **Source**: Browse and select `dump.sql` from your bucket.
    *   **Destination Database**: Select `sdlc_platform`.
    *   Click **Import**.

## Phase 2: Backend Deployment (Cloud Run)

*Pre-requisite: Your code should be pushed to a Git repository (GitHub, GitLab, or Bitbucket) connected to your Google Cloud account.*

**1. Create Service**
*   Go to **Cloud Run**.
*   Click **Create Service**.
*   Select **Continuously deploy new revisions from a source repository**.
*   **Setup Cloud Build**: Authenticate with your Git provider and select your repository.
    *   **Build Configuration**: Select **Dockerfile**.
    *   **Source location**: `/backend`. (Ensure it points to `backend/Dockerfile`).

**2. Configure Settings**
*   **Service Name**: `sdlc-backend`.
*   **Region**: `us-central1`.
*   **Authentication**: Allow unauthenticated invocations (if this is a public API) or Require authentication (if internal).
*   Expand **Container, Networking, Security**:
    *   **Variables & Secrets** tab: Add Environment Variables:
        *   `DB_HOST`: `/cloudsql/YOUR_PROJECT_ID:us-central1:sdlc-db-instance` (Instance Connection Name)
        *   `DB_USER`: `postgres`
        *   `DB_PASS`: (Your SQL password)
        *   `DB_NAME`: `sdlc_platform`
    *   **Cloud SQL Connections** tab: Click **Add Connection** and select `sdlc-db-instance`.
*   Click **Create**.

## Phase 3: Frontend Deployment

**1. Create Service**
*   Go to **Cloud Run** -> **Create Service**.
*   Select **Continuously deploy new revisions from a source repository**.
*   Select your repository again.
    *   **Source location**: `/frontend`. (Ensure it points to `frontend/Dockerfile`).

**2. Configure Settings**
*   **Service Name**: `sdlc-frontend`.
*   **Authentication**: Allow unauthenticated invocations.
*   **Variables**:
    *   `REACT_APP_API_URL`: Paste the URL of the Backend service you just created (e.g. `https://sdlc-backend-xyz.a.run.app/graphql`).
*   Click **Create**.

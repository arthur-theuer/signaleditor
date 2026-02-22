# Setup Guide

## Prerequisites

- A [Vercel](https://vercel.com) account with the project deployed
- The project uses `@sveltejs/adapter-vercel` — it must be deployed on Vercel

## Environment Variables

Two environment variables are required. Set them in **Vercel Dashboard → Project → Settings → Environment Variables**.

| Variable | Purpose |
|---|---|
| `EDITOR_PIN` | The PIN users enter to log in. Set to any value you choose (e.g. `1234`). |
| `BLOB_READ_WRITE_TOKEN` | Auth token for Vercel Blob storage. Auto-set when you connect a Blob store. |

## Setting Up Vercel Blob Storage

The app stores YAML signal files in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). You need to create a Blob store and connect it to your project.

### 1. Create the Blob Store

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** in the top navigation
3. Click **Create Database** → select **Blob**
4. Name it (e.g. `signaleditor-files`) and create it

### 2. Connect to Your Project

1. In the Blob store page, click **Connect Project**
2. Select your Signaleditor project
3. This automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment variables

### 3. Set the Editor PIN

1. Go to your project → **Settings** → **Environment Variables**
2. Add `EDITOR_PIN` with your chosen PIN value
3. Select all environments (Production, Preview, Development)

### 4. Redeploy

After setting variables, redeploy for them to take effect. Either push a new commit or go to **Deployments** → click the three dots on the latest deployment → **Redeploy**.

## How Storage Works

### File Organization

Files are stored in Vercel Blob with a prefix-based directory structure:

```
videos/          — Video signal data files
  s1_zh_be.yaml
  s9_uster_zg.yaml
strecken/        — Strecke signal data files
  s5_pf_zg.yaml
```

The file name is derived from the metadata fields (e.g. streckennummer, von, nach).

### Authentication Flow

1. User clicks the lock icon in the toolbar
2. Enters the PIN in the prompt
3. Client sends `POST /api/auth` with the PIN
4. Server compares against `EDITOR_PIN` env var
5. On success, the PIN is stored client-side and sent as `Authorization: Bearer <pin>` on all subsequent API requests

### API Endpoints

All file endpoints require authentication (PIN in Authorization header).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth` | Verify PIN, returns `{ ok: true }` or 401 |
| `GET` | `/api/files?typ=videos\|strecken` | List all files of a type |
| `POST` | `/api/files?typ=videos\|strecken` | Create a new file (409 if exists) |
| `GET` | `/api/files/:name?typ=videos\|strecken` | Read file content |
| `PUT` | `/api/files/:name?typ=videos\|strecken` | Update file content |
| `DELETE` | `/api/files/:name?typ=videos\|strecken` | Delete a file |

### Auto-Save

When logged in and a file is open (has a `currentFileName`), changes are auto-saved after 3 seconds of inactivity. The save status indicator in the toolbar shows:

- **Orange dot** — unsaved changes
- **"Speichern..."** — save in progress
- **"Gespeichert"** — saved successfully

### Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `HTTP 500` on any request | `EDITOR_PIN` not set | Add `EDITOR_PIN` in Vercel env vars |
| `HTTP 500` on save/list | `BLOB_READ_WRITE_TOKEN` missing | Connect a Blob store to the project |
| `HTTP 401` | Wrong PIN entered | Enter the correct PIN matching `EDITOR_PIN` |
| `HTTP 409` on save | File already exists | Confirm overwrite when prompted |

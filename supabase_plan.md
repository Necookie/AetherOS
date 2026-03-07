# Supabase Plan for AetherOS

## Purpose

This document outlines the implementation plan for **authentication**, **storage management**, and **download handling** in AetherOS.

The goal is to use **Supabase** for real persistence while still keeping the project aligned with the academic expectations of an **Operating Systems** subject. That means Supabase will act as the backend platform, while AetherOS itself will simulate OS-like behavior such as user workspaces, file ownership, virtual storage capacity, and browser-to-filesystem downloads.

---

## Core Design Principle

Supabase is **not** the storage-management simulation by itself.

Instead:

* **Supabase Auth** handles account creation, login, logout, and session persistence.
* **Supabase Database** stores metadata for users, files, folders, sessions, and storage usage.
* **Supabase Storage** stores the actual uploaded or downloaded file blobs.
* **AetherOS** provides the OS simulation layer:

  * per-user home directories
  * virtual file system views
  * storage quotas
  * file metadata and organization
  * download behavior inside the simulated OS

---

## Scope

This plan covers three areas:

1. **Authentication System**
2. **Storage Management System**
3. **Download and Export Flow**

---

# 1. Authentication Plan

## Objectives

The authentication system should make AetherOS feel like a multi-user operating system environment.

Each user should have:

* their own account
* their own file space
* their own desktop/session state
* their own settings and preferences

## Features

### Required

* Sign up
* Login
* Logout
* Session persistence
* Protected routes / protected desktop access
* Per-user workspace loading

### Optional but strong additions

* Remember previous session
* Lock screen
* Switch user
* Profile settings

## User Flow

### Sign Up

1. User creates an account.
2. Supabase Auth registers the account.
3. A user profile record is created in the database.
4. Default folders are seeded for the user.

### Login

1. User logs in with email/password.
2. Supabase returns a session.
3. AetherOS loads:

   * user profile
   * storage usage
   * home directory structure
   * previous desktop/session state if implemented
4. User enters the desktop environment.

### Logout

1. Save session state if enabled.
2. Clear local state.
3. Sign out from Supabase.
4. Return to login/lock screen.

## Recommended Tables

### `profiles`

Stores user-related app metadata.

Suggested fields:

* `id` (UUID, same as auth user id)
* `username`
* `display_name`
* `avatar_url` (optional)
* `storage_quota_bytes`
* `created_at`
* `updated_at`

### `user_settings`

Stores personalized desktop settings.

Suggested fields:

* `id`
* `user_id`
* `wallpaper`
* `theme`
* `desktop_layout`
* `accessibility_settings`
* `updated_at`

### `user_sessions` (optional)

Stores restore points for desktop state.

Suggested fields:

* `id`
* `user_id`
* `open_windows_json`
* `active_apps_json`
* `last_path`
* `saved_at`

## Auth Rules

Every user should only access:

* their own profile
* their own files
* their own folders
* their own settings
* their own session data

This should be enforced using **Row Level Security (RLS)**.

---

# 2. Storage Management Plan

## Objectives

The storage system should support two layers:

1. **real persistence** using Supabase
2. **OS-style storage simulation** inside AetherOS

This allows the project to satisfy both technical and academic goals.

## Design Model

### Real backend layer

Supabase will persist:

* uploaded files
* downloaded files
* folder/file metadata
* ownership
* timestamps

### Simulated OS layer

AetherOS will display and manage:

* virtual home directories
* per-user storage quotas
* used/free storage
* file sizes
* file organization
* Downloads/Documents/Desktop folders
* possible future block allocation or fragmentation visualization

## Default User Directory Structure

When a new account is created, seed folders such as:

* `/home/{username}`
* `/home/{username}/Desktop`
* `/home/{username}/Documents`
* `/home/{username}/Downloads`
* `/home/{username}/Pictures`
* `/home/{username}/Trash`

## Recommended Data Model

### `folders`

Suggested fields:

* `id`
* `user_id`
* `name`
* `parent_id` (nullable)
* `full_path`
* `created_at`
* `updated_at`

### `files`

Suggested fields:

* `id`
* `user_id`
* `folder_id` (nullable)
* `name`
* `full_path`
* `mime_type`
* `size_bytes`
* `storage_key`
* `source_type` (`upload`, `download`, `system`, `generated`)
* `source_url` (nullable)
* `is_deleted`
* `created_at`
* `updated_at`

### `storage_usage` (optional)

If not computed on the fly, usage can be cached.

Suggested fields:

* `user_id`
* `used_bytes`
* `quota_bytes`
* `updated_at`

## Storage Bucket Layout

Use one main bucket, for example:

* `user-files`

Recommended storage key format:

* `user-files/{user_id}/home/{username}/Documents/file-name.ext`
* `user-files/{user_id}/home/{username}/Downloads/file-name.ext`

This keeps ownership and organization clear.

## Core File Operations

### Create / Upload

* validate size and type
* check quota before upload
* upload blob to Supabase Storage
* write metadata to `files`
* refresh storage usage

### Read / Open

* fetch metadata from database
* retrieve signed URL or file blob
* open using appropriate app when possible

### Rename

* update metadata
* update `full_path`
* optionally move storage key if path-based storage is used

### Move

* update folder reference and path
* update storage key if needed

### Delete

Two possible approaches:

#### Soft delete (recommended)

* mark file as deleted
* move it to Trash logically
* allow restore

#### Hard delete

* remove metadata row
* remove blob from Storage

### Quota Check

Before upload or browser download:

* compute or fetch current used storage
* compare with quota
* reject if size exceeds available space

## Recommended UI Features for Storage Management

To support the OS subject requirement, the UI should clearly show:

* total storage capacity
* used storage
* free storage
* file sizes
* file type icons
* Downloads folder
* Trash / deleted files

### Stronger academic version

Add a **Storage Manager panel** that shows:

* quota bar
* storage by file category
* recent downloads
* largest files
* optional virtual block map

---

# 3. Download Handling Plan

## Objectives

AetherOS should support downloads in two meanings:

1. **download into the simulated OS**
2. **download from the simulated OS to the real device**

Both should be supported.

---

## A. Download Into AetherOS

This simulates what happens when a user downloads a file from the in-system browser.

### Target behavior

When a user clicks a downloadable file in the AetherOS browser:

1. the browser detects the download action
2. the system asks where to save it, or defaults to `Downloads`
3. the file is stored in Supabase Storage
4. a metadata record is inserted into the `files` table
5. storage usage updates
6. the file appears in File Manager
7. the user gets a success/failure notification

### Recommended destination

Default path:

* `/home/{username}/Downloads`

### File metadata needed

At minimum:

* `user_id`
* `name`
* `mime_type`
* `size_bytes`
* `storage_key`
* `source_type = download`
* `source_url`
* `folder_id` or `full_path`

---

## B. Export From AetherOS to Real Device

This is the reverse operation.

### Target behavior

When the user clicks **Download to device** in File Manager:

1. retrieve the stored file from Supabase Storage
2. generate a signed URL or fetch blob
3. trigger normal browser download to the real device

This makes the virtual file system useful outside the simulation.

---

## Download Implementation Options

### Option 1: Backend-managed download flow (recommended)

This is best for external URLs.

Flow:

1. browser app sends a request to the backend with the file URL
2. backend validates the URL
3. backend fetches the remote file
4. backend checks content type / size limits
5. backend uploads the file to Supabase Storage
6. backend inserts metadata into the database
7. frontend refreshes the Downloads folder

### Why this is recommended

* avoids many frontend CORS issues
* gives more control over validation
* allows file-size limits
* lets the backend log download history

### Option 2: Frontend direct upload flow

This is useful when the file already exists as a blob in the client.

Examples:

* uploaded local files
* generated text files
* screenshots or exported app content

Flow:

1. client obtains blob/file
2. client uploads to Supabase Storage
3. client writes metadata row
4. UI refreshes

---

## Download Manager Module

To make the system more OS-like, add a simple **Download Manager**.

Suggested tracked states:

* queued
* downloading
* completed
* failed
* canceled

Suggested fields in a `downloads` table (optional):

* `id`
* `user_id`
* `file_name`
* `source_url`
* `status`
* `progress_percent`
* `size_bytes`
* `created_at`
* `updated_at`

If a full table is too much, download state can be handled in memory first.

## Strong OS Simulation Extension

Represent downloads as background tasks or processes.

Examples:

* Browser starts a download service task
* Task Manager shows progress
* Download consumes network and storage
* Completed download disappears from active tasks

This is one of the best ways to connect:

* process management
* storage management
* HCI feedback

---

# Security Plan

## Rules to implement

### Auth

* require authenticated sessions for desktop access
* protect all user data with RLS

### Storage

* users can only read/write their own files
* validate file size limits
* validate file types when needed

### Downloads

* validate remote URLs on backend
* optionally allow only certain domains for demo stability
* reject oversized files
* sanitize file names

### API

* never expose service-role keys to the client
* keep privileged file-fetch/upload operations on the server

---

# RLS Planning Notes

## Database tables that should have RLS

* `profiles`
* `user_settings`
* `user_sessions`
* `folders`
* `files`
* `downloads`
* `storage_usage`

## Policy idea

For each user-owned table:

* `select`: only rows where `user_id = auth.uid()`
* `insert`: only rows where `user_id = auth.uid()`
* `update`: only rows where `user_id = auth.uid()`
* `delete`: only rows where `user_id = auth.uid()`

---

# Suggested Build Order

## Phase 1 — Authentication Foundation

* Set up Supabase project
* Configure Auth
* Create `profiles` table
* Implement sign up / login / logout
* Protect desktop routes
* Seed default folders on new user creation

## Phase 2 — Persistent File System

* Create `folders` and `files` tables
* Create `user-files` storage bucket
* Implement file upload from device into AetherOS
* Implement file listing in File Manager
* Implement rename / delete / move
* Add quota calculation

## Phase 3 — Browser Download to OS

* Add browser download interception
* Create backend download route
* Save downloads into user `Downloads`
* Show notifications and update File Manager
* Add export-to-device action

## Phase 4 — Stronger OS Simulation

* Add storage usage dashboard
* Add Trash behavior
* Add session restore
* Add download manager
* Connect downloads to task/process simulation

---

# Minimum Viable Version

If time is limited, the minimum viable implementation should include:

* Supabase Auth login/logout
* per-user home directory
* persistent file metadata table
* file upload from real device into AetherOS
* browser download into `/Downloads`
* export file from AetherOS to real device
* storage usage bar

That is enough to make the storage/auth side feel real and useful.

---

# Stronger Version for OS Subject

To better align with the Operating Systems subject, extend the plan with:

* user quotas as virtual disk capacity
* storage usage visualization
* download processes in Task Manager
* session restore after login
* optional block/allocation simulation
* optional recycle bin / restore flow

This turns Supabase-backed persistence into a stronger **OS-inspired storage management system** rather than just a normal web app file upload feature.

---

# Final Positioning

AetherOS should describe this system as:

> Supabase provides authentication, persistence, and file storage, while AetherOS implements a virtual multi-user operating system layer that simulates user workspaces, storage organization, download behavior, and file access inside the desktop environment.

That wording keeps the project technically honest while still sounding strong for the subject requirements.

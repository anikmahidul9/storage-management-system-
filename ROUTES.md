# API Routes Documentation

This document outlines the API routes for the Storage Management System, including HTTP methods, endpoints, and example request bodies for testing with tools like Postman.

**Base URL:** `http://localhost:5000/api/v1` (assuming default port and API version)

## Authentication Routes (`/api/v1/users`)

### 1. User Signup
- **Method:** `POST`
- **Endpoint:** `/users/signup`
- **Description:** Registers a new user.
- **Request Body Example:**
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

### 2. User Login
- **Method:** `POST`
- **Endpoint:** `/users/login`
- **Description:** Logs in an existing user and returns a JWT.
- **Request Body Example:**
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

### 3. Forgot Password
- **Method:** `POST`
- **Endpoint:** `/users/forgot-password`
- **Description:** Initiates the password reset process by sending a reset token to the user's email.
- **Request Body Example:**
  ```json
  {
    "email": "test@example.com"
  }
  ```

### 4. Reset Password
- **Method:** `PATCH`
- **Endpoint:** `/users/reset-password/:token`
- **Description:** Resets the user's password using a valid reset token.
- **Request Body Example:**
  ```json
  {
    "password": "newpassword123"
  }
  ```

### 5. User Logout
- **Method:** `GET`
- **Endpoint:** `/users/logout`
- **Description:** Logs out the current user by clearing the JWT cookie.

### 6. Update Password (Protected)
- **Method:** `PATCH`
- **Endpoint:** `/users/update-password`
- **Description:** Allows a logged-in user to change their password.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "strongnewpassword"
  }
  ```

## Folder Routes (`/api/v1/folders`)

### 1. Create Folder (Protected)
- **Method:** `POST`
- **Endpoint:** `/folders`
- **Description:** Creates a new folder for the authenticated user.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "name": "My New Folder",
    "parent": "<OPTIONAL_PARENT_FOLDER_ID>"
  }
  ```

### 2. Get All Folders (Protected)
- **Method:** `GET`
- **Endpoint:** `/folders`
- **Description:** Retrieves all folders for the authenticated user.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 3. Rename Folder (Protected)
- **Method:** `PUT`
- **Endpoint:** `/folders/:id/rename`
- **Description:** Renames an existing folder.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "name": "Renamed Folder Name"
  }
  ```

### 4. Toggle Favorite Folder (Protected)
- **Method:** `PUT`
- **Endpoint:** `/folders/:id/favorite`
- **Description:** Toggles the favorite status of a folder.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 5. Delete Folder (Protected)
- **Method:** `DELETE`
- **Endpoint:** `/folders/:id`
- **Description:** Deletes a folder and its contents recursively.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

## File Routes (`/api/v1/file`)

### 1. Upload File (Protected)
- **Method:** `POST`
- **Endpoint:** `/file/upload`
- **Description:** Uploads a file (image, PDF, document).
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:** `form-data` with a field named `file` containing the file.

### 2. Create Note (Protected)
- **Method:** `POST`
- **Endpoint:** `/file/notes`
- **Description:** Creates a new text note.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "title": "My Important Note",
    "content": "This is the content of my note.",
    "folder": "<OPTIONAL_FOLDER_ID>"
  }
  ```

### 3. Rename File (Protected)
- **Method:** `PUT`
- **Endpoint:** `/file/:id/rename`
- **Description:** Renames an existing file or note.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "name": "New File Name"
  }
  ```

### 4. Toggle Favorite File (Protected)
- **Method:** `PUT`
- **Endpoint:** `/file/:id/favorite`
- **Description:** Toggles the favorite status of a file or note.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 5. Duplicate File (Protected)
- **Method:** `POST`
- **Endpoint:** `/file/:id/duplicate`
- **Description:** Duplicates an existing file or note.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 6. Delete File (Protected)
- **Method:** `DELETE`
- **Endpoint:** `/file/:id`
- **Description:** Deletes a file or note by ID.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 7. Get Files by Type (Protected)
- **Method:** `GET`
- **Endpoint:** `/file/type/:type`
- **Description:** Retrieves files filtered by type (e.g., `image`, `pdf`, `note`, `other`).
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Query Parameters:**
  - `type`: Required. Can be `image`, `pdf`, `note`, or `other`.
  - `folderId`: Optional. Filter by a specific folder ID.
  - `search`: Optional. Search by file name or content (for notes).
- **Example:** `/file/type/image?folderId=60d5ec49f8c7a1b2c3d4e5f6&search=vacation`

### 8. Get All Organized Files (Protected)
- **Method:** `GET`
- **Endpoint:** `/file/all`
- **Description:** Retrieves all files for the authenticated user, organized by type (images, pdfs, notes, others).
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

## Share Routes (`/api/v1/share`)

### 1. Share Item (Protected)
- **Method:** `POST`
- **Endpoint:** `/share`
- **Description:** Shares a file or folder with another user.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "itemId": "<FILE_OR_FOLDER_ID>",
    "itemType": "file", // or "folder"
    "sharedWith": "<USER_ID_TO_SHARE_WITH>",
    "permission": "view" // or "edit"
  }
  ```

### 2. Get Shared Items (Protected)
- **Method:** `GET`
- **Endpoint:** `/share`
- **Description:** Retrieves items shared with the authenticated user.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

## Lock/Unlock Routes (`/api/v1/protect`)

### 1. Lock File (Protected)
- **Method:** `POST`
- **Endpoint:** `/protect/files/:id/lock`
- **Description:** Locks a file with a password.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "password": "lockpassword",
    "reason": "Confidential document"
  }
  ```

### 2. Unlock File (Protected)
- **Method:** `POST`
- **Endpoint:** `/protect/files/:id/unlock`
- **Description:** Unlocks a file with the correct password.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "password": "lockpassword"
  }
  ```

### 3. Lock Folder (Protected)
- **Method:** `POST`
- **Endpoint:** `/protect/folders/:id/lock`
- **Description:** Locks a folder with a password. Can optionally inherit lock to contents.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "password": "folderlock",
    "reason": "Project files",
    "inheritLock": true
  }
  ```

### 4. Unlock Folder (Protected)
- **Method:** `POST`
- **Endpoint:** `/protect/folders/:id/unlock`
- **Description:** Unlocks a folder with the correct password. Can optionally unlock inherited locks.
- **Headers:** `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body Example:**
  ```json
  {
    "password": "folderlock"
  }
  ```
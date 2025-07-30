# Session Timeout Implementation

## Overview
This implementation adds a 10-minute session timeout for regular users while keeping admin and subadmin sessions active indefinitely.

## Features

### Backend Changes

1. **New Middleware**: `sessionTimeoutMiddleware.js`
   - Checks user role from JWT token
   - Applies 10-minute timeout only to regular users (`role: "user"`)
   - Admin and subadmin users have no session timeout
   - Returns specific error message for session expiration

2. **Updated Authentication Routes**: `auth.js`
   - JWT tokens now include user role information
   - New `/refresh-session` endpoint for extending sessions
   - All protected routes updated to use session timeout middleware

3. **Updated Agent Management Routes**: `agentMap.js`
   - All protected routes updated to use session timeout middleware

### Frontend Changes

1. **Axios Configuration**: `axiosConfig.js`
   - Global request/response interceptors
   - Automatic token handling
   - Session expiration detection and logout

2. **Session Management Hook**: `useSessionTimeout.js`
   - Monitors session status
   - Tracks user activity
   - Shows timeout warnings
   - Handles session extension

3. **Session Timeout Modal**: `SessionTimeoutModal.jsx`
   - User-friendly countdown display
   - Options to extend session or logout
   - Automatic logout when time expires

4. **App Integration**: `App.jsx`
   - Global session timeout monitoring
   - Modal display for all authenticated pages

## How It Works

### For Regular Users (role: "user")
1. Session expires after 10 minutes of inactivity
2. **Timer automatically resets on user activity** (every 30 seconds)
3. Warning modal appears 1 minute before expiration
4. User can extend session or logout
5. Automatic logout if no action taken

### For Admin/Subadmin Users (role: "admin" or "subadmin")
1. No session timeout applied
2. Sessions remain active indefinitely
3. No warning modals shown

### Session Extension
1. **Automatic**: User activity resets timer every 30 seconds
2. **Manual**: User clicks "Extend Session" in modal
3. Frontend calls `/api/auth/refresh-session` endpoint
4. Backend generates new JWT token
5. Frontend updates stored token
6. Session continues normally

## API Endpoints

### New Endpoint
- `POST /api/auth/refresh-session`
  - Requires valid JWT token
  - Returns new token and user data
  - Resets session timer

### Updated Endpoints
All protected endpoints now use `sessionTimeoutMiddleware` instead of `authMiddleware`:
- `GET /api/auth/user`
- `PATCH /api/auth/update-plan`
- `DELETE /api/auth/delete-account`
- `GET /api/auth/users`
- All `/api/agentMap/*` endpoints

## Error Responses

### Session Expired
```json
{
  "error": "Session expired",
  "message": "Your session has expired. Please log in again.",
  "sessionExpired": true
}
```

### Invalid Token
```json
{
  "error": "Invalid token"
}
```

## Security Considerations

1. **Role-Based Timeout**: Only regular users have session timeouts
2. **Automatic Logout**: Expired sessions automatically redirect to login
3. **Token Refresh**: Secure session extension mechanism
4. **Activity Monitoring**: Tracks user interaction to detect inactivity

## Testing

Run the test script to verify functionality:
```bash
cd backend
node test-session-timeout.js
```

## Configuration

The timeout duration can be modified in:
- Backend: `sessionTimeoutMiddleware.js` (line with `tenMinutesInMs`)
- Frontend: `useSessionTimeout.js` (line with `tenMinutesInMs`)

## Dependencies

### Backend
- `jsonwebtoken` (already installed)

### Frontend
- `jwt-decode` (newly installed)
- `react-router-dom` (already installed)

## Usage

The session timeout functionality is automatically active for all authenticated users. No additional configuration is required.

### For Developers
- Regular users will see timeout warnings and be logged out after 10 minutes
- Admin/subadmin users will not experience any session timeouts
- Session extension is handled automatically when users interact with the warning modal 
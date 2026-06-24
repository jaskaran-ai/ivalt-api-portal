# iVALT API Portal — Usage Guide

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Authentication Flow](#3-authentication-flow)
4. [Access Request Process](#4-access-request-process)
5. [Managing API Keys](#5-managing-api-keys)
6. [Integrating the iVALT API](#6-integrating-the-ivalt-api)
7. [Geo-fence Authentication](#7-geo-fence-authentication)
8. [Status Code Reference](#8-status-code-reference)
9. [Admin Guide](#9-admin-guide)
10. [Troubleshooting](#10-troubleshooting)
11. [Best Practices](#11-best-practices)
12. [Support](#12-support)

---

## 1. Introduction

The iVALT API Portal is a developer platform that enables you to integrate biometric authentication into your applications using the iVALT API. This guide covers everything from account setup to production deployment.

### Platform Overview

The portal provides:

- **Biometric login** using the iVALT mobile app
- **API key management** with secure creation and lifecycle controls
- **API documentation** with interactive code samples
- **Admin dashboard** for usage monitoring and access control
- **Email notifications** for access requests and account updates

---

## 2. Getting Started

### Prerequisites

Before using the portal, ensure you have:

1. **iVALT mobile app** installed on your phone (iOS or Android)
2. A **registered phone number** in the iVALT app
3. A **valid use case** for integrating biometric authentication

### Accessing the Portal

Navigate to the portal URL in your browser. The portal is fully responsive and works on desktop, tablet, and mobile devices.

### Demo Mode

If the portal is running in demo mode (`NEXT_PUBLIC_DEMO_MODE=true`), all external services are simulated:

- No real push notifications are sent
- Authentication is simulated automatically
- Access requests are auto-approved
- Demo API keys are pre-populated
- No database or AWS credentials are required

Use demo mode for UI exploration and development testing.

---

## 3. Authentication Flow

### Step 1: Request Authentication

On the login page, enter your mobile number including the country code (e.g., `+919876543210`) and click **Continue**.

The system sends a push notification to the iVALT app on your registered phone.

### Step 2: Approve on Your Phone

Open the iVALT app and review the authentication request. Complete the biometric scan to approve it.

### Step 3: Automatic Verification

Your browser polls the authentication status every 2 seconds. Once you approve on your phone, the portal automatically detects the confirmation and proceeds.

### Session Information

After successful authentication, a secure session is created using encrypted cookies. Your session persists until you log out or the session expires. The session stores:

- User ID
- Phone number
- Access status (pending, approved, or rejected)

---

## 4. Access Request Process

### Submitting a Request

New users must submit an access request before using the portal:

1.  After authentication, you are redirected to the access request form
2.  Describe your integration use case in detail
3.  Click **Submit Request**

### Writing an Effective Use Case

To expedite approval, include:

- **Application type**: mobile app, web platform, internal system, etc.
- **Use case**: how biometric authentication fits into your workflow
- **Scale**: expected user volume and authentication frequency
- **Timeline**: target launch date and milestones

### After Submission

Your request is reviewed by an administrator. You will receive an email notification when a decision is made. This process typically takes 1--2 business days.

### Possible Outcomes

| Outcome      | Description    | Next Steps                                           |
| ------------ | -------------- | ---------------------------------------------------- |
| **Approved** | Access granted | Log in to access the dashboard and manage API keys   |
| **Rejected** | Access denied  | Review feedback, update your use case, and re-submit |
| **Pending**  | Under review   | Wait for admin decision                              |

---

## 5. Managing API Keys

### Creating an API Key

1. Navigate to **API Keys** in the sidebar
2. Click **Create Key**
3. Enter a descriptive name (minimum 3 characters)
4. Click **Create**

**Important:** The full key value is displayed only once at creation. Copy and store it securely. You will not be able to view the full key again.

### Key Naming Conventions

Use descriptive names that reflect the key's purpose:

- `Production App` -- for your live production application
- `Mobile SDK iOS` -- for your iOS mobile SDK
- `Staging Environment` -- for testing and development
- `CI/CD Pipeline` -- for automated deployment systems

### Enabling and Disabling Keys

You can temporarily disable a key without deleting it:

- **Disable** a key to immediately stop it from authenticating API requests. Disabled keys return a 403 error.
- **Enable** a key to restore access.

This is useful for rotating credentials or pausing access during maintenance.

### Deleting an API Key

Deleting a key permanently removes it from both the portal and AWS API Gateway. Any application using this key will immediately lose access.

### Key Limits

- Maximum **4 API keys** per user account
- Delete unused keys to stay within the limit
- Plan your key allocation based on your environments and applications

### Key Security

- Store key values in environment variables or a secrets manager
- Never commit key values to version control
- Rotate keys periodically
- Use separate keys for development and production environments

---

## 6. Integrating the iVALT API

### Base URL

All API requests use the following base URL:

```
https://api.ivalt.com
```

### Authentication Headers

Every API call requires these HTTP headers:

| Header         | Value                     | Description                 |
| -------------- | ------------------------- | --------------------------- |
| `x-api-key`    | Your IVALT API key        | Identifies your application |
| `Content-Type` | `application/json`        | Request body format         |

### Endpoint 1: Initiate Authentication

Sends a biometric authentication request to the user's iVALT app.

**Request:**

```
POST /biometric-auth-request
```

```json
{
  "mobile_number": "+919876543210"
}
```

**cURL Example:**

```bash
curl -X POST https://api.ivalt.com/biometric-auth-request \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_IVALT_API_KEY" \
  -d '{"mobile_number": "+919876543210"}'
```

**Response (200):**

```json
{
  "success": true,
  "message": "Authentication request sent",
  "request_id": "auth_abc123xyz"
}
```

### Endpoint 2: Poll Authentication Result

Checks whether the user has approved, rejected, or timed out.

**Request:**

```
POST /biometric-auth-result
```

```json
{
  "mobile_number": "+919876543210"
}
```

**cURL Example:**

```bash
curl -X POST https://api.ivalt.com/biometric-auth-result \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_IVALT_API_KEY" \
  -d '{"mobile_number": "+919876543210"}'
```

**Response (200 - Authenticated):**

```json
{
  "authenticated": true,
  "user": {
    "mobile_number": "+919876543210",
    "verified_at": "2025-05-07T10:30:00Z"
  }
}
```

### Polling Strategy

Implement the following polling pattern:

1.  Call `/biometric-auth-result` every **2 seconds**
2.  On **200**: Stop polling. The user authenticated successfully. Create a session.
3.  On **422**: Continue polling. The request is still pending on the user's phone.
4.  On **403**: Stop polling. Authentication failed or timed out. Show an error message.
5.  On **404**: Stop polling. The phone number is not registered. Prompt the user to install iVALT.
6.  Set a **timeout** (e.g., 120 seconds) after which you stop polling and show a timeout error.

---

## 7. Geo-fence Authentication

The iVALT API supports geo-fenced authentication, where the biometric verification is combined with a location check.

### Request

Add latitude, longitude, and radius to the poll request:

**cURL Example:**

```bash
curl -X POST https://api.ivalt.com/biometric-auth-result \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_IVALT_API_KEY" \
  -d '{
    "mobile_number": "+919876543210",
    "latitude": 30.7333,
    "longitude": 76.7794,
    "radius_meters": 500
  }'
```

### Parameters

| Parameter       | Type   | Description                              |
| --------------- | ------ | ---------------------------------------- |
| `mobile_number` | string | User's registered phone number           |
| `latitude`      | number | Center latitude for the geofence         |
| `longitude`     | number | Center longitude for the geofence        |
| `radius_meters` | number | Allowed radius in meters from the center |

### Responses

| Code | Meaning                        | Description                                                 |
| ---- | ------------------------------ | ----------------------------------------------------------- |
| 200  | Authenticated and inside fence | User approved and is within the allowed geographic area     |
| 422  | Pending                        | Authentication still pending                                |
| 403  | Failed or outside fence        | User rejected, timed out, or is outside the geofence radius |
| 404  | Not found                      | Phone number not registered                                 |

Use cases for geo-fence authentication:

- Employee attendance tracking at office locations
- Secure access to physical premises
- Location-based verification for compliance
- Event check-in and verification

---

## 8. Status Code Reference

### Biometric Auth Request

| Code | Meaning        | Description                            |
| ---- | -------------- | -------------------------------------- |
| 200  | Success        | Push notification sent to user's phone |
| 403  | Invalid API key | API key is missing or incorrect |
| 404  | User not found | Phone number not registered in iVALT   |

### Biometric Auth Result

| Code | Meaning          | Action Required                                                 |
| ---- | ---------------- | --------------------------------------------------------------- |
| 200  | Authenticated    | Stop polling. Create user session. Proceed to next step.        |
| 422  | Pending          | Continue polling every 2 seconds.                               |
| 403  | Failed / Timeout | Stop polling. Show authentication error to user. Offer retry.   |
| 404  | Not found        | Stop polling. Prompt user to install and register in iVALT app. |

### Portal API

| Code | Meaning      | Description                                                |
| ---- | ------------ | ---------------------------------------------------------- |
| 200  | Success      | Request completed successfully                             |
| 400  | Bad request  | Invalid input (e.g., missing phone number, short key name) |
| 401  | Unauthorized | No valid session                                           |
| 403  | Forbidden    | Access denied (e.g., max keys reached, not approved)       |
| 404  | Not found    | Resource not found                                         |
| 500  | Server error | Internal error. Contact support if persistent.             |

---

## 9. Admin Guide

### Admin Dashboard

The admin dashboard (`/admin/dashboard`) provides an overview of:

- Total registered users
- Total API keys across all users
- Active vs. inactive keys
- Recently used keys (last 24 hours)
- Usage statistics from AWS API Gateway

### Managing Access Requests

1. Navigate to **Requests** in the admin sidebar
2. Review pending access requests with user details and use case descriptions
3. **Approve** requests that meet your criteria
4. **Reject** requests with feedback notes explaining the decision

### Approval Checklist

- User provided a clear and specific use case
- No history of abuse or policy violations
- Business justification is valid
- Use case aligns with acceptable use policy
- Add admin notes for record-keeping

### User Management

The admin interface allows you to:

- View all registered users with their current status
- Track API key counts per user
- Monitor last login and approval dates
- View usage statistics per key

---

## 10. Troubleshooting

### Login Issues

| Issue                            | Solution                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| "Phone number not registered"    | Install the iVALT app and register your number first                                            |
| Push notification not received   | Ensure your phone has internet connectivity. Check iVALT app notifications are enabled.         |
| Authentication request times out | Refresh the page and try again. Ensure the iVALT app is open when approving.                    |
| Biometric scan fails             | Ensure adequate lighting and clean camera lens. Try re-registering biometrics in the iVALT app. |
| Session expires frequently       | Re-authenticate through the login flow                                                          |

### API Key Issues

| Issue               | Solution                                                                         |
| ------------------- | -------------------------------------------------------------------------------- |
| Key returns 403     | Check if the key is enabled in the portal. Verify the API key is correct. |
| Lost a key value    | Keys cannot be retrieved. Delete the key and create a new one.                   |
| Cannot create a key | You may have reached the 4-key limit. Delete an unused key first.                |
| Key name rejected   | Use at least 3 characters. Avoid special characters.                             |

### Access Request Issues

| Issue                            | Solution                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| Request not submitted            | Ensure you completed biometric authentication first                 |
| Request still pending after days | Contact support to follow up                                        |
| Request rejected                 | Review the admin notes, update your use case, and re-submit         |
| Cannot access dashboard          | Check your access status. If approved, try logging out and back in. |

### General Issues

| Issue                  | Solution                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Page not loading       | Check your internet connection. Try a different browser. Clear cache.                |
| Styling appears broken | Ensure you are using a modern browser (Chrome, Firefox, Safari, Edge).               |
| Error 500 on API calls | Check server logs. Verify all environment variables are configured. Contact support. |

---

## 11. Best Practices

### API Key Security

- Store keys in environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Never hardcode keys in source code or commit them to version control
- Use separate keys for development, staging, and production environments
- Rotate keys regularly (every 90 days recommended)
- Disable rather than delete keys when temporarily not in use
- Monitor key usage through the admin dashboard for unexpected activity

### Authentication Flow

- Implement proper polling timeout (recommended: 120 seconds)
- Show clear loading states during authentication
- Handle all status codes explicitly in your application
- Provide retry options for failed authentication attempts
- Log authentication requests and failures for debugging
- Test with both successful and failed biometric scans

### Integration

- Always validate the API response before creating user sessions
- Use HTTPS for all API communications
- Implement rate limiting on your end to avoid overwhelming the API
- Cache the IVALT_API_KEY securely on your server side
- Keep the IVALT_API_KEY separate from API keys

### Production Deployment

- Test the complete auth flow in staging before production
- Monitor API error rates and response times
- Set up alerts for authentication failures
- Have a fallback authentication method for critical applications
- Document your integration architecture for team reference
- Perform load testing before major launches

---

## 12. Support

### Contact Information

- **Email:** support@ivalt.com
- **Portal:** https://ivalt-api-portal.vercel.app
- **API Base URL:** https://api.ivalt.com

### Documentation

- **User Flow:** Detailed walkthrough of the portal experience
- **Admin Guide:** Managing users and access requests
- **API Reference:** Complete endpoint documentation (in-app)

### Reporting Issues

When reporting an issue, please include:

- The error message and status code
- Steps to reproduce the issue
- Your API key identifier (not the full key)
- Timestamp of when the issue occurred
- Browser and operating system version
- Screenshots if applicable

---

_© 2025 iVALT Inc. All rights reserved._

_Document version 1.0 -- Last updated June 2025_

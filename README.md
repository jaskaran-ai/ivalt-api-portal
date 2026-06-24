# iVALT Developer Portal

A full-stack Next.js 16 developer portal for managing iVALT biometric API keys, with admin-controlled access and API usage tracking.

## Features

- **Biometric Login** — Passwordless authentication via mobile number + iVALT push notification
- **Access Control** — Admin-approved access requests before API key management
- **API Key Management** — Create, enable/disable, and delete AWS API Gateway keys (max 4 per user)
- **API Documentation** — In-app docs for the iVALT biometric auth API with interactive code samples
- **Admin Dashboard** — Usage statistics, user management, and access request moderation
- **Email Notifications** — Admin alerted on new requests; users notified on approval/rejection
- **Demo Mode** — `NEXT_PUBLIC_DEMO_MODE=true` bypasses all external dependencies for UI development
- **Geo-fence Support** — Verify biometric approval alongside latitude, longitude, and radius

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language  | TypeScript                         |
| Database  | PostgreSQL + Drizzle ORM           |
| Auth      | iVALT Biometric API + iron-session |
| API Keys  | AWS API Gateway SDK v2             |
| Styling   | Tailwind CSS v4                    |
| Email     | React Email + Nodemailer           |
| UI        | Sonner (toasts), Lucide (icons)    |

## Project Structure

```
src/
├── app/
│   ├── login/                    # Biometric login page
│   ├── access/
│   │   ├── request/page.tsx      # Access request form
│   │   └── status/page.tsx       # Pending/rejected status page
│   ├── admin/
│   │   ├── dashboard/page.tsx    # Usage stats & key overview
│   │   ├── keys/page.tsx         # All keys view
│   │   ├── login/page.tsx        # Admin authentication
│   │   ├── requests/page.tsx     # Pending access requests
│   │   └── users/page.tsx        # User management
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── keys/page.tsx         # API key CRUD
│   │   └── docs/page.tsx         # iVALT API reference
│   └── api/
│       ├── auth/
│       │   ├── request/route.ts  # POST — initiate biometric auth
│       │   ├── verify/route.ts   # POST — poll result + create session
│       │   └── logout/route.ts   # POST — destroy session
│       ├── access/
│       │   ├── request/route.ts  # POST — submit use case, GET — list (admin)
│       │   ├── approve/route.ts  # POST — approve/reject, GET — list
│       │   └── me/route.ts       # GET — current access status
│       ├── admin/
│       │   ├── auth/route.ts     # POST — admin login
│       │   ├── auth/verify/route.ts # POST — verify admin session
│       │   ├── keys/route.ts     # GET — all keys (admin)
│       │   ├── users/route.ts    # GET — all users (admin)
│       │   └── usage/route.ts    # GET — usage statistics
│       └── keys/
│           ├── route.ts          # GET — list user's keys
│           ├── create/route.ts   # POST — create key
│           └── [id]/route.ts     # DELETE + PATCH — delete/toggle key
├── components/
│   ├── layout/
│   │   ├── DashboardShell.tsx    # Sidebar + header layout (user)
│   │   └── AdminShell.tsx        # Admin layout
│   └── ui/                       # Custom UI components
├── db/
│   ├── index.ts                  # Drizzle connection
│   ├── schema.ts                 # Table definitions
│   └── migrations/               # Drizzle migration files
├── emails/
│   ├── admin-notification.tsx    # New access request alert
│   ├── user-approved.tsx         # Access approved notification
│   └── user-rejected.tsx         # Access rejected notification
└── lib/
    ├── session.ts                # iron-session config
    ├── ivalt.ts                  # iVALT API client
    ├── aws-gateway.ts            # AWS API Gateway client
    ├── email.ts                  # Email sending utility
    └── demo.ts                   # Demo mode fixtures
```

## Authentication Flow

```
Login → Biometric Push → Approve in iVALT App → Access Request → Admin Review → Dashboard
```

1. User enters mobile number on `/login`
2. `POST /api/auth/request` calls iVALT `BiometricAuthRequest`
3. iVALT sends a push notification to the user's phone
4. Client polls `POST /api/auth/verify` every 2 seconds
5. Server polls iVALT `BiometricAuthResult` — returns 200 (authenticated), 422 (pending), 403 (failed), 404 (not found)
6. On 200, an iron-session cookie is created with the user's `accessStatus`
7. If status is `pending`, user is redirected to `/access/request` to submit a use case
8. Admin receives email notification, reviews in `/admin/requests`, and approves/denies
9. On approval, user is emailed and can access `/dashboard` for API key management

## User States

| State      | Description                      | Access                           |
| ---------- | -------------------------------- | -------------------------------- |
| `pending`  | Authenticated, awaiting approval | Access request form, status page |
| `approved` | Admin approved                   | Dashboard, API keys, docs        |
| `rejected` | Admin denied                     | Can re-submit request            |

## API Endpoints

### Portal API (requires session)

| Method | Path                  | Purpose                    |
| ------ | --------------------- | -------------------------- |
| POST   | `/api/auth/request`   | Initiate biometric push    |
| POST   | `/api/auth/verify`    | Poll biometric result      |
| POST   | `/api/auth/logout`    | Destroy session            |
| POST   | `/api/access/request` | Submit use case            |
| GET    | `/api/access/me`      | Get current access status  |
| GET    | `/api/keys`           | List user's keys           |
| POST   | `/api/keys/create`    | Create a key               |
| DELETE | `/api/keys/[id]`      | Delete a key               |
| PATCH  | `/api/keys/[id]`      | Toggle key active/inactive |

### Admin API (requires admin session)

| Method | Path                     | Purpose                |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/admin/auth`        | Admin login            |
| POST   | `/api/admin/auth/verify` | Verify admin session   |
| GET    | `/api/admin/usage`       | Usage statistics       |
| GET    | `/api/admin/keys`        | All keys view          |
| GET    | `/api/admin/users`       | All users view         |
| GET    | `/api/access/request`    | List access requests   |
| POST   | `/api/access/approve`    | Approve/reject request |

### iVALT Biometric API (external)

| Method | Path                                           | Purpose             |
| ------ | ---------------------------------------------- | ------------------- |
| POST   | `https://api.ivalt.com/biometric-auth-request` | Send biometric push |
| POST   | `https://api.ivalt.com/biometric-auth-result`  | Poll auth status    |

**Auth headers:** `x-api-key: YOUR_API_KEY`, `token: YOUR_IVALT_SECURITY_TOKEN`, `Content-Type: application/json`

**Status codes:** 200 = authenticated, 422 = pending, 403 = failed/timeout, 404 = user not found

## Database Schema

### `users`

| Column          | Type         | Description                       |
| --------------- | ------------ | --------------------------------- |
| `id`            | UUID (text)  | Primary key                       |
| `phone_number`  | varchar(20)  | Unique phone number               |
| `name`          | varchar(255) | Display name                      |
| `status`        | varchar(20)  | `pending`, `approved`, `rejected` |
| `role`          | varchar(20)  | `user`, `admin`                   |
| `approved_at`   | timestamp    | When access was granted           |
| `created_at`    | timestamp    | Account creation                  |
| `updated_at`    | timestamp    | Last update                       |
| `last_login_at` | timestamp    | Last login                        |

### `api_keys`

| Column          | Type            | Description              |
| --------------- | --------------- | ------------------------ |
| `id`            | UUID (text)     | Primary key              |
| `user_id`       | text → users.id | Owner (cascade delete)   |
| `aws_key_id`    | varchar(255)    | AWS API Gateway key ID   |
| `key_name`      | varchar(255)    | User-defined name        |
| `key_value`     | varchar(512)    | Stored once, then masked |
| `is_active`     | boolean         | Enabled/disabled         |
| `usage_plan_id` | varchar(255)    | AWS usage plan           |
| `created_at`    | timestamp       | Creation date            |
| `last_used_at`  | timestamp       | Last usage               |

### `access_requests`

| Column         | Type            | Description                |
| -------------- | --------------- | -------------------------- |
| `id`           | UUID (text)     | Primary key                |
| `user_id`      | text → users.id | Requester (cascade delete) |
| `use_case`     | varchar(500)    | Integration description    |
| `requested_at` | timestamp       | Submission time            |
| `approved_at`  | timestamp       | Decision timestamp         |
| `admin_notes`  | varchar(1000)   | Admin comments             |

### `api_key_usage`

| Column            | Type               | Description   |
| ----------------- | ------------------ | ------------- |
| `id`              | UUID (text)        | Primary key   |
| `api_key_id`      | text → api_keys.id | Key reference |
| `usage_count`     | integer            | Request count |
| `last_fetched_at` | timestamp          | Last sync     |

## Environment Variables

Copy `.env.local.example` → `.env.local`:

| Variable                        | Required  | Description                                       |
| ------------------------------- | --------- | ------------------------------------------------- |
| `DATABASE_URL`                  | Yes       | PostgreSQL connection string                      |
| `IVALT_API_BASE_URL`            | Yes       | iVALT API base (default: `https://api.ivalt.com`) |
| `IVALT_SECURITY_TOKEN`          | Yes       | iVALT security token                              |
| `AWS_REGION`                    | Yes       | AWS region (e.g. `us-east-1`)                     |
| `AWS_ACCESS_KEY_ID`             | Yes       | IAM access key                                    |
| `AWS_SECRET_ACCESS_KEY`         | Yes       | IAM secret key                                    |
| `AWS_API_GATEWAY_USAGE_PLAN_ID` | Yes       | Usage plan to attach keys                         |
| `SESSION_SECRET`                | Yes       | ≥32 char random string for iron-session           |
| `NEXT_PUBLIC_DEMO_MODE`         | No        | `true` to skip all external calls                 |
| `SMTP_HOST`                     | For email | SMTP server (default: `smtp.gmail.com`)           |
| `SMTP_PORT`                     | For email | SMTP port (default: `587`)                        |
| `SMTP_USER`                     | For email | SMTP username                                     |
| `SMTP_PASS`                     | For email | SMTP password                                     |
| `ADMIN_EMAIL`                   | For email | Comma-separated admin notification recipients     |

## Setup

### Prerequisites

- Node.js 20+, Bun
- PostgreSQL 14+
- AWS account with API Gateway configured
- iVALT API credentials

### Install & Run

```bash
bun install
cp .env.local.example .env.local
bun run db:push
bun dev
```

### AWS IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["apigateway:POST", "apigateway:GET", "apigateway:PATCH", "apigateway:DELETE"],
      "Resource": [
        "arn:aws:apigateway:*::/apikeys",
        "arn:aws:apigateway:*::/apikeys/*",
        "arn:aws:apigateway:*::/usageplans/*/keys",
        "arn:aws:apigateway:*::/usageplans/*/keys/*"
      ]
    }
  ]
}
```

## Key Limits

- **Max 4 keys** per user
- Key value shown **once** at creation — store it securely
- Keys can be enabled/disabled without deletion

## Deployment

### Vercel

```bash
vercel deploy --prod --yes
```

### Self-hosted (EC2 + nginx + PM2)

```bash
bun run build
pm2 start bun --name "ivalt-portal" -- start
```

### Email Templates

Transactional emails use React Email components in `src/emails/`:

- **Admin Notification** — New access request with user details and use case
- **User Approved** — Welcome with quick-start steps and dashboard link
- **User Rejected** — Next-step guidance and re-submission link

## Documentation

- [User Flow](docs/user-flow.md) — End-to-end journey for portal users
- [Admin Guide](docs/admin-guide.md) — Approving/rejecting access requests
- [API Usage Tracking](docs/api-usage-tracking.md) — Usage metrics

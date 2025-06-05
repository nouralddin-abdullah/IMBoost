# User Plan Limits Documentation

## Overview
The IMBoost application includes a plan-based feature system that restricts certain actions based on the user's subscription level. This document outlines the available plans, their limits, and how the system works.

## Available Plans

### 1. Basic Plan (Default)
- **Daily Limits**
  - 1 post to bulk like per day
  - 1 post to bulk comment per day
  - 1 user to bulk follow per day
  - 1 room to join per day
- **Account Limits**
  - Maximum of 30 bot accounts per operation (not total accounts)
  - No limit on total number of bot accounts that can be stored in system

### 2. Premium Plan
- **Daily Limits**
  - Unlimited posts to bulk like
  - Unlimited posts to bulk comment
  - Unlimited users to bulk follow
  - Unlimited rooms to join
- **Account Limits**
  - Unlimited bot accounts per operation
  - No limit on total number of bot accounts that can be stored in system

## API Endpoints

### Check Current Usage
**Endpoint:** `GET /api/user/usage`

**Authentication Required:** Yes

**Response:**
```json
{
  "status": "success",
  "data": {
    "plan": "basic",
    "dailyUsage": {
      "likes": {
        "used": 1,
        "limit": 1,
        "remaining": 0
      },
      "comments": {
        "used": 0,
        "limit": 1,
        "remaining": 1
      },
      "follows": {
        "used": 0,
        "limit": 1,
        "remaining": 1
      },
      "roomJoins": {
        "used": 0,
        "limit": 1,
        "remaining": 1
      }
    },    "accounts": {
      "total": 15,
      "perOperation": {
        "limit": 30,
        "description": "maximum 30 accounts per operation"
      }
    },
    "lastActivity": "2025-06-05T08:30:00.000Z"
  }
}
```

### Upgrade to Premium
**Endpoint:** `POST /api/user/upgrade-plan`

**Authentication Required:** Yes

**Response:**
```json
{
  "status": "success",
  "message": "Your plan has been upgraded to Premium successfully",
  "data": {
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "Plan": "premium"
    }
  }
}
```

### Admin: Update User Plan
**Endpoint:** `PATCH /api/user/update-user-plan`

**Authentication Required:** Yes (Admin only)

**Body:**
```json
{
  "userId": "user_id",
  "plan": "premium" or "basic"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User plan updated to premium",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "Plan": "premium"
    }
  }
}
```

### Admin Dashboard
**Base Path:** `/api/admin-dashboard`

**Authentication:** Required (Admin role only)

#### Get All Users with Plans
- **Endpoint:** `GET /api/admin-dashboard/users`

#### Get User Usage Details
- **Endpoint:** `GET /api/admin-dashboard/user-usage/:userId`

#### Get Overall Plan Statistics
- **Endpoint:** `GET /api/admin-dashboard/plan-stats`

## Error Responses

When a user exceeds their plan limits, they will receive a 429 Too Many Requests response:

```json
{
  "status": "error",
  "message": "Daily limit reached. basic plan allows 1 like per day."
}
```

For account per-operation limits:

```json
{
  "status": "error",
  "message": "Operation account limit exceeded. Basic plan allows maximum 30 accounts per operation."
}
```

## Implementation Details

### Daily Usage Tracking
- Usage is tracked per user on a daily basis
- Counters reset at midnight (00:00:00)
- Each successful action increments the relevant counter

### Account Limits
- For each operation (like, comment, follow, room join), a maximum number of accounts is used based on the user's plan:
  - Basic plan: Maximum 30 accounts per operation
  - Premium plan: Unlimited accounts per operation
- There is no limit on the total number of accounts that can be added to the system

### Plan Upgrades
- Plan changes take effect immediately
- Upgrading to Premium removes all usage limits

# Task Management API

A robust REST API for task management with role-based access control, user authentication, and notification services.

## Features

- **User Authentication** - Secure JWT-based authentication system
- **Role-Based Access Control** - Different permission levels for admins and regular users
- **Task Management** - Complete CRUD operations for tasks
- **Notification Service** - Email notifications for task assignments
- **Data Filtering** - Filter tasks by status and priority

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- BCrypt for password hashing

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate user | Public |
| GET | `/api/auth/me` | Get current user info | Private |

### Tasks

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get all tasks (admin: all tasks, user: assigned tasks) | Private |
| POST | `/api/tasks` | Create a new task | Private |
| GET | `/api/tasks/:id` | Get single task by ID | Private |
| PUT | `/api/tasks/:id` | Update task | Private |
| DELETE | `/api/tasks/:id` | Delete task | Private |

## Admin vs User Permissions

### Admin Privileges
- View all tasks in the system
- Create tasks and assign to any user
- Update any task
- Delete any task
- Access to all user information

### Regular User Restrictions
- Can only view tasks assigned to them
- Can create tasks but only assign to themselves
- Can only update tasks assigned to them
- Can only delete tasks they created
- Limited access to other user information

## Notification Service

The API includes an integrated notification service that:
- Sends email notifications when tasks are assigned to users
- Sends notifications when task assignments change
- Currently configured as using Nodemailer in development

## Request & Response Format

### Authentication Requests

**Register User**
```json
// POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // Optional, defaults to "user"
}
```

**Login User**
```json
// POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Task Requests

**Create Task**
```json
// POST /api/tasks
{
  "title": "Complete project documentation",
  "description": "Write detailed documentation for the API",
  "status": "To-Do", // Optional, default: "To-Do"
  "priority": "High", // Optional, default: "Medium"
  "assignedTo": "60a1b2c3d4e5f6g7h8i9j0" // User ID
}
```

**Update Task**
```json
// PUT /api/tasks/:id
{
  "status": "In Progress",
  "priority": "High"
}
```

### Response Format

**Success Response**
```json
{
  "success": true,
  "data": { ... } // Requested data or empty for DELETE
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Error message description"
}
```

## Authentication

The API uses JWT (JSON Web Token) authentication. For protected routes, include the token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/task-management
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_USER=
   EMAIL_PASSWORD=
   ```
4. Run in development: `npm run start`
5. Run in production: `npm start`

## Error Handling

The API provides detailed error messages and appropriate HTTP status codes:
- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication failure
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource not found
- 500: Server Error - Internal server issues

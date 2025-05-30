# GOGCWS Backend API

Backend for GCGPWS College Portal that handles admission applications, notifications, and admin functionalities.

## Features

- Admission form submission and processing
- Admin approval/rejection of applications
- Email notifications to applicants
- Admin dashboard statistics
- Notification system

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email notifications

## Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd GOGCWS-Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Variables**

Copy the example env file and update with your details:

```bash
cp env.example .env
```

Edit the `.env` file with your:
- MongoDB connection string
- JWT secret
- Email credentials
- Cloudinary credentials (for file uploads)

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

5. **API Endpoints**

Admission Endpoints:
- POST `/api/admissions/submit` - Submit new application
- GET `/api/admissions` - Get all applications (admin only)
- GET `/api/admissions/stats` - Get application statistics (admin only)
- GET `/api/admissions/:id` - Get single application (admin only)
- PUT `/api/admissions/:id/status` - Update application status (admin only)

Notification Endpoints:
- GET `/api/admissions/notifications` - Get all notifications (admin only)
- GET `/api/admissions/notifications/unread-count` - Get unread count (admin only)
- PUT `/api/admissions/notifications/:id/mark-read` - Mark notification as read (admin only)
- PUT `/api/admissions/notifications/mark-all-read` - Mark all as read (admin only)

## Frontend Integration

This API is designed to work with the GCGPWS Frontend Portal. Please refer to the frontend repository for integration details.#   G C G P W S - B a c k e n d - P o r t a l  
 
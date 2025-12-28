# FirmCommand

> **⚠️ IMPORTANT NOTICE: OTP DISPLAY**
> Due to reliability issues with the email service (Nodemailer) on the current deployment environment (Render/Localhost), **OTPs (One-Time Passwords) are currently displayed directly on the screen** during Login/Registration.
>
> When prompted for an OTP, look for a **Blue/Indigo Alert Box** at the top of the form containing your code (e.g., `DEV OTP Code: 123456`). This ensures you can access the application without waiting for email delivery.

---

## 📋 Overview

**Legal Task Manager** is a specialized Task Management System designed for small-scale law firms. It streamlines collaboration between **Leads** (Senior Lawyers/Partners) and **Associates** (Junior Lawyers/Paralegals), resolving the chaos of WhatsApp-based task delegation.

The system enforces a strict hierarchy where data is isolated by Organization, ensuring privacy and focused workflows.

## 👥 User Roles

The application has been refactored to use professional titles:

1.  **Lead (formerly Boss)**:
    *   Creates the Organization.
    *   Invites Associates.
    *   Creates and Assigns Tasks.
    *   Reviews completed work (Approve/Reject).
    *   Has full administrative control over the firm's workspace.

2.  **Associate (formerly Worker)**:
    *   Joins an existing Organization via Code.
    *   Receives tasks from the Lead.
    *   Submit updates and mark tasks as Completed.
    *   Cannot see other Associates' tasks unless specified (Data Isolation).

## ✨ Key Features

*   **Organization Management**: Unique Organization Codes for easy team onboarding.
*   **Task Lifecycle**:
    *   *Pending* -> *In Progress* -> *Completed* -> *Reviewed (Approved/Rejected)*.
*   **Real-time Notifications**: Instant alerts for task assignments, updates, and approvals using **Socket.io**.
*   **Data Isolation**: Strict separation of data between different law firms.
*   **Smart Dashboards**: Tailored views for Leads (Management view) and Associates (Work view).
*   **Secure Authentication**: JWT-based Auth with HTTP-Only Cookies and Multi-Factor Authentication (OTP).

## 🛠️ Tech Stack

**Frontend:**
*   **React** (Vite)
*   **Tailwind CSS** (Styling)
*   **Framer Motion** (Animations)
*   **Axios** (API Requests)
*   **Socket.io Client** (Real-time connection)

**Backend:**
*   **Node.js & Express**
*   **MongoDB & Mongoose** (Database)
*   **Socket.io** (WebSocket Server)
*   **JWT** (JSON Web Tokens)
*   **Bcryptjs** (Password Security)

## 🚀 Setup & Installation

Follow these steps to run the project locally:

### Prerequisites
*   Node.js (v16+)
*   MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-manager-for-small-scale-law-firms
```

### 2. Backend Setup
Navigate to the backend folder:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Run the server:
```bash
# Starts server on localhost:5001
npm run dev
```

### 4. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

## 🔌 API Endpoints

### Auth
*   `POST /api/auth/register` - Create Org (Lead) or Join Org (Associate)
*   `POST /api/auth/login` - Login
*   `GET /api/auth/me` - Get current user profile
*   `POST /api/auth/verify-otp` - Verify Account

### Tasks
*   `GET /api/tasks` - Get all tasks (Lead) or Assigned tasks (Associate)
*   `POST /api/tasks` - Create Task (Lead Only)
*   `PUT /api/tasks/:id` - Update Task Status
*   `PUT /api/tasks/:id/approve` - Approve Task (Lead Only)

### Organization
*   `GET /api/organization/requests` - View Join Requests
*   `POST /api/organization/requests/:id/approve` - Approve Join Request

## 🤝 Contribution

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
&copy; 2024 Legal Task Manager

# FirmCommand

> **⚠️ IMPORTANT NOTICE: OTP DISPLAY**
> Due to reliability issues with the email service (Nodemailer) on the current deployment environment, **OTPs (One-Time Passwords) are currently displayed directly on the screen** during Login/Registration. Look for a **Blue/Indigo Alert Box** at the top of the form containing your code.

---

## 📋 Overview

**FirmCommand** (formerly Legal Task Manager) is a specialized Task Management System designed exclusively for small-scale law firms. It streamlines collaboration between **Leads** (Senior Lawyers/Partners) and **Associates** (Junior Lawyers/Paralegals), resolving the chaos of WhatsApp-based task delegation.

The system enforces a strict hierarchy where data is securely isolated by Organization, ensuring client privacy and focused workflows. Everything runs on a sleek, dark-themed, motion-rich interface built for focus and clarity.

## 👥 User Roles

1.  **Lead (Admin)**:
    *   Creates the Organization workspace.
    *   Invites Associates via a unique secure code.
    *   Creates and Delegates Tasks across a Kanban board.
    *   Reviews completed work and manages the team dashboard.
    *   Accesses full workspace analytics and workload metrics.

2.  **Associate (Worker)**:
    *   Joins an existing Organization.
    *   Receives and organizes tasks.
    *   Submits updates, uploads proof of work, and marks tasks for Review.
    *   Data is isolated — they cannot see tasks assigned to other Associates.

## ✨ Key Features

*   **Beautiful UI/UX**: A bespoke, dark-mode-first aesthetic with glassmorphism, fluid animations (Framer Motion), and a color palette designed specifically to reduce eye strain.
*   **Comprehensive Dashboards**: 
    *   **Tasks Hub:** Kanban, List, and Table views for tracking assignments.
    *   **Analytics Tab:** Visual charts tracking task distribution, bottlenecks, and overall firm completion rates.
    *   **Team Management:** Detailed associate metrics. Click on any associate to deal deeper into their active workload and track their efficiency.
*   **Organization Lifecycle**: Full control from creation, to adding users, managing join requests, and even safely dissolving the firm when required.
*   **Real-time Notifications**: Instant alerts for task assignments and status changes using **Socket.io**.
*   **Secure Authentication**: JWT-based Auth with HTTP-Only Cookies and Multi-Factor (OTP).

## 🛠️ Tech Stack

**Frontend:**
*   **React** (Vite)
*   **Vanilla CSS / Tailwind** (Custom Design System)
*   **Framer Motion** (Fluid UI Animations)
*   **Axios** & **React Router**

**Backend:**
*   **Node.js & Express**
*   **MongoDB & Mongoose** (Database)
*   **Socket.io** (WebSocket Server)
*   **JWT & Bcryptjs** (Auth & Security)
*   **Nodemailer** / **Multer** 

## 🚀 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URL)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-manager-for-small-scale-law-firms
```

### 2. Backend Setup
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

Run the server & seed database:
```bash
node seedDB.js # Optional: generates demo data
npm run dev    # Starts server
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:5173
```

## 🤝 Contribution
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---
&copy; 2026 FirmCommand Inc.

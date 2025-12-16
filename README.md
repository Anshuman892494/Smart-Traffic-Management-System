# Smart Traffic Management System for Urban Congestion

## 📌 Project Overview

The **Smart Traffic Management System for Urban Congestion** is a full-stack web application designed to monitor, visualize, and manage urban traffic conditions efficiently. The system provides real-time traffic visualization using interactive maps and offers role-based access for administrators and users.

The application helps traffic authorities analyze congestion patterns and enables users to stay informed about traffic conditions while securely managing their personal and vehicle information.

---
## Screenshot - Admin Dashboard
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/99688b08-7b05-436f-84e3-62f6b57145e5" />

## 🎯 Objectives

* To provide a centralized platform for urban traffic monitoring
* To visualize traffic congestion using interactive maps
* To implement secure authentication and authorization
* To support role-based dashboards (Admin & User)
* To improve traffic awareness and management efficiency

---

## 🧠 Key Features

### 🔐 Authentication & Authorization

* User Login
* User Signup with vehicle registration
* Forgot Password functionality
* JWT-based authentication (Access & Refresh Tokens)
* Role-based access control (Admin / User)

### 👤 User Module

* User dashboard with traffic visualization
* View traffic congestion zones
* Update personal profile information
* Update vehicle details
* Read-only access to traffic data

### 🛠 Admin Module

* Admin dashboard with full access
* Manage users and vehicles
* Add, update, and delete traffic zones
* Monitor traffic congestion levels
* View complete system analytics

### 🗺 Traffic Visualization

* OpenStreetMap integration using Leaflet
* Interactive map with zoom and pan
* Color-coded traffic zones:

  * 🟢 Low Traffic
  * 🟡 Medium Traffic
  * 🔴 High Traffic
* Dynamic traffic data loading from backend APIs

### 📊 Dashboard UI

* Modern and responsive design
* Header, Sidebar, Main Content Area, Footer
* Collapsible sidebar
* Clean and consistent layout

---

## 🏗 System Architecture

The application follows a **Client–Server Architecture**:

* **Frontend:** React.js (UI & Client Logic)
* **Backend:** Node.js + Express.js (REST APIs)
* **Database:** MongoDB (NoSQL)
* **Maps:** OpenStreetMap (Leaflet / React-Leaflet)
* **Security:** JWT, bcrypt

---

## 🧰 Technology Stack

### Frontend

* React.js
* CSS3
* React-Leaflet
* Context API

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose ODM)

### Security

* JWT Authentication
* bcrypt Password Hashing

---

## 🗂 Folder Structure

### Backend

```
backend/
│── config/
│── controllers/
│── middleware/
│── models/
│── routes/
│── utils/
│── server.js
│── .env
```

### Frontend

```
frontend/
│── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   ├── styles/
│   ├── App.js
│   └── index.js
```

### Full Structure

```
smart-traffic-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & role middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── styles/        # CSS styles
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   └── package.json
└── README.md
```

---

## 🗃 Database Schema

### User Schema

* Name
* Email
* Password (Encrypted)
* Role (Admin / User)

### Vehicle Schema

* Vehicle Number
* Vehicle Type
* User ID (Reference)

### Traffic Schema

* Location Coordinates (Latitude, Longitude)
* Traffic Density Level
* Timestamp

---

## 🔒 Security Features

* JWT-based authentication
* Encrypted passwords using bcrypt
* Role-based route protection
* Secure API endpoints
* Environment variables for sensitive data

---

## 🚀 Installation & Setup

### Prerequisites

* Node.js installed
* MongoDB installed or MongoDB Atlas
* Git

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🌐 API Endpoints

### Authentication

* POST `/auth/login`
* POST `/auth/register`
* POST `/auth/forgot-password`

### User & Vehicle

* GET `/users`
* PUT `/users/:id`
* GET `/vehicles`

### Traffic

* GET `/traffic`
* POST `/traffic`
* PUT `/traffic/:id`
* DELETE `/traffic/:id`

---

## ✅ Advantages

* Real-time traffic visualization
* Secure and scalable architecture
* User-friendly dashboards
* Role-based system control
* Supports smart city initiatives

---

## ⚠ Limitations

* No live sensor integration
* Manual or simulated traffic data
* Internet connectivity required
* Web-based access only

---

## 🔮 Future Enhancements

* AI-based traffic prediction
* Integration with live traffic sensors
* Mobile application development
* Emergency vehicle route optimization
* Smart traffic signal control
* Push notifications and alerts

---

## 🏙 Applications

* Smart city traffic management
* Urban planning departments
* Traffic control authorities
* Public traffic awareness systems

---

## 📌 Conclusion

The **Smart Traffic Management System for Urban Congestion** provides a modern, scalable, and secure solution for visualizing and managing urban traffic. By leveraging web technologies and map integration, the system enhances traffic awareness and supports better decision-making.

---

## 🙏 Acknowledgment

This project is developed as an academic/learning-based full-stack application to demonstrate modern web development and smart city concepts.

---

## 📄 License

This project is for educational purposes only.

---

**Thank You**

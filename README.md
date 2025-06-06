# SPATIAL_QUEST_DEMO


Here’s a complete **`README.md`** file for your **Spatial Quest Backend** project:

---

````markdown
# 🌍 Spatial Quest Backend

The Spatial Quest backend is a Node.js + MongoDB application designed to power a real-world questing system using geofencing, digital asset placement, and participant tracking. It provides robust REST APIs for both users and admins to interact with quests, assets, and content showcases.

---

## 📦 Prerequisites

Before running the project, ensure the following are installed:

- **Node.js** (v18 or higher) → [Download Node.js](https://nodejs.org/)
- **MongoDB** (local or cloud) → [Download MongoDB](https://www.mongodb.com/try/download/community)

---

## 🚀 Getting Started

### 1. Install Node Modules

```bash
npm install
```

This command installs all required packages from `package.json`.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and add your environment variables:

```env
PORT = 8000
BASE_URL = http://127.0.0.1:8000/
NODE_ENV= dev
#Database Connection
MONGODB_URL= your_database_connection
JWT_TOKEN_KEY=your_jwt_secret_key

```

> ⚠️ Replace `your_jwt_secret_key` with a secure, random string. and `your_database_connection` with db connection url

---

## ▶️ Start the Server

```bash
npm run start
```

Once running, the API will be available at:
📍 `http://localhost:8000`

---

## 📁 Project Structure

```
.
├── controllers/       # Business logic for APIs
├── models/            # Mongoose schema definitions
├── routes/            # Express route definitions
├── middleware/        # Authentication and validation layers
├── helpers/           # Helper utilities
├── .env               # Environment config
└── app.js             # Express app entry point
```

---

## 🛠️ Key Features

* 🔍 **Quest Discovery** with geofencing support
* 📍 **Real-world Asset Placement**
* 🚶 **Quest Joining/Leaving**
* 📦 **Asset Collection & Tracking**
* 📊 **Admin Panel APIs** for content control
* 🧾 **Error Logging** for debugging

---

## 🧪 API Examples

**Find Quests by Location**

```http
GET /quests?lat=37.7749&lon=-122.4194
```

**Join Quest**

```http
POST /quests/{questId}/join
```

**Collect Asset**

```http
POST /assets/collect
```

---

## 👤 Admin Operations

* Admin Signup/Signin
* Add Quest
* Add Quest Assets
* View All Quests & Assets

---

## 🧩 Technologies Used

* **Node.js** (Express)
* **MongoDB** (Mongoose)
* **JWT** for Authentication
* **GeoJSON** for Location-based queries




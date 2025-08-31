# Mini-CRM + Analytics Web App

## Project Description

This is a Mini-CRM + Analytics web application designed to manage customer relationships efficiently. 
The app includes features such as user authentication, CRUD operations for customers and deals,
CSV import/export functionality, and an analytics dashboard for insightful data visualization.

---

## Tech Stack

- **Frontend:** React, TailwindCSS, React Router
- **Backend:** FastAPI, Uvicorn
- **Database:** SQLite (local file-based)
- **Authentication:**
- **Other:** Axios for API calls, Recharts for analytics graphs

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/NAYAN-KAHAR/Mini-CRM-Analytics-Web-App
cd Mini-CRM-Analytics-Web-App
npm install

## 2. Install dependencies

# Backend
Create and activate a Python virtual environment (optional but recommended):

python3 -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install backend dependencies:
pip install -r backend/requirements.txt


#Running the app both together frontent and backend || Provide one-command run (npm run dev)
inside  Mini-CRM-Analytics-Web-App
  npm install
  npm run dev
  
```


### 2. Additional Notes
## Communication

- Frontend communicates with backend via **REST API** calls using Axios.
- Backend exposes endpoints under `/api` for CRUD operations (users, customers, deals).
- Frontend consumes API to perform CRUD and fetch analytics data.

---

## Database

- Uses **SQLite** as a lightweight local database.
- Database schema modeled with **SQLAlchemy ORM**.
- Tables include:
  - `users` for authentication
  - `customers` for CRM data
  - `deals` representing sales or opportunities

- Seed data scripts initialize the database with sample data.

---

## Libraries

- **FastAPI** for backend due to its async capabilities and automatic API docs.
- **React + Vite** for fast, modern frontend development.
- **TailwindCSS** for utility-first styling.
- **Recharts** for charts and analytics visualization.
- **Concurrently** npm package to run frontend and backend in one command.
-  Modular folder structure separating API routers, models, schemas, and utils.

---

## Summary

This project provides a clean separation of concerns:




- Backend focuses on business logic, data storage, and API.
- Frontend focuses on user interface, routing, and data visualization.
- Local development with a single command to run both.

This architecture ensures maintainability, scalability, and ease of understanding.

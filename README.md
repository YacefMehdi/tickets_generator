# Tickets Generator

A lightweight support ticketing web application built with **FastAPI**, **SQLite**, and **Vanilla JavaScript / HTML / CSS**.

The app supports role-based access control (**User** and **Admin**), secure authentication with **JWT** and **bcrypt**, ticket submission with image attachments, live status and note tracking, and ticket printing to PDF.

---

## Features

### Authentication & Security
- **Signup & Login**: Secure account creation with client-side and server-side validation.
- **Password Security**: Passwords hashed using `bcrypt`.
- **JWT Sessions**: Role-based JSON Web Tokens (`user` / `admin`) protecting backend endpoints.
- **Auto-logout on Expired Tokens**: Redirects to login when a token expires.

### User Flow
- **Submit Tickets**: Form to describe problems with title, description, priority, and optional image attachment.
- **My Tickets**: Personal dashboard to review ticket status (`Nouveau`, `En cours`, `Résolu`) and notes left by support.
- **Ticket Details Modal**: Detailed view for each ticket, with support for printing or exporting to PDF.

### Admin Flow
- **Overview & Statistics**: Live counters for total, new, in-progress, and resolved tickets.
- **Global Ticket Management**: View tickets submitted by all users.
- **Live Status Updates**: Update ticket status directly from the details view (`PATCH /all-tickets/change-state`).
- **Support Notes**: Add internal/support notes to any ticket (`PATCH /all-tickets/add-note`).
- **Printable Reports**: Clean print layout tailored for generating physical or PDF copies of tickets.

---

## Tech Stack

- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), SQLite3, PyJWT, bcrypt, Uvicorn
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ Fetch API)
- **Database**: SQLite (`users.db`)

---

## Project Structure

```text
tickets_generator/
│
├── backend/
│   ├── main.py            # FastAPI server & API endpoints
│   ├── setup_db.py        # Database initialization script
│   ├── update_db.py       # Database migration / schema updates
│   └── users.db           # SQLite database file
│
├── frontend/
│   ├── login.html         # Login page
│   ├── signup.html        # Registration page
│   ├── submit-ticket.html # Ticket submission form
│   ├── my-tickets.html    # Tickets dashboard & details modal
│   ├── css/
│   │   └── style.css      # Shared styling & print media queries
│   └── js/
│       ├── login.js
│       ├── signup.js
│       ├── submit-ticket.js
│       └── my-tickets.js
│
├── archive/               # Legacy Excel storage files (Users.xlsx, tickets.xlsx)
├── requirements.txt       # Python dependencies
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10 or higher installed.

### 2. Setup Virtual Environment

From the project root:

```powershell
# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 4. Database Setup

The database tables are automatically verified on server launch. If setting up for the first time or adding an initial user:

```powershell
python backend/setup_db.py
```

### 5. Run the Application

#### Start the Backend API:
```powershell
cd backend
uvicorn main:app --reload
```
The FastAPI backend will start at: `http://127.0.0.1:8000` (Interactive API docs available at `http://127.0.0.1:8000/docs`).

#### Open the Frontend:
Open `frontend/login.html` in your browser (or use VS Code's **Live Server** extension).

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Public | Register a new user |
| `POST` | `/login` | Public | Authenticate user & return JWT |
| `POST` | `/submit-ticket` | Authenticated | Submit a new ticket with optional image |
| `GET` | `/my-tickets` | User | Get tickets created by current user |
| `GET` | `/all-tickets` | Admin | Get all tickets with user info |
| `PATCH` | `/all-tickets/change-state` | Admin | Update a ticket's status |
| `PATCH` | `/all-tickets/add-note` | Admin | Add or edit support note |
| `GET` | `/ticket-image/{id}` | Authenticated | Retrieve base64 ticket image |

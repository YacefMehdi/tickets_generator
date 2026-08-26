from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import bcrypt
import sqlite3
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "mon_super_secret_cle_a_changer"
ALGORITHM = "HS256"

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Ticket(BaseModel):
    name: str
    title: str
    description: str
    priority: str

@app.get("/")
def read_root():
    return {"message": "hello"}

@app.post("/submit-ticket")
def submit_ticket(ticket: Ticket):
    print(ticket)

    if not ticket.name.strip() or not ticket.title.strip() or not ticket.description.strip():
        return {"status": "error", "message": "Veuillez remplir tous les champs obligatoires"}

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)

    cursor.execute("INSERT INTO tickets (name, title, description, priority, timestamp) VALUES (?, ?, ?, ?, ?)", (ticket.name, ticket.title, ticket.description, ticket.priority, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()

    return {"status": "received", "ticket": ticket}

class User(BaseModel):
    username: str
    password: str

@app.post("/signup")
def signup(user: User):
    if not user.username.strip() or not user.password.strip():
        return {"status": "error", "message": "Username and password cannot be empty"}

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    existing_user = cursor.fetchone()

    if existing_user:
        conn.close()
        return {"status": "error", "message": "Username already taken"}

    hashed_password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user.username, hashed_password))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "account created successfully"}

@app.post("/login")
def login(user: User):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {"status": "error", "message": "incorrect credentials"}

    stored_hash = row[2]
    if bcrypt.checkpw(user.password.encode(), stored_hash.encode()):
        expire = datetime.utcnow() + timedelta(minutes=30)
        payload = {
        "sub": user.username,
        "exp": expire
      }
      
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
      
        return {"status": "success", "message": "Login successful", "token": token}
    else:
        return {"status": "error", "message": "Incorrect credentials"}
from fastapi import FastAPI, Header, HTTPException
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
    title: str
    description: str
    priority: str
    state: str
    image: bytes = None

@app.post("/submit-ticket")
def submit_ticket(ticket: Ticket, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authentificated")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
   
    username = payload["sub"]
    print(username)
    print(ticket)

    if not ticket.title.strip() or not ticket.description.strip() or not ticket.priority.strip() or not ticket.state.strip():
        return {"status": "error", "message": "Veuillez remplir tous les champs obligatoires"}

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            state TEXT NOT NULL DEFAULT "Nouveau",
            image BLOB
        )
    """)
    cursor.execute("INSERT INTO tickets (username, title, description, priority, timestamp, state, image) VALUES (?, ?, ?, ?, ?, ?, ?)", (username, ticket.title, ticket.description, ticket.priority, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Nouveau", ticket.image))
    conn.commit()
    conn.close()

    return {"status": "received", "ticket": ticket}

@app.get("/my-tickets")
def get_tickets(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authentificated")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
   
    username = payload["sub"]
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tickets WHERE username = ?", (username,))
    rows = cursor.fetchall()  # raw tuples straight from the DB
    result = []               # the list of clean dicts you're building
    for row in rows:
        result.append({"id": row[0], "username": row[1], "title": row[2], "description": row[3], "priority": row[4], "timestamp": row[5], "state": row[6], "note": row[7]})
    conn.close()
    return {"status": "received", "my_tickets": result}


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
        expire = datetime.utcnow() + timedelta(hours=2)
        payload = {
            "sub": user.username,
            "exp": expire,
            "role": row[3]
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"status": "success", "message": "Login successful", "token": token}
    else:
        return {"status": "error", "message": "Incorrect credentials"}

@app.get("/all-tickets")
def get_all_tickets(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authentificated")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tickets")
    rows = cursor.fetchall()
    result = []
    for row in rows:
        result.append({"id": row[0], "username": row[1], "title": row[2], "description": row[3], "priority": row[4], "timestamp": row[5], "state": row[6], "note": row[7]})
    conn.close()
    return {"status": "success", "all_tickets": result}

@app.patch("/all-tickets/change-state") 
def change_state(ticket: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authentificated")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE tickets SET state = ? WHERE id = ?", (ticket["state"], ticket["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "State changed successfully"}

@app.patch("/all-tickets/add-note")
def add_note(ticket: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authentificated")
    
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute("UPDATE tickets SET note = ? WHERE id = ?", (ticket["note"], ticket["id"]))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Note added successfully"}
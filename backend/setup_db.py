import psycopg

conn = psycopg.connect(
    host="localhost",
    port="5432",
    dbname="tickets_db",
    user="postgres",
    password="mysecretpassword"
)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
    )
""")

cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", ("mehdi", "hash"))

conn.commit()

cursor.execute("SELECT * FROM users")
print(cursor.fetchall())

conn.close()
from db import connect_db
import psycopg

conn = connect_db()
cursor = conn.cursor()

cursor.execute("ALTER TABLE tickets ADD COLUMN note TEXT DEFAULT ''")
conn.commit()
conn.close()

print("Done: note added")
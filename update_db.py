import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

cursor.execute("ALTER TABLE tickets ADD COLUMN image BLOB")
conn.commit()
conn.close()

print("Done: ticket image added")
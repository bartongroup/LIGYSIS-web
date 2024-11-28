import os
import sqlite3

from config import DATABASE_PATH

def initialize_db():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS file_metadata (
            id INTEGER PRIMARY KEY,
            session_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            results TEXT NOT NULL,
            submission_time DATETIME NOT NULL,
            status TEXT NOT NULL,
            expiration_time DATETIME
        )
        ''')
        add_slivka_id_column(cursor)

def add_slivka_id_column(cursor):
    cursor.execute("PRAGMA table_info(file_metadata)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'slivka_id' not in columns:
        cursor.execute('ALTER TABLE file_metadata ADD COLUMN slivka_id TEXT')

def insert_metadata(session_id, filename, results, submission_time, status, expiration_time, slivka_id=None):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO file_metadata (session_id, filename, results, submission_time, status, expiration_time, slivka_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (session_id, filename, results, submission_time, status, expiration_time, slivka_id))
        return cursor.lastrowid

def update_status(entry_id, status):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        UPDATE file_metadata 
        SET status = ? 
        WHERE id = ?
        ''', (status, entry_id))

def update_slivka_id(entry_id, slivka_id):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        UPDATE file_metadata 
        SET slivka_id = ? 
        WHERE id = ?
        ''', (slivka_id, entry_id))

def fetch_results(session_id):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        SELECT filename, results, submission_time, status, expiration_time, slivka_id 
        FROM file_metadata 
        WHERE session_id = ?
        ''', (session_id,))
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
    return results

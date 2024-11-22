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

def insert_metadata(session_id, filename, results, submission_time, status, expiration_time):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO file_metadata (session_id, filename, results, submission_time, status, expiration_time) 
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (session_id, filename, results, submission_time, status, expiration_time))

def update_status(session_id, filename, status):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        UPDATE file_metadata 
        SET status = ? 
        WHERE session_id = ? AND filename = ?
        ''', (status, session_id, filename))

def fetch_results(session_id):
    with sqlite3.connect(DATABASE_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        SELECT filename, results, submission_time, status, expiration_time 
        FROM file_metadata 
        WHERE session_id = ?
        ''', (session_id,))
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
    return results

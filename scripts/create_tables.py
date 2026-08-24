#!/usr/bin/env python3
"""One-off script: create the ContactSubmission/DriverApplication tables
against whatever DATABASE_URL is configured (run once per database, e.g.
once against local SQLite and once against Supabase before first deploy)."""

from app import app
from models import db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Tables created.")

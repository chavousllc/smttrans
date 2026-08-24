from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class ContactSubmission(db.Model):
    """Model for storing contact form submissions"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    service = db.Column(db.String(100))
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')  # new, read, replied, archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    replied_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<ContactSubmission {self.name} - {self.email}>'

class DriverApplication(db.Model):
    """Model for storing driver applications"""
    id = db.Column(db.Integer, primary_key=True)

    # Personal Information
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    zip_code = db.Column(db.String(10), nullable=False)

    # Driving Information
    license_number = db.Column(db.String(50), nullable=False)
    license_state = db.Column(db.String(50), nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    experience = db.Column(db.String(100), nullable=False)
    endorsements = db.Column(db.String(200))
    preferred_routes = db.Column(db.String(200))

    # Employment Information
    current_employer = db.Column(db.String(100))
    employment_start = db.Column(db.Date)
    employment_end = db.Column(db.Date)
    reason_for_leaving = db.Column(db.String(200))

    # Additional Information
    availability = db.Column(db.String(100), nullable=False)
    additional_info = db.Column(db.Text)

    # Application Status
    status = db.Column(db.String(20), default='pending')  # pending, reviewing, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<DriverApplication {self.first_name} {self.last_name}>'

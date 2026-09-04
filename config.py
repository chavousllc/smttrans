import os
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Email configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    EMAIL_USER = os.getenv('EMAIL_USER', '')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')
    CONTACT_RECIPIENT_EMAIL = os.getenv('CONTACT_RECIPIENT_EMAIL', 'dispatch@smttrans.com')
    APPLICATION_RECIPIENT_EMAIL = os.getenv('APPLICATION_RECIPIENT_EMAIL', 'safety@smttrans.com')

    # Flask configuration
    SECRET_KEY = os.environ['SECRET_KEY']
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///smttrans.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Supabase's pooled (pgbouncer/Supavisor transaction-mode) connection is meant
    # to be used with a small, short-lived connection pool per app instance.
    SQLALCHEMY_ENGINE_OPTIONS = (
        {'poolclass': NullPool}
        if SQLALCHEMY_DATABASE_URI.startswith('sqlite')
        else {
            'pool_size': 5,
            'max_overflow': 10,
            'pool_recycle': 3600,
            'pool_pre_ping': True,
        }
    )

    # Pagination
    POSTS_PER_PAGE = 10
    CONTENT_ITEMS_PER_PAGE = 20


SITE_SETTINGS = {
    'contact_phone': '(207) 770-1111',
    'contact_phone_tel': '+12077701111',
    'contact_email': 'dispatch@smttrans.com',
    'contact_address': '10081 Sandmeyere Ln Unit 1\nPhiladelphia, PA 19116',
    # Single-line form for Google Maps query URLs — the multi-line version above
    # embeds a raw newline (rendered as %0A when urlencoded), which breaks Maps'
    # address parsing.
    'contact_address_line': '10081 Sandmeyere Ln Unit 1, Philadelphia, PA 19116',
    'contact_hours': '24/7 Dispatch Available',
    'social_facebook': '',
    'social_linkedin': 'https://www.linkedin.com/company/smttrans',
    'social_instagram': 'https://www.instagram.com/smttrans',
}

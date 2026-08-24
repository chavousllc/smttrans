from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

from models import db, ContactSubmission, DriverApplication
from config import Config, SITE_SETTINGS

app = Flask(__name__, static_folder='public/static', static_url_path='/static')
app.config.from_object(Config)

db.init_app(app)
CORS(app)
csrf = CSRFProtect(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.context_processor
def inject_global_data():
    """Make site-wide settings and the current year available to every template"""
    return {'site_settings': SITE_SETTINGS, 'current_year': datetime.utcnow().year}


def send_email(subject, body, recipient, is_html=False):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart()
        msg['From'] = app.config['EMAIL_USER']
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html' if is_html else 'plain'))

        server = smtplib.SMTP(app.config['SMTP_SERVER'], app.config['SMTP_PORT'])
        server.starttls()
        server.login(app.config['EMAIL_USER'], app.config['EMAIL_PASSWORD'])
        server.sendmail(app.config['EMAIL_USER'], recipient, msg.as_string())
        server.quit()

        logger.info(f"Email sent successfully: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False


# Frontend Routes
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/mechanics')
def mechanics():
    return render_template('mechanics.html')


@app.route('/application')
def application():
    return render_template('application.html')


# Contact and Application API Routes
@app.route('/api/contact', methods=['POST'])
def contact_form():
    """Handle contact form submission"""
    try:
        data = request.get_json()

        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        service = data.get('service', '').strip()
        message = data.get('message', '').strip()

        if not name or not email or not service or not message:
            return jsonify({
                'success': False,
                'message': 'Please fill in all required fields.'
            }), 400

        contact = ContactSubmission(
            name=name, email=email, phone=phone, service=service, message=message
        )
        db.session.add(contact)
        db.session.commit()

        subject = f"New Contact Form Submission - {name}"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                    New Contact Form Submission
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Contact Information</h3>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Phone:</strong> {phone if phone else 'Not provided'}</p>
                    <p><strong>Service Interest:</strong> {service}</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Message</h3>
                    <p style="white-space: pre-wrap;">{message}</p>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                    <p>Submitted on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p>Source: SMT Trans LLC Website Contact Form</p>
                </div>
            </div>
        </body>
        </html>
        """

        if send_email(subject, html_body, app.config['CONTACT_RECIPIENT_EMAIL'], is_html=True):
            return jsonify({
                'success': True,
                'message': "Thank you! Your message has been sent successfully. We'll get back to you soon."
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Sorry, there was an error sending your message. Please try again later.'
            }), 500

    except Exception as e:
        logger.error(f"Contact form error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500


@app.route('/api/application', methods=['POST'])
def driver_application():
    """Handle driver application submission"""
    try:
        data = request.get_json()

        required_fields = [
            'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state',
            'zipCode', 'licenseNumber', 'licenseState', 'licenseExpiry', 'experience',
            'availability'
        ]
        missing = [f for f in required_fields if not (data.get(f) or '').strip()]
        if missing:
            return jsonify({
                'success': False,
                'message': f'Please fill in all required fields: {", ".join(missing)}'
            }), 400

        try:
            license_expiry = datetime.strptime(data['licenseExpiry'].strip(), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Please provide a valid license expiration date.'
            }), 400

        def parse_optional_date(value):
            value = (value or '').strip()
            return datetime.strptime(value, '%Y-%m-%d').date() if value else None

        try:
            employment_start = parse_optional_date(data.get('employmentStart'))
            employment_end = parse_optional_date(data.get('employmentEnd'))
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Please provide valid employment dates.'
            }), 400

        application = DriverApplication(
            first_name=data['firstName'].strip(),
            last_name=data['lastName'].strip(),
            email=data['email'].strip(),
            phone=data['phone'].strip(),
            address=data['address'].strip(),
            city=data['city'].strip(),
            state=data['state'].strip(),
            zip_code=data['zipCode'].strip(),
            license_number=data['licenseNumber'].strip(),
            license_state=data['licenseState'].strip(),
            license_expiry=license_expiry,
            experience=data['experience'].strip(),
            endorsements=data.get('endorsements', '').strip(),
            preferred_routes=data.get('preferredRoutes', '').strip(),
            current_employer=data.get('currentEmployer', '').strip(),
            employment_start=employment_start,
            employment_end=employment_end,
            reason_for_leaving=data.get('reasonForLeaving', '').strip(),
            availability=data['availability'].strip(),
            additional_info=data.get('additionalInfo', '').strip()
        )

        db.session.add(application)
        db.session.commit()

        subject = f"New Driver Application - {application.first_name} {application.last_name}"
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                    New Driver Application
                </h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Personal Information</h3>
                    <p><strong>Name:</strong> {application.first_name} {application.last_name}</p>
                    <p><strong>Email:</strong> {application.email}</p>
                    <p><strong>Phone:</strong> {application.phone}</p>
                    <p><strong>Address:</strong> {application.address}, {application.city}, {application.state} {application.zip_code}</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Driving Information</h3>
                    <p><strong>CDL License Number:</strong> {application.license_number}</p>
                    <p><strong>License State:</strong> {application.license_state}</p>
                    <p><strong>License Expiration:</strong> {application.license_expiry}</p>
                    <p><strong>Experience:</strong> {application.experience}</p>
                    <p><strong>Endorsements:</strong> {application.endorsements if application.endorsements else 'None'}</p>
                    <p><strong>Preferred Routes:</strong> {application.preferred_routes if application.preferred_routes else 'No preference'}</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Employment History</h3>
                    <p><strong>Current/Previous Employer:</strong> {application.current_employer if application.current_employer else 'Not provided'}</p>
                    <p><strong>Employment Period:</strong> {application.employment_start if application.employment_start else 'Not provided'} to {application.employment_end if application.employment_end else 'Present'}</p>
                    <p><strong>Reason for Leaving:</strong> {application.reason_for_leaving if application.reason_for_leaving else 'Not provided'}</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #dc2626; margin-top: 0;">Additional Information</h3>
                    <p><strong>Availability:</strong> {application.availability}</p>
                    <p><strong>Additional Information:</strong></p>
                    <p style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 4px;">{application.additional_info if application.additional_info else 'None provided'}</p>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                    <p>Submitted on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                    <p>Source: SMT Trans LLC Driver Application Form</p>
                </div>
            </div>
        </body>
        </html>
        """

        if send_email(subject, html_body, app.config['APPLICATION_RECIPIENT_EMAIL'], is_html=True):
            return jsonify({
                'success': True,
                'message': 'Thank you! Your application has been submitted successfully. We will review it and get back to you within 2-3 business days.'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Sorry, there was an error submitting your application. Please try again later.'
            }), 500

    except Exception as e:
        logger.error(f"Application form error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500


@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('errors/500.html'), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5001)

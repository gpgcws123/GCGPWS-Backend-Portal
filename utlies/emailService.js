const nodemailer = require('nodemailer');

// Create a transporter with more secure configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Enable debug logging
});

// Test the configuration
console.log('\n=== Email Configuration ===');
console.log('Checking email settings...');
console.log('Email:', process.env.EMAIL_USER);

// Test connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('\n❌ Email Configuration Error:');
    console.error('Type:', error.name);
    console.error('Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('\nPossible solutions:');
      console.error('1. Check if .env file exists in GCGPWS-Backend-Portal folder');
      console.error('2. Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env');
      console.error('3. Make sure there are no spaces in the password');
    }
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email templates
const templates = {
  acknowledgment: (data) => {
    return {
      subject: 'Application Received: GCGPWS College',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003366; padding: 20px; text-align: center; color: white;">
            <h1>GCGPWS College</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>We are pleased to confirm that we have received your application for admission to our <strong>${data.course.toUpperCase()}</strong> program.</p>
            <p>Your application reference number is: <strong>${data.applicationId}</strong></p>
            <p>Our admissions team will review your application and contact you soon. You can check your application status through our portal.</p>
            <p>If you have any questions, please contact our admissions office.</p>
            <p>Thank you for considering GCGPWS College for your educational journey.</p>
            <p>Best regards,<br>Admissions Team<br>GCGPWS College</p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
  },

  approval: (data) => {
    return {
      subject: 'Application Approved: GCGPWS College',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #006633; padding: 20px; text-align: center; color: white;">
            <h1>GCGPWS College</h1>
            <h2>Application Approved!</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Congratulations! We are pleased to inform you that your application for admission to our <strong>${data.course.toUpperCase()}</strong> program has been <strong>APPROVED</strong>.</p>
            <p>Please visit our campus with the following documents within the next 7 days to complete your admission process:</p>
            <ul>
              <li>Original academic certificates</li>
              <li>ID proof</li>
              <li>Passport sized photographs</li>
              <li>Application fee receipt</li>
            </ul>
            <p>If you have any questions, please contact our admissions office.</p>
            <p>We look forward to welcoming you to GCGPWS College!</p>
            <p>Best regards,<br>Admissions Team<br>GCGPWS College</p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
  },

  rejection: (data) => {
    return {
      subject: 'Application Status Update: GCGPWS College',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003366; padding: 20px; text-align: center; color: white;">
            <h1>GCGPWS College</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
            <p>Dear ${data.firstName} ${data.lastName},</p>
            <p>Thank you for your interest in our <strong>${data.course.toUpperCase()}</strong> program at GCGPWS College.</p>
            <p>After careful review of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
            ${data.reason ? `<p>Reason: ${data.reason}</p>` : ''}
            <p>We encourage you to explore other programs or reapply in the next admission cycle.</p>
            <p>If you have any questions or would like further clarification, please contact our admissions office.</p>
            <p>We wish you success in your future educational endeavors.</p>
            <p>Best regards,<br>Admissions Team<br>GCGPWS College</p>
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
  }
};

// Send acknowledgment email when application is submitted
exports.sendAcknowledgmentEmail = async (to, data) => {
  try {
    console.log('Preparing to send acknowledgment email to:', to);
    const emailContent = templates.acknowledgment(data);

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GCGPWS College <noreply@gcgpws.edu>',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log('Mail options:', { ...mailOptions, html: 'HTML content hidden' });
    await transporter.sendMail(mailOptions);
    console.log('Acknowledgment email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending acknowledgment email:', error);
    return false;
  }
};

// Send approval email
exports.sendApprovalEmail = async (to, data) => {
  try {
    console.log('\n=== Sending Approval Email ===');
    console.log('To:', to);
    console.log('Student Name:', `${data.firstName} ${data.lastName}`);
    console.log('Course:', data.course);

    const emailContent = templates.approval(data);
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GCGPWS College <noreply@gcgpws.edu>',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('\n✅ Email Sent Successfully');
    console.log('Message ID:', result.messageId);
    console.log('================================\n');
    return true;
  } catch (error) {
    console.error('\n❌ Email Sending Failed');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication Failed: Please check your email and password');
    }
    console.error('================================\n');
    return false;
  }
};

// Send rejection email
exports.sendRejectionEmail = async (to, data) => {
  try {
    console.log('\n=== Sending Rejection Email ===');
    console.log('To:', to);
    console.log('Student Name:', `${data.firstName} ${data.lastName}`);
    console.log('Course:', data.course);
    console.log('Reason:', data.reason || 'No reason provided');

    const emailContent = templates.rejection(data);
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GCGPWS College <noreply@gcgpws.edu>',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('\n✅ Email Sent Successfully');
    console.log('Message ID:', result.messageId);
    console.log('================================\n');
    return true;
  } catch (error) {
    console.error('\n❌ Email Sending Failed');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Authentication Failed: Please check your email and password');
    }
    console.error('================================\n');
    return false;
  }
};
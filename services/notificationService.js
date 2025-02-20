const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
    user: process.env.EMAIL_USER,     // Your email address
    pass: process.env.EMAIL_PASSWORD  // Your email password or app-specific password
  }
});

const sendTaskAssignmentNotification = async (task) => {
  try {
    // Get user details
    const assignedUser = await User.findById(task.assignedTo);
    
    if (!assignedUser) {
      console.error('User not found for notification');
      return;
    }
    
    // Log notification (simulating email or push notification)
    console.log(`
      Notification sent to: ${assignedUser.email}
      Subject: New Task Assignment
      Body: You have been assigned a new task: ${task.title}
      Priority: ${task.priority}
      Status: ${task.status}
    `);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: assignedUser.email,
      subject: 'New Task Assignment',
      html: `
        <h2>New Task Assignment</h2>
        <p>Hello ${assignedUser.name},</p>
        <p>You have been assigned a new task:</p>
        <div style="margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3>${task.title}</h3>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
          <p><strong>Due Date:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not specified'}</p>
        </div>
        <p>Please log in to the system to view more details and start working on this task.</p>
        <p>Best regards,<br>Task Management System</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Notification error:', error);
    return false;
  }
};

module.exports = {
  sendTaskAssignmentNotification
};
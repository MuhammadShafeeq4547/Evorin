// utils/emailService.js
const nodemailer = require('nodemailer');
const emailTemplates = require('./emailTemplates');

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('✉️ Email service ready');
  }
});

const emailService = {
  // Send generic email
  sendEmail: async ({ to, subject, html, text }) => {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Instagram Clone'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Send email error:', error);
      return { success: false, error: error.message };
    }
  },

  // Send verification email
  sendVerificationEmail: async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    const html = emailTemplates.verification(user.fullName, verificationUrl);

    return await emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html
    });
  },

  // Send password reset email
  sendPasswordResetEmail: async (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = emailTemplates.passwordReset(user.fullName, resetUrl);

    return await emailService.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html
    });
  },

  // Send new follower notification
  sendNewFollowerEmail: async (user, follower) => {
    const html = emailTemplates.newFollower(
      user.fullName,
      follower.username,
      follower.fullName,
      follower.avatar,
      `${process.env.FRONTEND_URL}/profile/${follower.username}`
    );

    return await emailService.sendEmail({
      to: user.email,
      subject: `${follower.username} started following you`,
      html
    });
  },

  // Send new like notification
  sendNewLikeEmail: async (user, liker, post) => {
    const html = emailTemplates.newLike(
      user.fullName,
      liker.username,
      liker.avatar,
      post.images[0]?.url,
      `${process.env.FRONTEND_URL}/p/${post._id}`
    );

    return await emailService.sendEmail({
      to: user.email,
      subject: `${liker.username} liked your post`,
      html
    });
  },

  // Send new comment notification
  sendNewCommentEmail: async (user, commenter, post, commentText) => {
    const html = emailTemplates.newComment(
      user.fullName,
      commenter.username,
      commenter.avatar,
      commentText,
      post.images[0]?.url,
      `${process.env.FRONTEND_URL}/p/${post._id}`
    );

    return await emailService.sendEmail({
      to: user.email,
      subject: `${commenter.username} commented on your post`,
      html
    });
  },

  // Send welcome email
  sendWelcomeEmail: async (user) => {
    const html = emailTemplates.welcome(
      user.fullName,
      user.username,
      `${process.env.FRONTEND_URL}/profile/${user.username}`
    );

    return await emailService.sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.APP_NAME || 'Instagram Clone'}!`,
      html
    });
  },

  // Send 2FA code
  send2FACode: async (user, code) => {
    const html = emailTemplates.twoFactorAuth(user.fullName, code);

    return await emailService.sendEmail({
      to: user.email,
      subject: 'Your Two-Factor Authentication Code',
      html
    });
  }
};

module.exports = emailService;
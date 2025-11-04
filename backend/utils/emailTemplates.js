// utils/emailTemplates.js

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
`;

const buttonStyle = `
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  margin: 20px 0;
`;

const containerStyle = `
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const logoStyle = `
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 30px;
`;

const emailTemplates = {
  // Email verification template
  verification: (fullName, verificationUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p>Thanks for signing up! Please verify your email address to get started.</p>
          
          <a href="${verificationUrl}" style="${buttonStyle}">
            Verify Email Address
          </a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // Password reset template
  passwordReset: (fullName, resetUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          
          <a href="${resetUrl}" style="${buttonStyle}">
            Reset Password
          </a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          
          <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong>⚠️ This link will expire in 1 hour.</strong>
          </p>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // New follower notification
  newFollower: (fullName, followerUsername, followerFullName, followerAvatar, profileUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p><strong>${followerUsername}</strong> started following you.</p>
          
          <div style="display: flex; align-items: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <img src="${followerAvatar || 'https://via.placeholder.com/60'}" 
                 alt="${followerUsername}" 
                 style="width: 60px; height: 60px; border-radius: 50%; margin-right: 15px;">
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${followerUsername}</div>
              <div style="color: #666; font-size: 14px;">${followerFullName}</div>
            </div>
          </div>
          
          <a href="${profileUrl}" style="${buttonStyle}">
            View Profile
          </a>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // New like notification
  newLike: (fullName, likerUsername, likerAvatar, postImage, postUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p><strong>${likerUsername}</strong> liked your post.</p>
          
          <div style="display: flex; align-items: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <img src="${likerAvatar || 'https://via.placeholder.com/60'}" 
                 alt="${likerUsername}" 
                 style="width: 60px; height: 60px; border-radius: 50%; margin-right: 15px;">
            <div style="flex: 1;">
              <div style="font-weight: 600;">${likerUsername}</div>
            </div>
            <img src="${postImage || 'https://via.placeholder.com/80'}" 
                 alt="Post" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
          </div>
          
          <a href="${postUrl}" style="${buttonStyle}">
            View Post
          </a>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // New comment notification
  newComment: (fullName, commenterUsername, commenterAvatar, commentText, postImage, postUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p><strong>${commenterUsername}</strong> commented on your post.</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <img src="${commenterAvatar || 'https://via.placeholder.com/40'}" 
                   alt="${commenterUsername}" 
                   style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
              <div style="font-weight: 600;">${commenterUsername}</div>
            </div>
            <p style="margin: 0; color: #333;">${commentText}</p>
          </div>
          
          ${postImage ? `
            <img src="${postImage}" 
                 alt="Post" 
                 style="width: 100%; max-width: 300px; height: auto; border-radius: 8px; margin: 20px 0;">
          ` : ''}
          
          <a href="${postUrl}" style="${buttonStyle}">
            View Post
          </a>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // Welcome email
  welcome: (fullName, username, profileUrl) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Welcome, ${fullName}! 🎉</h2>
          
          <p>We're excited to have you join our community! Your account <strong>@${username}</strong> is now active.</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin-top: 0; color: white;">Get Started:</h3>
            <ul style="padding-left: 20px;">
              <li>Complete your profile</li>
              <li>Find friends to follow</li>
              <li>Share your first post</li>
              <li>Explore trending content</li>
            </ul>
          </div>
          
          <a href="${profileUrl}" style="${buttonStyle}">
            Complete Your Profile
          </a>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/help" style="color: #833AB4;">Help Center</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `,

  // Two-factor authentication code
  twoFactorAuth: (fullName, code) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="${baseStyle}">
        <div style="${containerStyle}">
          <div style="${logoStyle}">Instagram</div>
          
          <h2>Hi ${fullName}!</h2>
          
          <p>Your two-factor authentication code is:</p>
          
          <div style="background: #f8f9fa; border: 2px solid #833AB4; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #833AB4;">${code}</div>
          </div>
          
          <p style="padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong>⚠️ This code will expire in 10 minutes.</strong>
          </p>
          
          <p style="margin-top: 40px; color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email and ensure your account is secure.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Instagram Clone. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `
};

module.exports = emailTemplates;
import nodemailer from 'nodemailer';

// Create transporter
const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendReminderEmail = async (content, clientName) => {
  try {
    const transporter = createTransport();

    // Format the publish date
    const publishDate = new Date(content.publishAt).toLocaleString();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: content.reminderEmails.join(', '),
      subject: `Content Reminder: ${clientName} - ${content.contentType}`,
      html: `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 6px #eaeaea; padding: 32px 32px 24px 32px;">
    <h2 style="color: #2563eb; margin-bottom: 10px; letter-spacing: 1px; font-size: 1.8rem;">Content Reminder: Scheduled Post</h2>
    <p style="font-size: 16px; color: #222; margin-bottom: 30px;">
      Hello,<br />
      This is a friendly reminder for your scheduled content on <strong>Aieera CONCAL</strong>.
    </p>

    <div style="background-color: #f3f6fa; padding: 20px 18px 16px 18px; border-radius: 7px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 1.15rem; letter-spacing: 0.2px;">Content Details</h3>
      <p style="margin: 0 0 7px 0; font-size: 15px;"><strong>Client:</strong> ${clientName}</p>
      <p style="margin: 0 0 7px 0; font-size: 15px;"><strong>Type:</strong> ${content.contentType}</p>
      <p style="margin: 0 0 7px 0; font-size: 15px;"><strong>Caption:</strong> ${content.caption}</p>
      <p style="margin: 0 0 7px 0; font-size: 15px;">
        <strong>Media:</strong> <a href="${content.mediaUrl}" target="_blank" style="color: #2563eb; word-break: break-all;">${content.mediaUrl}</a>
      </p>
      <p style="margin: 0; font-size: 15px;"><strong>Scheduled for:</strong> ${publishDate}</p>
    </div>

    <div style="background: #fffbe3; padding: 15px 16px; border-left: 4px solid #facc15; border-radius: 5px; margin-bottom: 22px;">
      <p style="margin: 0; color: #ad8c00; font-size: 15px;">
        <strong>⏰ Reminder:</strong> This content will be published in <b>3 hours</b>!
      </p>
    </div>

    <p style="color: #888; font-size: 13px; text-align: right; margin-top: 28px;">
      — Aieera CONCAL Automated Notification
    </p>
  </div>
`

    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Reminder email sent:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};
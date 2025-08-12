import cron from 'node-cron';
import Content from '../models/Content.js';
import { sendReminderEmail } from './emailService.js';

// Job to update overdue content status
export const startStatusUpdateJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const overdueContent = await Content.updateMany(
        {
          status: 'Pending',
          publishAt: { $lt: now }
        },
        {
          status: 'Not Posted'
        }
      );

      if (overdueContent.modifiedCount > 0) {
        console.log(`Updated ${overdueContent.modifiedCount} overdue content to 'Not Posted'`);
      }
    } catch (error) {
      console.error('Status update job error:', error);
    }
  });

  console.log('Status update cron job started');
};

// Job to send reminder emails
export const startEmailReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

      const contentToRemind = await Content.find({
        isReminderSent: false,
        publishAt: {
          $gte: now,
          $lte: threeHoursFromNow
        },
        reminderEmails: { $ne: [] }
      }).populate('client', 'name');

      for (const content of contentToRemind) {
        const emailSent = await sendReminderEmail(content, content.client.name);
        
        if (emailSent) {
          await Content.findByIdAndUpdate(content._id, {
            isReminderSent: true
          });
          
          console.log(`Reminder sent for content: ${content._id}`);
        }
      }
    } catch (error) {
      console.error('Email reminder job error:', error);
    }
  });

  console.log('Email reminder cron job started');
};
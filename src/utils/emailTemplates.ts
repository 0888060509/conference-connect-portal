
import { format } from "date-fns";
import { Booking } from "@/components/bookings/PersonalBookings";

// Base email template for consistent styling
const baseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Room Booking</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; }
    .button { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; 
              text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Meeting Master</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from Meeting Master. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Meeting Master. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Booking confirmation email template
export const generateBookingConfirmationEmail = (booking: Booking, userName: string) => {
  const content = `
    <h2>Booking Confirmation</h2>
    <p>Hello ${userName},</p>
    <p>Your booking has been successfully confirmed. Here are the details:</p>
    
    <div class="details">
      <p><strong>Meeting:</strong> ${booking.title}</p>
      <p><strong>Room:</strong> ${booking.roomName}</p>
      <p><strong>Location:</strong> ${booking.location}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(booking.start), "h:mm a")} - ${format(new Date(booking.end), "h:mm a")}</p>
      <p><strong>Attendees:</strong> ${booking.attendees.join(", ")}</p>
    </div>
    
    <p>You can view and manage your booking through the Meeting Master app.</p>
    <a href="https://meetingmaster.app/bookings/${booking.id}" class="button">View Booking</a>
    
    <p>Thank you for using Meeting Master!</p>
  `;
  
  return {
    subject: `Booking Confirmed: ${booking.title}`,
    body: baseEmailTemplate(content)
  };
};

// Booking reminder email template
export const generateReminderEmail = (booking: Booking, userName: string, minutesBefore: number) => {
  let timePhrase;
  if (minutesBefore < 60) {
    timePhrase = `${minutesBefore} minutes`;
  } else if (minutesBefore === 60) {
    timePhrase = "1 hour";
  } else if (minutesBefore < 1440) {
    timePhrase = `${minutesBefore / 60} hours`;
  } else if (minutesBefore === 1440) {
    timePhrase = "1 day";
  } else {
    timePhrase = `${minutesBefore / 1440} days`;
  }
  
  const content = `
    <h2>Meeting Reminder</h2>
    <p>Hello ${userName},</p>
    <p>This is a reminder that you have a meeting scheduled in ${timePhrase}:</p>
    
    <div class="details">
      <p><strong>Meeting:</strong> ${booking.title}</p>
      <p><strong>Room:</strong> ${booking.roomName}</p>
      <p><strong>Location:</strong> ${booking.location}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(booking.start), "h:mm a")} - ${format(new Date(booking.end), "h:mm a")}</p>
    </div>
    
    <a href="https://meetingmaster.app/bookings/${booking.id}" class="button">View Booking</a>
  `;
  
  return {
    subject: `Reminder: ${booking.title} (${timePhrase})`,
    body: baseEmailTemplate(content)
  };
};

// Booking modification email template
export const generateBookingModificationEmail = (booking: Booking, userName: string, changes: string[]) => {
  const content = `
    <h2>Booking Updated</h2>
    <p>Hello ${userName},</p>
    <p>Your booking has been updated. Here are the changes:</p>
    
    <div class="details">
      <ul>
        ${changes.map(change => `<li>${change}</li>`).join("")}
      </ul>
    </div>
    
    <p>Here are the updated booking details:</p>
    
    <div class="details">
      <p><strong>Meeting:</strong> ${booking.title}</p>
      <p><strong>Room:</strong> ${booking.roomName}</p>
      <p><strong>Location:</strong> ${booking.location}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(booking.start), "h:mm a")} - ${format(new Date(booking.end), "h:mm a")}</p>
      <p><strong>Attendees:</strong> ${booking.attendees.join(", ")}</p>
    </div>
    
    <a href="https://meetingmaster.app/bookings/${booking.id}" class="button">View Booking</a>
  `;
  
  return {
    subject: `Booking Updated: ${booking.title}`,
    body: baseEmailTemplate(content)
  };
};

// Booking cancellation email template
export const generateBookingCancellationEmail = (booking: Booking, userName: string, reason?: string) => {
  const content = `
    <h2>Booking Cancelled</h2>
    <p>Hello ${userName},</p>
    <p>Your booking has been cancelled. Here are the details of the cancelled booking:</p>
    
    <div class="details">
      <p><strong>Meeting:</strong> ${booking.title}</p>
      <p><strong>Room:</strong> ${booking.roomName}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(booking.start), "h:mm a")} - ${format(new Date(booking.end), "h:mm a")}</p>
      ${reason ? `<p><strong>Cancellation Reason:</strong> ${reason}</p>` : ''}
    </div>
    
    <p>You can book a new meeting through the Meeting Master app.</p>
    <a href="https://meetingmaster.app/bookings/new" class="button">New Booking</a>
  `;
  
  return {
    subject: `Booking Cancelled: ${booking.title}`,
    body: baseEmailTemplate(content)
  };
};

// Booking conflict alert email template
export const generateBookingConflictEmail = (
  booking: Booking, 
  conflictingBooking: Booking, 
  userName: string
) => {
  const content = `
    <h2>Booking Conflict Alert</h2>
    <p>Hello ${userName},</p>
    <p>We've detected a potential conflict with one of your bookings:</p>
    
    <div class="details">
      <p><strong>Your Booking:</strong> ${booking.title}</p>
      <p><strong>Room:</strong> ${booking.roomName}</p>
      <p><strong>Date:</strong> ${format(new Date(booking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(booking.start), "h:mm a")} - ${format(new Date(booking.end), "h:mm a")}</p>
    </div>
    
    <p>Conflicts with:</p>
    
    <div class="details">
      <p><strong>Meeting:</strong> ${conflictingBooking.title}</p>
      <p><strong>Room:</strong> ${conflictingBooking.roomName}</p>
      <p><strong>Date:</strong> ${format(new Date(conflictingBooking.start), "EEEE, MMMM d, yyyy")}</p>
      <p><strong>Time:</strong> ${format(new Date(conflictingBooking.start), "h:mm a")} - ${format(new Date(conflictingBooking.end), "h:mm a")}</p>
      <p><strong>Organizer:</strong> ${conflictingBooking.createdBy || 'Unknown'}</p>
    </div>
    
    <p>Please review and resolve this conflict as soon as possible.</p>
    <a href="https://meetingmaster.app/bookings/${booking.id}" class="button">Manage Your Booking</a>
  `;
  
  return {
    subject: `⚠️ Booking Conflict Alert: ${booking.title}`,
    body: baseEmailTemplate(content)
  };
};

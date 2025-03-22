
-- Required tables for NotificationService

-- Table for storing email notifications
CREATE TABLE IF NOT EXISTS email_notifications (
  id SERIAL PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table for storing calendar invites
CREATE TABLE IF NOT EXISTS calendar_invites (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(255) NOT NULL,
  calendar_type VARCHAR(50) NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  attendees JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table for storing push notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table for storing scheduled reminders
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channels JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  booking_id VARCHAR(255) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

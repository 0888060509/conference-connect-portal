
# PostgreSQL Database Setup

This application uses PostgreSQL for data storage. Follow these steps to set up the database:

## Database Configuration

The database connection is configured with the following parameters:

```
POSTGRES_USER=root
POSTGRES_HOST=app.riviu.com.vn
POSTGRES_DB=meetly_dev
POSTGRES_PASSWORD=PJp6xBv29pnRUZO
POSTGRES_PORT=5432
```

## Table Setup

To create the necessary database tables, run the SQL script in `setup.sql`. You can do this using the `psql` command-line tool:

```bash
psql -h app.riviu.com.vn -U root -d meetly_dev -f setup.sql
```

When prompted, enter the password: `PJp6xBv29pnRUZO`

Alternatively, you can use a PostgreSQL client tool like pgAdmin or DBeaver to run the script.

## Tables

The following tables are created:

- `email_notifications`: Logs of sent email notifications
- `calendar_invites`: Records of calendar invitations
- `push_notifications`: Logs of push notifications
- `scheduled_reminders`: Scheduled notification reminders
- `notifications`: In-app notifications for users

## Important Notes

- Make sure your application server has network access to the PostgreSQL server
- In a production environment, consider using environment variables for database credentials

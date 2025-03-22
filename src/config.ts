
/**
 * Application configuration
 * 
 * In a production environment, these would typically come from environment variables
 */

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  auth: {
    jwtSecret: 'meetly_jwt_secret_key', // In production, use environment variable
    jwtExpiresIn: '7d',
  },
  database: {
    // These would be server-side only in a real app
    user: 'root',
    host: 'app.riviu.com.vn',
    database: 'meetly_dev',
    password: 'PJp6xBv29pnRUZO',
    port: 5432
  }
};

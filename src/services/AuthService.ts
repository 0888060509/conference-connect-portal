
import { User, UserRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config";

// Mock users for development (in a real app, these would come from an API)
const MOCK_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@example.com',
    password: '$2a$10$KVfLF.mH8z1CWwXZd2HTe.Y.zRLMLDY7RB0JoK3Mtc7.vEKdpkzE2', // hashed 'password'
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin' as UserRole
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'user@example.com',
    password: '$2a$10$KVfLF.mH8z1CWwXZd2HTe.Y.zRLMLDY7RB0JoK3Mtc7.vEKdpkzE2', // hashed 'password'
    first_name: 'Regular',
    last_name: 'User',
    role: 'user' as UserRole
  }
];

// JWT secret key (in production, use environment variables)
const JWT_SECRET = config.auth.jwtSecret;
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn;

// Generate JWT token
const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };
    
    // Find user from mock data (in a real app, this would query the database)
    const mockUser = MOCK_USERS.find(u => u.id === decoded.id);
    
    if (!mockUser) {
      return null;
    }
    
    return {
      id: mockUser.id,
      email: mockUser.email,
      name: `${mockUser.first_name || ''} ${mockUser.last_name || ''}`.trim(),
      role: mockUser.role,
      department: 'Development' // Mock department
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

// Login user
export const login = async (email: string, password: string): Promise<{ user: User, token: string } | null> => {
  try {
    // Find user from mock data (in a real app, this would query the database)
    const mockUser = MOCK_USERS.find(u => u.email === email);
    
    if (!mockUser) {
      throw new Error("Invalid email or password");
    }
    
    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }
    
    const userData: User = {
      id: mockUser.id,
      email: mockUser.email,
      name: `${mockUser.first_name || ''} ${mockUser.last_name || ''}`.trim(),
      role: mockUser.role,
      department: 'Development' // Mock department
    };
    
    // In a real app, this would update the database
    console.log(`User ${userData.email} logged in at ${new Date().toISOString()}`);
    
    const token = generateToken(userData);
    
    return { user: userData, token };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register user
export const register = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<{ user: User, token: string } | null> => {
  try {
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (checkResult.rows.length > 0) {
      throw new Error("User with this email already exists");
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const result = await pool.query(
      `INSERT INTO users(
        email, 
        password, 
        first_name, 
        last_name, 
        role, 
        created_at
      ) VALUES($1, $2, $3, $4, $5, NOW()) RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, 'user']
    );
    
    const user = result.rows[0];
    
    const userData: User = {
      id: user.id,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role as UserRole
    };
    
    const token = generateToken(userData);
    
    return { user: userData, token };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Reset password request
export const resetPasswordRequest = async (email: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return true;
    }
    
    // In a real app, generate a reset token and send an email
    // For now, we'll just log it
    console.log(`Password reset requested for email: ${email}`);
    
    return true;
  } catch (error) {
    console.error("Reset password request error:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: { firstName?: string; lastName?: string; department?: string }
): Promise<User> => {
  try {
    const updateFields = [];
    const values = [];
    let counter = 1;
    
    if (data.firstName !== undefined) {
      updateFields.push(`first_name = $${counter}`);
      values.push(data.firstName);
      counter++;
    }
    
    if (data.lastName !== undefined) {
      updateFields.push(`last_name = $${counter}`);
      values.push(data.lastName);
      counter++;
    }
    
    if (data.department !== undefined) {
      updateFields.push(`department = $${counter}`);
      values.push(data.department);
      counter++;
    }
    
    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }
    
    values.push(userId);
    
    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${counter} 
       RETURNING id, email, first_name, last_name, role, department`,
      values
    );
    
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    
    const user = result.rows[0];
    
    return {
      id: user.id,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role as UserRole,
      department: user.department
    };
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

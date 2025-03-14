import { User, UserRole, UserImpl } from "@/contexts/auth/types";

export interface DirectoryUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  employeeId?: string;
  manager?: string;
  location?: string;
  phoneNumber?: string;
  startDate?: string;
  photoUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  headId: string;
  parentId?: string;
  description?: string;
}

// Mock directory data
const MOCK_DIRECTORY_USERS: DirectoryUser[] = [
  {
    id: "dir_1",
    email: "john.smith@company.com",
    first_name: "John",
    last_name: "Smith",
    department: "Engineering",
    position: "Senior Developer",
    employeeId: "EMP001",
    manager: "jane.doe@company.com",
    location: "HQ, Floor 3",
    phoneNumber: "+1 (555) 123-4567",
    startDate: "2018-05-10",
    photoUrl: "https://i.pravatar.cc/150?u=john.smith",
  },
  {
    id: "dir_2",
    email: "jane.doe@company.com",
    first_name: "Jane",
    last_name: "Doe",
    department: "Engineering",
    position: "Engineering Manager",
    employeeId: "EMP002",
    manager: "alex.williams@company.com",
    location: "HQ, Floor 3",
    phoneNumber: "+1 (555) 234-5678",
    startDate: "2016-08-15",
    photoUrl: "https://i.pravatar.cc/150?u=jane.doe",
  },
  {
    id: "dir_3",
    email: "alex.williams@company.com",
    first_name: "Alex",
    last_name: "Williams",
    department: "Executive",
    position: "CTO",
    employeeId: "EMP003",
    location: "HQ, Floor 5",
    phoneNumber: "+1 (555) 345-6789",
    startDate: "2015-01-05",
    photoUrl: "https://i.pravatar.cc/150?u=alex.williams",
  },
  {
    id: "dir_4",
    email: "sarah.johnson@company.com",
    first_name: "Sarah",
    last_name: "Johnson",
    department: "Marketing",
    position: "Marketing Director",
    employeeId: "EMP004",
    manager: "alex.williams@company.com",
    location: "HQ, Floor 2",
    phoneNumber: "+1 (555) 456-7890",
    startDate: "2017-03-22",
    photoUrl: "https://i.pravatar.cc/150?u=sarah.johnson",
  },
  {
    id: "dir_5",
    email: "michael.brown@company.com",
    first_name: "Michael",
    last_name: "Brown",
    department: "Sales",
    position: "Sales Manager",
    employeeId: "EMP005",
    manager: "alex.williams@company.com",
    location: "HQ, Floor 1",
    phoneNumber: "+1 (555) 567-8901",
    startDate: "2019-07-18",
    photoUrl: "https://i.pravatar.cc/150?u=michael.brown",
  },
];

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "dept_1",
    name: "Engineering",
    headId: "dir_2",
    parentId: undefined,
    description: "Software development and infrastructure",
  },
  {
    id: "dept_2",
    name: "Marketing",
    headId: "dir_4",
    parentId: undefined,
    description: "Brand management and promotion",
  },
  {
    id: "dept_3",
    name: "Sales",
    headId: "dir_5",
    parentId: undefined,
    description: "Customer acquisition and relationship management",
  },
  {
    id: "dept_4",
    name: "Executive",
    headId: "dir_3",
    parentId: undefined,
    description: "Company leadership",
  },
  {
    id: "dept_5",
    name: "Frontend",
    headId: "dir_1",
    parentId: "dept_1",
    description: "User interface development",
  },
];

// Fetch users from directory
export const fetchDirectoryUsers = async (): Promise<DirectoryUser[]> => {
  // In a real app, this would call the company directory API
  console.log("[DIRECTORY] Fetching users from company directory");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return MOCK_DIRECTORY_USERS;
};

// Fetch departments from directory
export const fetchDepartments = async (): Promise<Department[]> => {
  // In a real app, this would call the company directory API
  console.log("[DIRECTORY] Fetching departments from company directory");
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return MOCK_DEPARTMENTS;
};

// Convert directory user to application user
export const convertDirectoryUserToAppUser = (directoryUser: DirectoryUser): User => {
  return new UserImpl({
    id: directoryUser.id,
    email: directoryUser.email,
    first_name: directoryUser.first_name,
    last_name: directoryUser.last_name,
    role: directoryUser.department === "Executive" ? "admin" : "user",
    department: directoryUser.department,
  });
};

// Sync users from directory
export const syncUsersFromDirectory = async (): Promise<{
  added: User[];
  updated: User[];
  total: number;
}> => {
  // In a real app, this would sync users from the company directory
  console.log("[DIRECTORY] Syncing users from company directory");
  
  // Fetch directory users
  const directoryUsers = await fetchDirectoryUsers();
  
  // Convert to app users
  const appUsers = directoryUsers.map(convertDirectoryUserToAppUser);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would compare with existing users and return differences
  return {
    added: appUsers.slice(0, 2), // Simulate 2 new users
    updated: appUsers.slice(2, 3), // Simulate 1 updated user
    total: appUsers.length,
  };
};

// Google SSO authentication
export const authenticateWithGoogle = async (token: string): Promise<User | null> => {
  // In a real app, this would validate the token with Google
  console.log(`[SSO] Authenticating with Google token: ${token.substring(0, 10)}...`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate a successful authentication
  return new UserImpl({
    id: "google_1",
    email: "user@company.com",
    first_name: "Company",
    last_name: "User",
    role: "user",
    department: "Marketing",
  });
};

// Check if email domain is allowed for SSO
export const isEmailDomainAllowed = (email: string, allowedDomains: string[]): boolean => {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

// Get Google SSO login URL
export const getGoogleSSOUrl = (): string => {
  // In a real app, this would generate an OAuth URL for Google SSO
  return 'https://accounts.google.com/o/oauth2/auth?client_id=MOCK_CLIENT_ID&redirect_uri=https://meetingmaster.app/sso/callback&scope=profile email&response_type=code';
};

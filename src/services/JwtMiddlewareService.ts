
import { supabase } from "@/integrations/supabase/client";

export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  [key: string]: any;
}

class JwtMiddlewareService {
  
  // Store the JWT token locally
  private jwtToken: string | null = null;
  
  // Initialize the service
  constructor() {
    this.initializeTokenWatcher();
  }
  
  // Watch for auth state changes
  private initializeTokenWatcher() {
    supabase.auth.onAuthStateChange((event, session) => {
      this.jwtToken = session?.access_token || null;
    });
  }
  
  // Get the current JWT token
  getToken(): string | null {
    return this.jwtToken;
  }
  
  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.jwtToken;
  }
  
  // Validate the token and get the claims
  async validateToken(): Promise<JwtClaims | null> {
    if (!this.jwtToken) {
      return null;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser(this.jwtToken);
      
      if (!user) {
        return null;
      }
      
      // Basic claims
      const claims: JwtClaims = {
        sub: user.id,
        email: user.email || '',
        role: 'user' // Default role
      };
      
      // Get user data from the database to get the role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        claims.role = userData.role;
      }
      
      // Get user role assignments
      const { data: roleAssignments } = await supabase
        .from('user_role_assignments')
        .select('role')
        .eq('user_id', user.id);
        
      if (roleAssignments && roleAssignments.length > 0) {
        claims.roles = roleAssignments.map(assignment => assignment.role);
      }
      
      // Get custom JWT claims from mappings
      const { data: customClaims } = await supabase
        .from('jwt_claim_mappings')
        .select('jwt_claim, directory_attribute')
        .eq('is_active', true);
      
      if (customClaims) {
        // In a real implementation, we would get the directory attributes
        // from the user's metadata or from a directory service
        // For demo purposes, we'll just use some dummy values
        customClaims.forEach(mapping => {
          claims[mapping.jwt_claim] = `value_for_${mapping.directory_attribute}`;
        });
      }
      
      return claims;
    } catch (error) {
      console.error('Error validating JWT token:', error);
      return null;
    }
  }
  
  // Check if the user has a specific role (using the new user_role_assignments table)
  async hasRole(role: string): Promise<boolean> {
    if (!this.jwtToken) {
      return false;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser(this.jwtToken);
      
      if (!user) {
        return false;
      }
      
      const { data, error } = await supabase.rpc('user_has_role', {
        user_id: user.id,
        role_name: role
      });
      
      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }
  
  // Check if user has at least one of the specified roles
  async hasAnyRole(roles: string[]): Promise<boolean> {
    for (const role of roles) {
      if (await this.hasRole(role)) {
        return true;
      }
    }
    return false;
  }
  
  // Check if user has all of the specified roles
  async hasAllRoles(roles: string[]): Promise<boolean> {
    for (const role of roles) {
      if (!(await this.hasRole(role))) {
        return false;
      }
    }
    return true;
  }
  
  // Secure fetch that includes the JWT token
  async secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.jwtToken) {
      throw new Error('No authentication token available');
    }
    
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.jwtToken}`);
    
    return fetch(url, {
      ...options,
      headers
    });
  }
  
  // Get user ID from token
  async getUserId(): Promise<string | null> {
    const claims = await this.validateToken();
    return claims?.sub || null;
  }
  
  // Check if a rate limit has been reached
  async checkRateLimit(endpoint: string, maxRequests: number = 100, windowSeconds: number = 60): Promise<boolean> {
    const userId = await this.getUserId();
    
    if (!userId) {
      return false;
    }
    
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        u_id: userId,
        endpoint,
        max_requests: maxRequests,
        window_seconds: windowSeconds
      });
      
      if (error) {
        console.error('Error checking rate limit:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return false;
    }
  }
}

// Export singleton instance
export const jwtMiddlewareService = new JwtMiddlewareService();

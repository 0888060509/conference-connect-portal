
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
  
  // Check if the user has a specific role
  async hasRole(role: string): Promise<boolean> {
    const claims = await this.validateToken();
    return claims?.role === role;
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
}

// Export singleton instance
export const jwtMiddlewareService = new JwtMiddlewareService();

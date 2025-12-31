import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios, { tokenManager } from "@/lib/api/axios";
import { AuthTokens, ChangePasswordData, ForgotPasswordData, RegisterData, ResetPasswordData } from "../types/auth.type";
import { User } from "@/features/users/types/user.types";
import { registerSchema } from "../schemas/auth.schema";

class AuthService {
  async login(username: string, password: string) {
    const data = { username, password };
    const res = await axios.post(`${API_ENDPOINTS.AUTH.LOGIN}`, data);
    // Store tokens and user
    const tokens = res.data as AuthTokens;
    const user = res.data.user;
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    tokenManager.setUser(user);
    return res.data;
  }
  
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate data
    const validated = registerSchema.parse(data);

    const response = await axios.post<{ user: User; tokens: AuthTokens }>(
      API_ENDPOINTS.AUTH.REGISTER,
      validated
    );

    const { user, tokens } = response.data;

    // Store tokens and user
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
    tokenManager.setUser(user);

    return response.data;
  }

  async logout() {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (refreshToken) {
        await axios.post(`${API_ENDPOINTS.AUTH.LOGOUT}`);
      }
    } finally {
      // Always clear tokens, even if request fails
      tokenManager.clearTokens();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await axios.get<User>(API_ENDPOINTS.AUTH.ME);
    
    // Update stored user
    tokenManager.setUser(response.data);
    
    return response.data;
  }

  async refreshToken(): Promise<AuthTokens> {
    const storedRefreshToken = tokenManager.getRefreshToken();

    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<{
      accessToken: string;
      refreshToken: string;
    }>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken: storedRefreshToken });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store new tokens
    tokenManager.setTokens(accessToken, newRefreshToken);

    return response.data;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }

  /**
   * Get stored user
   */
  getStoredUser(): AuthTokens | null {
    return tokenManager.getUser();
  }
}

export const authService = new AuthService();

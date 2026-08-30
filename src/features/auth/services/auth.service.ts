import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios, { tokenManager } from "@/lib/api/axios";
import { AccessTokenClaims, AuthTokens, AuthUser, ChangePasswordData, ForgotPasswordData, RegisterData, ResetPasswordData } from "../types/auth.type";
import { User } from "@/features/users/types/user.types";
import { registerSchema } from "../schemas/auth.schema";
import { decodeJwt } from "@/lib/utils/jwt";

function userFromAccessToken(accessToken: string): AuthUser | null {
  const claims = decodeJwt<AccessTokenClaims>(accessToken);
  if (!claims) return null;

  return {
    id: claims.sub,
    phone: claims.phone,
    role: claims.role,
    branches: claims.branches,
    employeeId: claims.empId,
  };
}

class AuthService {
  /**
   * POST /auth/login returns only { accessToken, refreshToken } - no user
   * object and no /auth/me endpoint exists, so the current user is derived
   * from the decoded access token instead.
   */
  async login(username: string, password: string): Promise<{ tokens: AuthTokens; user: AuthUser | null }> {
    const res = await axios.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    const tokens = res.data;
    const user = userFromAccessToken(tokens.accessToken);

    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return { tokens, user };
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

    const { tokens } = response.data;

    // Store tokens
    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return response.data;
  }

  async logout() {
    try {
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        // Backend's refresh-token passport strategy reads `refresh_token`
        // (snake_case) from the body while the validated DTO expects
        // `refreshToken` (camelCase) - send both until that's reconciled.
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {
          refreshToken,
          refresh_token: refreshToken,
        });
      }
    } finally {
      // Always clear tokens, even if request fails
      tokenManager.clearTokens();
    }
  }

  async refreshToken(): Promise<{ tokens: AuthTokens; user: AuthUser | null }> {
    const storedRefreshToken = tokenManager.getRefreshToken();

    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post<AuthTokens>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken: storedRefreshToken,
      refresh_token: storedRefreshToken,
    });

    const tokens = response.data;
    const user = userFromAccessToken(tokens.accessToken);

    tokenManager.setTokens(tokens.accessToken, tokens.refreshToken);

    return { tokens, user };
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    // Backend's ValidationPipe runs with forbidNonWhitelisted: true - only
    // send the fields it actually expects, not the client-only confirmPassword.
    const { currentPassword, newPassword } = data;
    await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
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
   * Derive the current user from the stored access token (no persisted user object).
   */
  getStoredUser(): AuthUser | null {
    const accessToken = tokenManager.getAccessToken();
    return accessToken ? userFromAccessToken(accessToken) : null;
  }
}

export const authService = new AuthService();

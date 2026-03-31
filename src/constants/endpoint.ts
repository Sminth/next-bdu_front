export enum AuthEndpoints {
  LOGIN = "/auth/login",
  LOGOUT = "/auth/logout",
  REGISTER = "/auth/register",
  AUTH_LOGOUT = "/auth/logout",
  AUTH_ME = "/auth/me",
  REFRESH_TOKEN = "/auth/refresh-token",
  RESET_LINK = "/auth/reset-password",
  PASSWORD_RESET = "/auth/password-reset",
  CHANGE_PASSWORD = "/auth/change-password",
}

export enum UserEndpoint {
  PROFILE = "/user/profile",
  UPDATE = "/user/update",
  DELETE = "/user/delete",
}

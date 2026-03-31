export type LoginPayload = {
  email: string;
  password: string;
};

export type AdminUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  role: string;
  permissions: string[];
  profile?: { id: string; name: string } | null;
  direction?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginSuccessResponse = {
  access_token: string;
  refresh_token: string;
  user: AdminUser;
};

export type LoginErrorResponse = {
  success: false;
  message: string;
};

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export type GetMeResponse = AdminUser;

export type RefreshTokenSuccessResponse = {
  success: true;
  token: string;
  refresh_token: string;
};

export type RefreshTokenErrorResponse = {
  success: false;
  message: string;
};

export type RefreshTokenResponse =
  | RefreshTokenSuccessResponse
  | RefreshTokenErrorResponse;

export interface SendPasswordResetLinkRequest {
  email: string;
}

export interface SendPasswordResetLinkSuccessResponse {
  success: true;
  message: "Lien de réinitialisation envoyé par email.";
}

export interface SendPasswordResetLinkErrorResponse {
  success: true;
  message: "Lien de réinitialisation généré (erreur d'envoi email).";
  reset_url: string;
  error: string;
}

export interface SendPasswordResetLinkValidationErrorResponse {
  success: false;
  message: string;
}

export type SendPasswordResetLinkResponse =
  | SendPasswordResetLinkSuccessResponse
  | SendPasswordResetLinkErrorResponse
  | SendPasswordResetLinkValidationErrorResponse;

export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordSuccessResponse {
  success: true;
  message: "Réinitialisation du mot de passe réussie.";
}

export interface ResetPasswordTokenErrorResponse {
  success: false;
  message: "Token invalide ou expiré." | "Token expiré.";
}

export interface ResetPasswordUserErrorResponse {
  success: false;
  message: "Utilisateur introuvable.";
}

export interface ResetPasswordValidationErrorResponse {
  success: false;
  message: string;
}

export type ResetPasswordResponse =
  | ResetPasswordSuccessResponse
  | ResetPasswordTokenErrorResponse
  | ResetPasswordUserErrorResponse
  | ResetPasswordValidationErrorResponse;

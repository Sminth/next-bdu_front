export type UserSession = {
  id: string;
  userId: string;
  userEmail: string;
  user?: { firstName?: string | null; lastName?: string | null };
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceType?: string | null;
  browserName?: string | null;
  browserVersion?: string | null;
  osName?: string | null;
  loginAt: string;
  logoutAt?: string | null;
};

export type UserSessionResponse = {
  data: UserSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

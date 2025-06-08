export type GoogleAuth = {
  email: string;
  provider: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
};

export type RequestGoogle = {
  req: { user: GoogleAuth };
};

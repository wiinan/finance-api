export type GoogleAuth = {
  email: string;
  provider: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
  password: string;
};

export type RequestGoogle = {
  req: { user: GoogleAuth };
};

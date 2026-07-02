export interface MessageResponse {
  message: string;
}

export interface Session {
  jti:       string;
  device:    string;
  ip:        string | null;
  createdAt: string | null;
  current:   boolean;
}
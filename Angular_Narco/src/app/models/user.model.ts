export interface User {
  id?: number;
  username: string;
  password: string;
  adresse: string;
  role?: string;
  codeCb: string;
  ccvCb: string;
  expiryDate: string;
}

export interface JsonWebToken {
  username: string;
  sub: string;
  iat: number;
  exp: number;
}

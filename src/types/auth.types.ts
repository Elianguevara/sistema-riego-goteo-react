// Contenido de src/types/auth.types.ts

export interface AuthResponse {
  token: string;
  tokenType: string;
}
export interface DecodedToken {
  sub: string;    // Subject (el username)
  rol: string;    // Nuestro claim de rol
  exp: number;    // Expiration time
  iat: number;    // Issued at
}
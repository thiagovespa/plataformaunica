import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "plataforma-unica-secret-2024"

export interface JWTPayload {
  username: string
  iat: number
  exp: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null
  }

  return parts[1]
}

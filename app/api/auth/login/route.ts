import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "plataforma-unica-secret-2024"
const VALID_CREDENTIALS = {
  username: "admin",
  password: "plataforma2024",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validar credenciais
    if (!username || !password) {
      return NextResponse.json({ error: "Username e password são obrigatórios" }, { status: 400 })
    }

    if (username !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Gerar JWT token
    const token = jwt.sign(
      {
        username,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: "24h" }, // Token expira em 24 horas
    )

    return NextResponse.json({
      success: true,
      token,
      expiresIn: "24h",
      message: "Login realizado com sucesso",
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

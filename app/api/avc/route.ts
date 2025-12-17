import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt"

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return false
  }

  const payload = verifyToken(token)
  return payload !== null
}

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Não autorizado", message: "Token inválido ou expirado" }, { status: 401 })
  }

  try {
    // Buscar dados do localStorage (simulação)
    // Em produção, estes dados viriam de um banco de dados
    const searchParams = request.nextUrl.searchParams
    const credorCodigo = searchParams.get("credorCodigo")

    // Retornar dados mockados para demonstração
    // Na implementação real, estes dados viriam do banco de dados
    const avcData = {
      metadata: {
        dataConsulta: new Date().toISOString(),
        totalCredores: 0,
        valorTotal: 0,
      },
      credores: [] as Array<{
        credorCodigo: string
        credorNome: string
        credorCnpj: string
        pagadores: Array<{
          pagadorCodigo: string
          pagadorNome: string
          valor: number
        }>
        total: number
      }>,
    }

    // Se foi filtrado por código específico
    if (credorCodigo) {
      avcData.metadata.totalCredores = avcData.credores.filter((c) => c.credorCodigo === credorCodigo).length
    } else {
      avcData.metadata.totalCredores = avcData.credores.length
    }

    avcData.metadata.valorTotal = avcData.credores.reduce((sum, c) => sum + c.total, 0)

    return NextResponse.json({
      success: true,
      data: avcData,
      message: "Relatório AVC consultado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao consultar AVC:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Não foi possível processar a consulta",
      },
      { status: 500 },
    )
  }
}

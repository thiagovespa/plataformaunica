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
    const pagadorCodigo = searchParams.get("pagadorCodigo")

    // Retornar dados mockados para demonstração
    // Na implementação real, estes dados viriam do banco de dados
    const avdData = {
      metadata: {
        dataConsulta: new Date().toISOString(),
        totalPagadores: 0,
        valorTotal: 0,
      },
      pagadores: [] as Array<{
        pagadorCodigo: string
        pagadorNome: string
        pagadorCnpj: string
        credores: Array<{
          credorCodigo: string
          credorNome: string
          valor: number
        }>
        total: number
      }>,
    }

    // Se foi filtrado por código específico
    if (pagadorCodigo) {
      avdData.metadata.totalPagadores = avdData.pagadores.filter((p) => p.pagadorCodigo === pagadorCodigo).length
    } else {
      avdData.metadata.totalPagadores = avdData.pagadores.length
    }

    avdData.metadata.valorTotal = avdData.pagadores.reduce((sum, p) => sum + p.total, 0)

    return NextResponse.json({
      success: true,
      data: avdData,
      message: "Relatório AVD consultado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao consultar AVD:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Não foi possível processar a consulta",
      },
      { status: 500 },
    )
  }
}

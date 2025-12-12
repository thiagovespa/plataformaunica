import { type NextRequest, NextResponse } from "next/server"

// Interface para validação do corpo da requisição
interface NovoPagamentoRequest {
  codigo: string
  data: string // formato: DD/MM/YYYY
  pagador: string
  cnpj: string
  valor: number
  canal: string
  banco: string
  identificacao: string
  formaPagamento: "pix" | "ted" | "boleto" | "transferencia"
  observacao?: string
  // Informações do credor (obrigatórias)
  credorCodigo: string
  credorNome: string
  credorDocumento: string
  credorFormaRecebimento: string
}

// Função auxiliar para validar CNPJ (formato básico)
function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "")
  return cnpjLimpo.length === 14
}

// Função auxiliar para validar data (DD/MM/YYYY)
function validarData(data: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!regex.test(data)) return false

  const [dia, mes, ano] = data.split("/").map(Number)
  const dataObj = new Date(ano, mes - 1, dia)

  return dataObj.getFullYear() === ano && dataObj.getMonth() === mes - 1 && dataObj.getDate() === dia
}

export async function POST(request: NextRequest) {
  try {
    const body: NovoPagamentoRequest = await request.json()

    // Validações
    const erros: string[] = []

    if (!body.codigo || body.codigo.trim() === "") {
      erros.push("Campo 'codigo' é obrigatório")
    }

    if (!body.data || !validarData(body.data)) {
      erros.push("Campo 'data' é obrigatório e deve estar no formato DD/MM/YYYY")
    }

    if (!body.pagador || body.pagador.trim() === "") {
      erros.push("Campo 'pagador' é obrigatório")
    }

    if (!body.cnpj || !validarCNPJ(body.cnpj)) {
      erros.push("Campo 'cnpj' é obrigatório e deve ter 14 dígitos")
    }

    if (typeof body.valor !== "number" || body.valor <= 0) {
      erros.push("Campo 'valor' é obrigatório e deve ser maior que zero")
    }

    if (!body.canal || body.canal.trim() === "") {
      erros.push("Campo 'canal' é obrigatório")
    }

    if (!body.banco || body.banco.trim() === "") {
      erros.push("Campo 'banco' é obrigatório")
    }

    if (!body.identificacao || body.identificacao.trim() === "") {
      erros.push("Campo 'identificacao' é obrigatório")
    }

    if (!["pix", "ted", "boleto", "transferencia"].includes(body.formaPagamento)) {
      erros.push("Campo 'formaPagamento' deve ser: pix, ted, boleto ou transferencia")
    }

    // Validações para credor fields
    if (!body.credorCodigo || body.credorCodigo.trim() === "") {
      erros.push("Campo 'credorCodigo' é obrigatório")
    }

    if (!body.credorNome || body.credorNome.trim() === "") {
      erros.push("Campo 'credorNome' é obrigatório")
    }

    if (!body.credorDocumento || body.credorDocumento.trim() === "") {
      erros.push("Campo 'credorDocumento' é obrigatório")
    }

    if (!body.credorFormaRecebimento || body.credorFormaRecebimento.trim() === "") {
      erros.push("Campo 'credorFormaRecebimento' é obrigatório")
    }

    if (erros.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Erro de validação",
          errors: erros,
        },
        { status: 400 },
      )
    }

    // Criar objeto de pagamento com informações do credor
    const novoPagamento = {
      id: `PAG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      codigo: body.codigo,
      data: body.data,
      pagador: body.pagador,
      cnpj: body.cnpj.replace(/\D/g, ""),
      valor: body.valor,
      valorEsperado: body.valor,
      canal: body.canal,
      banco: body.banco,
      identificacao: body.identificacao,
      status: "excecao" as const,
      tipo: "igual" as const,
      observacao: body.observacao || "Pagamento inserido via API",
      origem: "api" as const,
      formaPagamento: body.formaPagamento,
      // Informações do credor
      credor: {
        codigo: body.credorCodigo,
        nome: body.credorNome,
        documento: body.credorDocumento,
        formaRecebimento: body.credorFormaRecebimento,
      },
    }

    // TODO: Aqui você integraria com banco de dados ou estado global
    // Por enquanto, retornamos sucesso com o objeto criado
    console.log("[v0] Novo pagamento recebido via API:", novoPagamento)

    return NextResponse.json(
      {
        success: true,
        message: "Pagamento criado com sucesso",
        data: novoPagamento,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Erro ao processar pagamento:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar requisição",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Endpoint GET para listar pagamentos (futuro)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: "Endpoint GET não implementado ainda. Use POST para criar pagamentos.",
    },
    { status: 501 },
  )
}

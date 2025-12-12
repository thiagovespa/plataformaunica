"use client"

import { Checkbox } from "@/components/ui/checkbox"

import { DialogFooter } from "@/components/ui/dialog"

import React from "react"

import { TableHead } from "@/components/ui/table"

// Removed duplicate import of React
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  FileText,
  Upload,
  Check,
  Search,
  Users,
  Eye,
  X,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Download,
  CheckCircle,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

import type { MAPALiquidacao, Pagador } from "@/components/administracao" // Fixed import name from MAPALiquidacao to MapaLiquidacao

interface CredorBase {
  id: string
  codigo: string
  agente: string
  nome: string
  cnpj: string
  documento?: string // Added document field for flexibility
  banco: string
  agenciaBanco: string
  conta: string
  formaPix: string
  chavePix: string
  formaTed: string
  formaBoleto: string
}

interface PagamentoDetalhes {
  id: string
  titulo: string
  numeroONS: string
  transmissora: string
  valor: number
  dataEmissao: string
  dataVencimento: string
  dataPagamento: string
  formaPagamento: "pix" | "ted" | "boleto" | "transferencia" | "" // Changed type to include "transferencia"
  pagamentoParcialValor: number
  dataPagamentoParcial: string
  valorFaltante: number
  jurosMulta: number
  valorFinal: number
  dataPagamentoRestante: string
  tratativas: Tratativa[]
  anexos: Anexo[]
  // Dados bancários para TED
  banco: string
  agencia: string
  conta: string
  tipoConta: string
  favorecido: string
  cnpjFavorecido: string
  // Dados para PIX
  chavePix: string
  tipoChavePix: string
  // Dados para Boleto
  codigoBarras: string
  linhaDigitavel: string
  status: "conciliado" | "divergente" | "excecao" | "duplicado"
  // Added type for status, if it's expected to be set in details
  tipo?:
    | "igual"
    | "maior"
    | "menor"
    | "fracionado"
    | "antecipado"
    | "atrasado"
    | "identificacao_incorreta"
    | "canal_diferente"
    | "valor_maior"
    | "valor_menor"
    | "duplicado"
}

interface Tratativa {
  id: string
  data: string
  descricao: string
  usuario: string
}

interface Anexo {
  id: string
  nome: string
  tipo: string
  tamanho: string
  dataUpload: string
}

interface Pagamento {
  id: string
  codigo: string // Added codigo field
  data: string
  pagador: string
  cnpj: string
  valor: number
  valorEsperado: number
  canal: string
  banco: string
  identificacao: string
  status: "conciliado" | "divergente" | "excecao" | "duplicado" | "atrasado" | "antecipado"
  tipo:
    | "igual"
    | "maior"
    | "menor"
    | "fracionado"
    | "antecipado"
    | "atrasado"
    | "identificacao_incorreta"
    | "canal_diferente"
    | "valor_maior" // Added for consistency with auto reconciliation logic
    | "valor_menor" // Added for consistency with auto reconciliation logic
    | "duplicado" // Added duplicado type
  observacao?: string
  detalhes?: PagamentoDetalhes
  origem: "manual" | "importacao" | "api" | "sincronismo"
  formaPagamento: "pix" | "ted" | "boleto" | "transferencia" | "" // Changed type to include "transferencia"
  valorRecebido?: number // Added for compatibility with import preview
  // Adding fields for manual reconciliation
  codigoPagador?: string // The code of the pagador from MapaLiquidacao
  numeroONS?: string // From NumeroONS in details or input
  valorConciliado?: number // Added for tracking reconciled value
}

interface AuditoriaEvento {
  id: string
  timestamp: string
  usuario: string
  acao:
    | "importacao"
    | "conciliacao_manual"
    | "conciliacao_automatica"
    | "exclusao"
    | "criacao_manual"
    | "edicao"
    | "analise_excecao"
  descricao: string
  pagamentoId?: string
  detalhes?: {
    valorAnterior?: number
    valorNovo?: number
    statusAnterior?: string
    statusNovo?: string
    cnpj?: string
    codigo?: string
    [key: string]: any
  }
}

const formatToBrazilian = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00"
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const parseBrazilianNumber = (value: string): number => {
  if (!value) return 0
  const cleaned = value.replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

const formatDateToBrazilian = (dateStr: string): string => {
  if (!dateStr) return ""
  const [year, month, day] = dateStr.split("-")
  if (!year || !month || !day) return dateStr
  return `${day}/${month}/${year}`
}

const DateInputBrazilian = ({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (isoDate: string) => void
  className?: string
}) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const selectedDate = value ? new Date(value + "T00:00:00") : undefined
  const isValidDate = selectedDate && !isNaN(selectedDate.getTime())

  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00")
      if (!isNaN(date.getTime())) {
        setInputValue(format(date, "dd/MM/yyyy"))
      } else {
        setInputValue("")
      }
    } else {
      setInputValue("")
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date && !isNaN(date.getTime())) {
      const isoDate = format(date, "yyyy-MM-dd")
      onChange(isoDate)
      setInputValue(format(date, "dd/MM/yyyy"))
    }
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "")
    if (input.length > 8) input = input.slice(0, 8)

    let formatted = ""
    if (input.length > 0) {
      formatted = input.slice(0, 2)
      if (input.length > 2) {
        formatted += "/" + input.slice(2, 4)
        if (input.length > 4) {
          formatted += "/" + input.slice(4, 8)
        }
      }
    }

    setInputValue(formatted)

    if (input.length === 8) {
      const day = Number.parseInt(input.slice(0, 2))
      const month = Number.parseInt(input.slice(2, 4))
      const year = Number.parseInt(input.slice(4, 8))

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const isoDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
        onChange(isoDate)
      }
    }
  }

  return (
    <div className={cn("flex gap-1", className)}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="dd/mm/aaaa"
        className="flex-1"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" type="button">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate ? selectedDate : undefined}
            onSelect={handleSelect}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const getFormaPagamentoBadge = (forma: "pix" | "ted" | "boleto" | "transferencia" | "" | undefined) => {
  switch (forma) {
    case "pix":
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">PIX</Badge>
    case "ted":
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">TED</Badge>
    case "boleto":
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Boleto</Badge>
    case "transferencia":
      return <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">Transferência</Badge>
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          -
        </Badge>
      )
  }
}

// Dentro de pagamentosExemplo, adicionar formaPagamento a cada exemplo:
const pagamentosExemplo: Pagamento[] = [
  {
    id: "1",
    codigo: "", // Example empty value
    data: "2024-01-15",
    pagador: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    valor: 15000,
    valorEsperado: 15000,
    canal: "TED",
    banco: "Banco do Brasil",
    identificacao: "TED-001",
    status: "conciliado",
    tipo: "igual",
    observacao: "Pagamento recebido conforme esperado",
    origem: "importacao",
    formaPagamento: "ted", //
  },
  {
    id: "2",
    codigo: "", // Example empty value
    data: "2024-01-14",
    pagador: "Indústria XYZ S.A.",
    cnpj: "98.765.432/0001-10",
    valor: 25500,
    valorEsperado: 25000,
    canal: "PIX",
    banco: "Itaú",
    identificacao: "PIX-002",
    status: "divergente",
    tipo: "maior",
    observacao: "Valor recebido maior que o esperado",
    origem: "manual",
    formaPagamento: "pix", //
  },
  {
    id: "3",
    codigo: "", // Example empty value
    data: "2024-01-13",
    pagador: "Comércio 123 ME",
    cnpj: "11.222.333/0001-44",
    valor: 8000,
    valorEsperado: 10000,
    canal: "Boleto",
    banco: "Bradesco",
    identificacao: "BOL-003",
    status: "divergente",
    tipo: "menor",
    observacao: "Valor recebido menor que o esperado",
    origem: "api",
    formaPagamento: "boleto", //
  },
  {
    id: "4",
    codigo: "", // Example empty value
    data: "2024-01-12",
    pagador: "Serviços Rápidos Eireli",
    cnpj: "55.666.777/0001-88",
    valor: 5000,
    valorEsperado: 0,
    canal: "PIX",
    banco: "Santander",
    identificacao: "",
    status: "excecao",
    tipo: "identificacao_incorreta",
    observacao: "Identificação do pagador não encontrada",
    origem: "sincronismo",
    formaPagamento: "pix", //
  },
  // Original example data for completeness, ensuring it also has formaPagamento
  {
    id: "1",
    codigo: "COD-001", // Example value
    data: "2024-01-15 10:30",
    pagador: "Fornecedor Alpha",
    cnpj: "12.345.678/0001-90",
    valor: 100000,
    valorEsperado: 100000,
    canal: "PIX",
    banco: "Banco do Brasil",
    identificacao: "CORRETA",
    status: "conciliado",
    tipo: "igual",
    observacao: "Pagamento recebido conforme esperado",
    origem: "api",
    formaPagamento: "pix", // Assuming PIX for this example
    detalhes: {
      id: "1",
      titulo: "Fatura de Energia - Janeiro/2024",
      numeroONS: "ONS-2024-001234",
      transmissora: "Transmissora Norte S.A.",
      valor: 100000,
      dataEmissao: "2024-01-01",
      dataVencimento: "2024-01-15",
      dataPagamento: "2024-01-15",
      formaPagamento: "pix", // This should match the main Pagamento interface
      pagamentoParcialValor: 0,
      dataPagamentoParcial: "",
      valorFaltante: 0,
      jurosMulta: 0,
      valorFinal: 100000,
      dataPagamentoRestante: "",
      tratativas: [
        { id: "1", data: "2024-01-15 10:30", descricao: "Pagamento recebido via PIX", usuario: "Sistema" },
        { id: "2", data: "2024-01-15 10:31", descricao: "Conciliação automática realizada", usuario: "Sistema" },
      ],
      anexos: [
        { id: "1", nome: "comprovante_pix.pdf", tipo: "application/pdf", tamanho: "125 KB", dataUpload: "2024-01-15" },
      ],
      banco: "",
      agencia: "",
      conta: "",
      tipoConta: "",
      favorecido: "",
      cnpjFavorecido: "",
      chavePix: "12345678000190",
      tipoChavePix: "CNPJ",
      codigoBarras: "",
      linhaDigitavel: "",
      status: "conciliado", // Added status
    },
  },
  {
    id: "2",
    codigo: "COD-002", // Example value
    data: "2024-01-15 11:45",
    pagador: "Prestador Beta",
    cnpj: "23.456.789/0001-12",
    valor: 50000,
    valorEsperado: 75000,
    canal: "TED",
    banco: "Itaú",
    identificacao: "PARCIAL",
    status: "divergente",
    tipo: "menor",
    observacao: "Pagamento menor que o esperado - possível parcelamento",
    origem: "sincronismo",
    formaPagamento: "ted", // Assuming TED for this example
    detalhes: {
      id: "2",
      titulo: "Fatura de Transmission - Janeiro/2024",
      numeroONS: "ONS-2024-001235",
      transmissora: "Transmissora Sul S.A.",
      valor: 75000,
      dataEmissao: "2024-01-02",
      dataVencimento: "2024-01-15",
      dataPagamento: "",
      formaPagamento: "ted", // This should match the main Pagamento interface
      pagamentoParcialValor: 50000,
      dataPagamentoParcial: "2024-01-15",
      valorFaltante: 25000,
      jurosMulta: 0,
      valorFinal: 75000,
      dataPagamentoRestante: "",
      tratativas: [
        { id: "1", data: "2024-01-15 11:45", descricao: "Pagamento parcial recebido via TED", usuario: "Sistema" },
        {
          id: "2",
          data: "2024-01-15 14:00",
          descricao: "Aguardando pagamento do valor restante",
          usuario: "Maria Silva",
        },
      ],
      anexos: [],
      banco: "Itaú",
      agencia: "1234",
      conta: "56789-0",
      tipoConta: "Corrente",
      favorecido: "Transmissora Sul S.A.",
      cnpjFavorecido: "23.456.789/0001-12",
      chavePix: "",
      tipoChavePix: "",
      codigoBarras: "",
      linhaDigitavel: "",
      status: "divergente", // Added status
    },
  },
  {
    id: "3",
    codigo: "COD-003", // Example value
    data: "2024-01-15 14:20",
    pagador: "Empresa Gamma",
    cnpj: "34.567.890/0001-34",
    valor: 125000,
    valorEsperado: 120000,
    canal: "PIX",
    banco: "Santander",
    identificacao: "CORRETA",
    status: "divergente",
    tipo: "maior",
    observacao: "Pagamento maior - possível inclusão de juros ou multa",
    origem: "api",
    formaPagamento: "pix", // Assuming PIX
  },
  {
    id: "4",
    codigo: "COD-004", // Example value
    data: "2024-01-14 09:15",
    pagador: "Serviços Delta",
    cnpj: "45.678.901/0001-56",
    valor: 55000,
    valorEsperado: 55000,
    canal: "PIX",
    banco: "Bradesco",
    identificacao: "CORRETA",
    status: "conciliado",
    tipo: "antecipado",
    observacao: "Pagamento antecipado em 1 dia",
    origem: "sincronismo",
    formaPagamento: "pix", // Assuming PIX
  },
  {
    id: "5",
    codigo: "COD-005", // Example value
    data: "2024-01-15 16:30",
    pagador: "Indústria Epsilon",
    cnpj: "56.789.012/0001-78",
    valor: 30000,
    valorEsperado: 100000,
    canal: "TED",
    banco: "Caixa",
    identificacao: "FRAÇÃO 1/3",
    status: "excecao",
    tipo: "fracionado",
    observacao: "Primeira parcela de 3 - acompanhar próximos pagamentos",
    origem: "importacao",
    formaPagamento: "ted", // Assuming TED
    detalhes: {
      id: "5",
      titulo: "Fatura de Energia - Janeiro/2024",
      numeroONS: "ONS-2024-001238",
      transmissora: "Transmissora Centro S.A.",
      valor: 100000,
      dataEmissao: "2024-01-05",
      dataVencimento: "2024-01-20",
      dataPagamento: "",
      formaPagamento: "boleto", // This should match the main Pagamento interface
      pagamentoParcialValor: 30000,
      dataPagamentoParcial: "2024-01-15",
      valorFaltante: 70000,
      jurosMulta: 1500,
      valorFinal: 101500,
      dataPagamentoRestante: "",
      tratativas: [
        { id: "1", data: "2024-01-15 16:30", descricao: "Primeira parcela recebida (1/3)", usuario: "Sistema" },
        {
          id: "2",
          data: "2024-01-16 09:00",
          descricao: "Contato realizado com cliente sobre parcelamento",
          usuario: "João Santos",
        },
        {
          id: "3",
          data: "2024-01-16 14:30",
          descricao: "Cliente confirmou pagamento das demais parcelas até dia 25",
          usuario: "João Santos",
        },
      ],
      anexos: [
        { id: "1", nome: "boleto_parcela1.pdf", tipo: "application/pdf", tamanho: "89 KB", dataUpload: "2024-01-15" },
        { id: "2", nome: "email_cliente.pdf", tipo: "application/pdf", tamanho: "45 KB", dataUpload: "2024-01-16" },
      ],
      banco: "Caixa Econômica Federal",
      agencia: "0001",
      conta: "12345-6",
      tipoConta: "Corrente",
      favorecido: "Transmissora Centro S.A.",
      cnpjFavorecido: "56.789.012/0001-78",
      codigoBarras: "23793.38128 60000.000003 00000.000409 1 84340000030000",
      linhaDigitavel: "23793381286000000000300000004091843400000300000",
      status: "excecao", // Added status
    },
  },
  {
    id: "6",
    codigo: "COD-006", // Example value
    data: "2024-01-15 17:00",
    pagador: "Smart Solutions",
    cnpj: "67.890.123/0001-90",
    valor: 45000,
    valorEsperado: 45000,
    canal: "TED",
    banco: "Banco Inter",
    identificacao: "INCORRETA",
    status: "excecao",
    tipo: "identificacao_incorreta",
    observacao: "Identificação do pagador não corresponde ao cadastro",
    origem: "manual",
    formaPagamento: "ted", // Assuming TED
  },
  {
    id: "7",
    codigo: "COD-007", // Example value
    data: "2024-01-16 10:00",
    pagador: "Global Trading",
    cnpj: "78.901.234/0001-12",
    valor: 80000,
    valorEsperado: 80000,
    canal: "PIX",
    banco: "Nubank",
    identificacao: "CORRETA",
    status: "divergente",
    tipo: "atrasado",
    observacao: "Pagamento com 2 dias de atraso",
    origem: "api",
    formaPagamento: "pix", // Assuming PIX
  },
  {
    id: "8",
    codigo: "COD-008", // Example value
    data: "2024-01-15 13:30",
    pagador: "Smart Industries",
    cnpj: "89.012.345/0001-34",
    valor: 60000,
    valorEsperado: 60000,
    canal: "Boleto",
    banco: "Banco Original",
    identificacao: "CORRETA",
    status: "excecao",
    tipo: "canal_diferente",
    observacao: "Esperado via PIX, recebido via Boleto",
    origem: "importacao",
    formaPagamento: "boleto", // Assuming Boleto
  },
]

interface Props {
  credoresBase: CredorBase[]
  mapaLiquidacao: MAPALiquidacao[]
  pagadores: Pagador[]
  dataReferenciaMapa?: Date
  onEstatisticasChange?: (estatisticas: {
    totalPagamentos: number
    conciliados: number
    divergentes: number
    excecoes: number
  }) => void
}

type ConciliadorInteligenteProps = Props

export function ConciliadorInteligente({
  credoresBase = [],
  mapaLiquidacao = [],
  pagadores = [],
  dataReferenciaMapa,
  onEstatisticasChange,
}: ConciliadorInteligenteProps) {
  console.log("[v0] ConciliadorInteligente rendering, credores:", credoresBase?.length, "pagadores:", pagadores?.length)

  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosExemplo)
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "conciliado" | "divergente" | "excecao" | "duplicado" | "atrasado" | "antecipado"
  >("todos")
  const [filtroOrigem, setFiltroOrigem] = useState<"todos" | "manual" | "importacao" | "api" | "sincronismo">("todos")
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [filtroPagador, setFiltroPagador] = useState("")

  const [filtroExcecaoTipo, setFiltroExcecaoTipo] = useState<
    | "todos"
    | "maior"
    | "menor"
    | "fracionado"
    | "identificacao_incorreta"
    | "valor_maior"
    | "valor_menor"
    | "duplicado"
    | "antecipado"
    | "atrasado" // Added "duplicado", "antecipado", "atrasado"
  >("todos")
  const [filtroExcecaoOrigem, setFiltroExcecaoOrigem] = useState<
    "todos" | "manual" | "importacao" | "api" | "sincronismo"
  >("todos")

  const [showDetalhes, setShowDetalhes] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [detalhesEditados, setDetalhesEditados] = useState<PagamentoDetalhes | null>(null)
  const [novaTratativa, setNovaTratativa] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [buscaCredor, setBuscaCredor] = useState("")
  const [credorSelecionado, setCredorSelecionado] = useState<CredorBase | null>(null)

  const [mostrarValoresPagador, setMostrarValoresPagador] = useState(true)
  const [pagamentoParaRemover, setPagamentoParaRemover] = useState<string | null>(null)
  const [showRemoverTodos, setShowRemoverTodos] = useState(false)

  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [showRelatorio, setShowRelatorio] = useState(false)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Pagamento | null>(null)

  const [showNovoPagamento, setShowNovoPagamento] = useState(false)
  // State for new manual payment form
  const [novoPagamentoFormData, setNovoPagamentoFormData] = useState({
    codigo: "",
    data: "",
    cnpj: "",
    valorFormatado: "", // For currency input display
    valorEsperado: 0, // Added valorEsperado field for input
    formaPagamento: "" as "pix" | "ted" | "boleto" | "transferencia" | "",
  })

  const [showImportarArquivo, setShowImportarArquivo] = useState(false)
  const [arquivoImportado, setArquivoImportado] = useState<File | null>(null) // Corresponds to arquivoSelecionado
  const [tipoArquivo, setTipoArquivo] = useState<"cnab240" | "cnab400" | "ofx" | "csv">("cnab240")
  const [importacaoPreview, setImportacaoPreview] = useState<Pagamento[]>([])
  const importFileRef = useRef<HTMLInputElement>(null)
  const [nomeArquivoSelecionado, setNomeArquivoSelecionado] = useState<string>("")

  const [linhasExpandidas, setLinhasExpandidas] = useState<Set<string>>(new Set())

  const toggleLinhaExpandida = (codigo: string) => {
    setLinhasExpandidas((prev) => {
      const novo = new Set(prev)
      if (novo.has(codigo)) {
        novo.delete(codigo)
      } else {
        novo.add(codigo)
      }
      return novo
    })
  }

  const [calendarNovoPagamentoOpen, setCalendarNovoPagamentoOpen] = useState(false)

  // Estados do formulário de novo pagamento
  const [expandedPagadores, setExpandedPagadores] = useState<Set<string>>(new Set())

  const [showConciliarModal, setShowConciliarModal] = useState(false)
  const [pagamentoConciliar, setPagamentoConciliar] = useState<Pagamento | null>(null)
  const [conciliarSelecionados, setConciliarSelecionados] = useState<
    Array<{
      codigo: string
      cnpj: string
      razaoSocial: string
      valorOriginal: number
      valorAssociado: number
      selecionado: boolean
    }>
  >([])
  const [conciliarTipo, setConciliarTipo] = useState<Pagamento["tipo"]>("igual")

  const [auditoriaEventos, setAuditoriaEventos] = useState<AuditoriaEvento[]>([])
  const [showAuditoria, setShowAuditoria] = useState(false)

  const adicionarEventoAuditoria = (
    acao: AuditoriaEvento["acao"],
    descricao: string,
    pagamentoId?: string,
    detalhes?: AuditoriaEvento["detalhes"],
  ) => {
    const novoEvento: AuditoriaEvento = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      usuario: "Usuário Atual", // In a real app, this would come from auth context
      acao,
      descricao,
      pagamentoId,
      detalhes,
    }
    setAuditoriaEventos((prev) => [novoEvento, ...prev])
  }

  const abrirConciliarModal = (pagamento: Pagamento) => {
    setPagamentoConciliar(pagamento)

    // Buscar os pagadores do mapa de liquidação para o credor selecionado
    const pagadoresDisponiveis = credorSelecionado
      ? mapaLiquidacao
          .filter((m) => {
            const credorCodigo = m.credorCodigo?.split(/\s*[-–]\s*/)[0].trim()
            return credorCodigo === credorSelecionado.codigo
          })
          .map((m) => {
            const codigoPagadorCompleto = m.pagadorCodigo || ""
            const codigoPagador = codigoPagadorCompleto.split(/\s*[-–]\s*/)[0].trim()
            const nomePagadorMapa = codigoPagadorCompleto.split(/\s*[-–]\s*/)[1]?.trim() || "-"
            const pagadorCadastro = pagadores.find((p) => p.codigo === codigoPagador)
            const cnpj = pagadorCadastro?.cnpj || ""
            const razaoSocial = pagadorCadastro?.razaoSocial || pagadorCadastro?.agente || nomePagadorMapa

            return {
              codigo: codigoPagador,
              cnpj: cnpj,
              razaoSocial: razaoSocial,
              valorOriginal: m.valor || 0,
              valorAssociado: 0,
              selecionado: false,
            }
          })
          .filter((item, index, self) => index === self.findIndex((t) => t.codigo === item.codigo))
      : []

    // Marcar como selecionado se o CNPJ E código do pagamento coincidir
    const cnpjPagamentoLimpo = pagamento.cnpj?.replace(/\D/g, "") || ""
    const codigoPagamento = pagamento.codigo || pagamento.numeroONS || "" // Use Pagamento.codigo or NumeroONS

    const pagadoresComSelecao = pagadoresDisponiveis.map((p) => {
      const cnpjLimpo = p.cnpj?.replace(/\D/g, "") || ""

      // Match por CNPJ E código (ambos devem coincidir)
      const cnpjMatch = cnpjLimpo && cnpjPagamentoLimpo && cnpjLimpo === cnpjPagamentoLimpo
      const codigoMatch = codigoPagamento && p.codigo && p.codigo === codigoPagamento

      // Seleciona apenas se ambos CNPJ e código coincidirem
      const match = cnpjMatch && codigoMatch

      return {
        ...p,
        selecionado: match,
        valorAssociado: match ? pagamento.valor : 0,
      }
    })

    setConciliarSelecionados(pagadoresComSelecao)
    setConciliarTipo(pagamento.tipo || "igual")
    setShowConciliarModal(true)

    adicionarEventoAuditoria(
      "analise_excecao",
      `Abriu modal de conciliação para pagamento ${pagamento.pagador}`,
      pagamento.id,
      {
        valor: pagamento.valor,
        cnpj: pagamento.cnpj,
        codigo: pagamento.codigo,
      },
    )
  }

  const confirmarConciliacao = () => {
    if (!pagamentoConciliar) return

    const selecionados = conciliarSelecionados.filter((p) => p.selecionado)
    if (selecionados.length === 0) return

    // Determinar o tipo baseado na quantidade de selecionados
    const tipoFinal = selecionados.length > 1 ? ("fracionado" as const) : conciliarTipo

    if (tipoFinal === "fracionado" || selecionados.length > 1) {
      // Remover o pagamento original e criar novos registros para cada fração
      const novosPagamentos: Pagamento[] = selecionados.map((sel, index) => ({
        id: `${pagamentoConciliar.id}-frac-${index + 1}`,
        data: pagamentoConciliar.data,
        pagador: sel.razaoSocial,
        cnpj: sel.cnpj,
        valor: sel.valorAssociado,
        valorEsperado: sel.valorOriginal,
        valorConciliado: sel.valorAssociado,
        formaPagamento: pagamentoConciliar.formaPagamento,
        banco: pagamentoConciliar.banco || "",
        canal: pagamentoConciliar.canal || "",
        identificacao: pagamentoConciliar.identificacao || "",
        status: "conciliado" as const,
        tipo: "fracionado" as const,
        origem: pagamentoConciliar.origem,
        codigo: sel.codigo,
        numeroONS: sel.codigo,
        codigoPagador: sel.codigo,
        observacao: `Fração ${index + 1}/${selecionados.length} do pagamento original (ID: ${pagamentoConciliar.id}). Valor original total: R$ ${pagamentoConciliar.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        detalhes: pagamentoConciliar.detalhes
          ? {
              ...pagamentoConciliar.detalhes,
              id: `${pagamentoConciliar.id}-frac-${index + 1}`,
              numeroONS: sel.codigo,
              valor: sel.valorAssociado,
              valorFinal: sel.valorAssociado,
              status: "conciliado" as const,
              formaPagamento: pagamentoConciliar.formaPagamento,
              banco: pagamentoConciliar.detalhes.banco || pagamentoConciliar.banco || "",
              pagamentoParcialValor: sel.valorAssociado,
              dataPagamentoParcial: pagamentoConciliar.data,
              valorFaltante: Math.max(0, sel.valorOriginal - sel.valorAssociado),
              jurosMulta: 0, // Assuming no juros/multa for partial payments in this context
              tratativas: [], // Clear existing tratativas or adapt as needed
              anexos: [], // Clear existing anexos or adapt as needed
            }
          : undefined,
      }))

      // Substituir o pagamento original pelos novos registros fracionados
      setPagamentos((prev) => {
        const semOriginal = prev.filter((p) => p.id !== pagamentoConciliar.id)
        return [...semOriginal, ...novosPagamentos]
      })
    } else {
      // Comportamento original para pagamento único (não fracionado)
      setPagamentos(
        pagamentos.map((p) => {
          if (p.id === pagamentoConciliar.id) {
            return {
              ...p,
              status: "conciliado" as const,
              tipo: tipoFinal,
              codigo: selecionados[0].codigo,
              numeroONS: selecionados[0].codigo,
              codigoPagador: selecionados[0].codigo,
              cnpj: selecionados[0].cnpj,
              valorConciliado: selecionados[0].valorAssociado,
              observacao: p.observacao || `Conciliado com ${selecionados[0].razaoSocial} (${selecionados[0].codigo})`,
              detalhes: p.detalhes
                ? {
                    ...p.detalhes,
                    numeroONS: selecionados[0].codigo,
                    valor: selecionados[0].valorAssociado,
                    valorFinal: selecionados[0].valorAssociado,
                    status: "conciliado" as const,
                    formaPagamento: pagamentoConciliar.formaPagamento,
                    favorecido: selecionados[0].razaoSocial,
                    cnpjFavorecido: selecionados[0].cnpj,
                  }
                : undefined,
            }
          }
          return p
        }),
      )
    }

    setShowConciliarModal(false)
    setPagamentoConciliar(null)
    setConciliarSelecionados([])

    adicionarEventoAuditoria(
      "conciliacao_manual",
      `Conciliou pagamento ${pagamentoConciliar.pagador} (${tipoFinal}) com ${selecionados.length} pagador(es)`,
      pagamentoConciliar.id,
      {
        statusAnterior: pagamentoConciliar.status,
        statusNovo: "conciliado",
        tipo: tipoFinal,
        pagadoresSelecionados: selecionados.map((s) => ({
          codigo: s.codigo,
          cnpj: s.cnpj,
          valor: s.valorAssociado,
        })),
      },
    )
  }

  useEffect(() => {
    if (onEstatisticasChange) {
      const totalPagamentos = pagamentos.length
      const conciliados = pagamentos.filter((p) => p.status === "conciliado").length
      const divergentes = pagamentos.filter((p) => p.status === "divergente").length
      const excecoes = pagamentos.filter((p) => p.status === "excecao").length
      onEstatisticasChange({ totalPagamentos, conciliados, divergentes, excecoes })
    }
  }, [pagamentos, onEstatisticasChange])

  const handleRemoverPagamento = (id: string) => {
    const pagamento = pagamentos.find((p) => p.id === id)
    if (pagamento) {
      adicionarEventoAuditoria("exclusao", `Solicitou exclusão do pagamento ${pagamento.pagador}`, id, {
        valor: pagamento.valor,
        cnpj: pagamento.cnpj,
        status: pagamento.status,
      })
    }
    setPagamentoParaRemover(id)
  }

  const confirmarRemocao = () => {
    if (pagamentoParaRemover) {
      const pagamento = pagamentos.find((p) => p.id === pagamentoParaRemover)
      if (pagamento) {
        adicionarEventoAuditoria(
          "exclusao",
          `Excluiu pagamento ${pagamento.pagador} - R$ ${pagamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          pagamentoParaRemover,
          {
            valor: pagamento.valor,
            cnpj: pagamento.cnpj,
            status: pagamento.status,
          },
        )
      }
      setPagamentos(pagamentos.filter((p) => p.id !== pagamentoParaRemover))
      setPagamentoParaRemover(null)
    }
  }

  // FIX: Declare pagamentosFiltrados before using it
  const pagamentosFiltrados = React.useMemo(() => {
    return pagamentos.filter((p) => {
      const dataInicio = filtroDataInicio ? new Date(filtroDataInicio) : null
      const dataFim = filtroDataFim ? new Date(filtroDataFim) : null
      const dataPagamento = new Date(p.data)

      const statusMatch = filtroStatus === "todos" || p.status === filtroStatus
      const origemMatch = filtroOrigem === "todos" || p.origem === filtroOrigem
      const pagadorMatch = p.pagador.toLowerCase().includes(filtroPagador.toLowerCase())
      const dataInicioMatch = !dataInicio || dataPagamento >= dataInicio
      const dataFimMatch = !dataFim || dataPagamento <= dataFim

      return statusMatch && origemMatch && pagadorMatch && dataInicioMatch && dataFimMatch
    })
  }, [pagamentos, filtroStatus, filtroOrigem, filtroDataInicio, filtroDataFim, filtroPagador])

  const confirmarRemocaoTodos = () => {
    const idsFiltrados = pagamentosFiltrados.map((p) => p.id)
    adicionarEventoAuditoria("exclusao", `Excluiu ${idsFiltrados.length} pagamento(s) em massa`, undefined, {
      quantidade: idsFiltrados.length,
      filtroStatus,
      filtroOrigem,
    })
    setPagamentos(pagamentos.filter((p) => !idsFiltrados.includes(p.id)))
    setShowRemoverTodos(false)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
    }
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // Helper to extract code from strings like "1234 - Nome do Credor"
  const extractCodigo = (codigoString: string | undefined | null): string => {
    if (!codigoString) return ""
    return codigoString.split(" - ")[0].trim()
  }

  // CHANGE: Removed duplicate getCodigoPagadorByCnpj function declaration around line 961
  // The function is already defined later in the code around line 1600

  // Keep only this version of the function (around line 1600):

  const getValorEsperadoPorCnpj = (cnpjPagamento: string): number => {
    if (!cnpjPagamento || !credorSelecionado) return 0

    const cnpjLimpo = normalizeCnpj(cnpjPagamento)

    // Primeiro, buscar no valoresPorPagador pelo CNPJ principal
    const encontrado = valoresPorPagador.find((v) => {
      const cnpjPagador = normalizeCnpj(v.cnpj)
      return cnpjPagador === cnpjLimpo
    })

    if (encontrado) {
      return encontrado.valor
    }

    // Se não encontrou, buscar nos itens agrupados
    for (const v of valoresPorPagador) {
      if (v.itensAgrupados && v.itensAgrupados.length > 0) {
        const itemEncontrado = v.itensAgrupados.find((item) => {
          const cnpjItem = normalizeCnpj(item.cnpj)
          return cnpjItem === cnpjLimpo
        })
        if (itemEncontrado) {
          return itemEncontrado.valor
        }
      }
    }

    return 0
  }

  const getCodigoPagadorByCnpj = (cnpj: string): string => {
    const cnpjLimpo = cnpj?.replace(/\D/g, "") || ""
    if (!cnpjLimpo) return ""

    // Primeiro busca no valoresPorPagador (que já tem os dados agrupados)
    for (const v of valoresPorPagador) {
      // Verifica no CNPJ principal
      const cnpjItemLimpo = v.cnpj?.replace(/\D/g, "") || ""
      if (cnpjItemLimpo === cnpjLimpo) {
        return v.codigo || ""
      }
      // Verifica nos itens agrupados
      if (v.itensAgrupados) {
        for (const item of v.itensAgrupados) {
          const cnpjAgrupadoLimpo = item.cnpj?.replace(/\D/g, "") || ""
          if (cnpjAgrupadoLimpo === cnpjLimpo) {
            return v.codigo || ""
          }
        }
      }
    }

    // Fallback: busca diretamente no mapaLiquidacao pelo CNPJ no cadastro de pagadores
    for (const m of mapaLiquidacao) {
      const codigoPagador = m.pagadorCodigo?.split(/\s*[-–]\s*/)[0].trim() || ""
      const pagador = pagadores.find((p) => p.codigo === codigoPagador)
      if (pagador) {
        const cnpjPagadorLimpo = pagador.cnpj?.replace(/\D/g, "") || ""
        if (cnpjPagadorLimpo === cnpjLimpo) {
          return codigoPagador
        }
      }
    }

    return ""
  }

  const conciliarAutomaticamente = () => {
    if (!credorSelecionado) {
      alert("Selecione um credor para realizar a conciliação automática.")
      return
    }

    console.log("[v0] Iniciando conciliação automática")
    console.log("[v0] Credor selecionado:", credorSelecionado.codigo, credorSelecionado.nome)
    console.log("[v0] Total mapaLiquidacao:", mapaLiquidacao.length)
    console.log("[v0] Total pagadores:", pagadores.length)
    console.log("[v0] Total pagamentos:", pagamentos.length)

    let conciliados = 0
    let divergentes = 0
    let excecoes = 0

    const entradasCredor = mapaLiquidacao.filter((m) => {
      if (!m.credorCodigo) return false
      const codigoNumerico = m.credorCodigo.split(/\s*[-–]\s*/)[0].trim()
      // Comparar por código ou por CNPJ do credor
      const cnpjCredorMapa = m.credorCodigo.replace(/\D/g, "")
      const cnpjCredorSelecionado = credorSelecionado.documento?.replace(/\D/g, "") || ""
      return (
        codigoNumerico === credorSelecionado.codigo ||
        (cnpjCredorSelecionado && cnpjCredorMapa.includes(cnpjCredorSelecionado))
      )
    })

    console.log("[v0] Entradas do credor no mapa:", entradasCredor.length)

    const pagamentosAtualizados = pagamentos.map((pagamento) => {
      // Skip already reconciled payments
      if (pagamento.status === "conciliado") return pagamento

      // Clean CNPJ from payment for comparison
      const cnpjPagamentoLimpo = pagamento.cnpj.replace(/\D/g, "")

      console.log(
        "[v0] Processando pagamento:",
        pagamento.id,
        "Pagador:",
        pagamento.pagador,
        "CNPJ:",
        cnpjPagamentoLimpo,
        "Valor:",
        pagamento.valor,
      )

      if (!cnpjPagamentoLimpo) {
        excecoes++
        return { ...pagamento, status: "excecao" as const, tipo: "identificacao_incorreta" as const }
      }

      // Find pagador by CNPJ in cadastro
      const pagadorEncontrado = pagadores.find((p) => {
        const cnpjPagador = p.cnpj?.replace(/\D/g, "") || ""
        return cnpjPagador === cnpjPagamentoLimpo
      })

      console.log("[v0] Pagador encontrado no cadastro:", pagadorEncontrado?.codigo, pagadorEncontrado?.razaoSocial)

      let entradasPagador: typeof mapaLiquidacao = []

      if (pagadorEncontrado) {
        // 1. Buscar por código do pagador
        entradasPagador = entradasCredor.filter((m) => {
          const codigoPagador = m.pagadorCodigo?.split(/\s*[-–]\s*/)[0].trim() || ""
          return codigoPagador === pagadorEncontrado.codigo
        })
        console.log("[v0] Entradas por código do pagador:", entradasPagador.length)
      }

      // 2. Se não encontrou, buscar pelo CNPJ diretamente no mapa
      if (entradasPagador.length === 0) {
        entradasPagador = entradasCredor.filter((m) => {
          // Extrair CNPJ do campo pagadorCodigo (pode estar no formato "codigo - nome CNPJ" ou só CNPJ)
          const mapaCnpj = m.pagadorCodigo?.replace(/\D/g, "") || ""
          return (
            mapaCnpj === cnpjPagamentoLimpo ||
            mapaCnpj.includes(cnpjPagamentoLimpo) ||
            cnpjPagamentoLimpo.includes(mapaCnpj)
          )
        })
        console.log("[v0] Entradas por CNPJ direto no mapa:", entradasPagador.length)
      }

      // 3. Se ainda não encontrou, buscar em todas as entradas do credor pelo valor
      if (entradasPagador.length === 0) {
        // Buscar entrada com valor igual ao recebido
        const valorRecebido = Math.abs(pagamento.valor)
        entradasPagador = entradasCredor.filter((m) => {
          const valorMapa = m.valor || 0
          return Math.abs(valorMapa - valorRecebido) < 0.01
        })
        console.log("[v0] Entradas por valor igual:", entradasPagador.length)
      }

      if (entradasPagador.length === 0) {
        excecoes++
        console.log("[v0] Nenhuma entrada encontrada, marcando como exceção")
        return { ...pagamento, status: "excecao" as const, tipo: "identificacao_incorreta" as const }
      }

      // Sum all expected values for this pagador (valor a pagar)
      const valorEsperadoTotal = entradasPagador.reduce((acc, m) => acc + (m.valor || 0), 0)
      const valorRecebido = Math.abs(pagamento.valor)

      console.log("[v0] Valor esperado total:", valorEsperadoTotal, "Valor recebido:", valorRecebido)

      // Compare values with tolerance of 0.01
      const diferenca = Math.abs(valorRecebido - valorEsperadoTotal)
      const tolerancia = 0.01

      if (diferenca <= tolerancia) {
        conciliados++
        return {
          ...pagamento,
          valorEsperado: valorEsperadoTotal,
          status: "conciliado" as const,
          tipo: "igual" as const,
          valorConciliado: valorRecebido,
        }
      } else if (valorRecebido > valorEsperadoTotal) {
        divergentes++
        return {
          ...pagamento,
          valorEsperado: valorEsperadoTotal,
          status: "divergente" as const,
          tipo: "valor_maior" as const,
        }
      } else {
        divergentes++
        return {
          ...pagamento,
          valorEsperado: valorEsperadoTotal,
          status: "divergente" as const,
          tipo: "valor_menor" as const,
        }
      }
    })

    setPagamentos(pagamentosAtualizados)
    alert(
      `Conciliação automática concluída para o credor ${credorSelecionado.nome}!\n\nConciliados: ${conciliados}\nDivergentes: ${divergentes}\nExceções: ${excecoes}`,
    )
  }

  // CHANGE: Update reset function without valorEsperado
  const resetNovoPagamentoFormData = () => {
    setNovoPagamentoFormData({
      codigo: "",
      data: "",
      cnpj: "",
      valorFormatado: "",
      valorEsperado: 0, // Reset valorEsperado as well
      formaPagamento: "" as "pix" | "ted" | "boleto" | "transferencia" | "",
    })
  }

  // CHANGE: Update salvarNovoPagamento to get valorEsperado from mapa by CNPJ
  const salvarNovoPagamento = () => {
    // Buscar nome do pagador pelo CNPJ
    const cnpjLimpo = novoPagamentoFormData.cnpj.replace(/\D/g, "")
    const pagadorEncontrado = pagadores.find((p) => p.cnpj.replace(/\D/g, "") === cnpjLimpo)

    // Parse valor from formatted string
    const valorRecebido = parseMoedaBRL(novoPagamentoFormData.valorFormatado)

    // Buscar valor esperado do mapa pelo CNPJ
    const valorEsperado = getValorEsperadoPorCnpj(cnpjLimpo)

    let dataISO = novoPagamentoFormData.data
    if (novoPagamentoFormData.data.includes("/")) {
      const partes = novoPagamentoFormData.data.split("/")
      if (partes.length === 3) {
        dataISO = `${partes[2]}-${partes[1]}-${partes[0]}`
      }
    }

    const isDuplicado = pagamentos.some((p) => {
      const cnpjExistente = p.cnpj.replace(/\D/g, "")
      const codigoExistente = p.codigo || ""
      return (
        cnpjExistente === cnpjLimpo && codigoExistente === novoPagamentoFormData.codigo && p.valor === valorRecebido
      )
    })

    let statusCalculado: Pagamento["status"] = isDuplicado
      ? "duplicado"
      : valorRecebido === valorEsperado && valorEsperado > 0
        ? "conciliado"
        : valorEsperado > 0
          ? "divergente"
          : "excecao"

    // Se conciliado, verificar se é antecipado ou atrasado com base na data de referência
    if (statusCalculado === "conciliado" && dataReferenciaMapa) {
      const dataPagamento = new Date(dataISO.includes("T") ? dataISO : `${dataISO}T12:00:00`)
      const dataReferencia = new Date(dataReferenciaMapa)
      // Comparar apenas as datas (ignorando horário)
      dataPagamento.setHours(12, 0, 0, 0)
      dataReferencia.setHours(12, 0, 0, 0)

      if (dataPagamento.getTime() < dataReferencia.getTime()) {
        statusCalculado = "antecipado"
      } else if (dataPagamento.getTime() > dataReferencia.getTime()) {
        statusCalculado = "atrasado"
      }
      // Se for igual, mantém como "conciliado"
    }

    const novoPagamento: Pagamento = {
      id: `PAG-${Date.now()}`,
      codigo: novoPagamentoFormData.codigo, // Nº ONS do formulário
      data: dataISO, // Usar data convertida
      pagador: pagadorEncontrado?.razaoSocial || "Pagador não identificado",
      cnpj: novoPagamentoFormData.cnpj,
      valor: valorRecebido,
      valorEsperado: valorEsperado,
      canal: "",
      banco: "",
      identificacao: "",
      status: statusCalculado,
      tipo: valorRecebido === valorEsperado ? "igual" : valorRecebido > valorEsperado ? "maior" : "menor",
      observacao: "",
      origem: "manual",
      formaPagamento: novoPagamentoFormData.formaPagamento,
      detalhes: {
        id: "",
        titulo: "",
        numeroONS: novoPagamentoFormData.codigo, // Nº ONS do formulário
        transmissora: "",
        valor: valorRecebido,
        dataEmissao: "",
        dataVencimento: "",
        dataPagamento: dataISO, // Usar data convertida
        formaPagamento: novoPagamentoFormData.formaPagamento,
        pagamentoParcialValor: 0,
        dataPagamentoParcial: "",
        valorFaltante: 0,
        jurosMulta: 0,
        valorFinal: valorRecebido,
        dataPagamentoRestante: "",
        chavePix: "",
        tipoChavePix: "",
        banco: "",
        agencia: "",
        conta: "",
        tipoConta: "",
        favorecido: "",
        cnpjFavorecido: "",
        codigoBarras: "",
        linhaDigitavel: "",
        status: statusCalculado,
      },
    }

    adicionarEventoAuditoria(
      "criacao_manual",
      `Criou pagamento manual para ${pagadorEncontrado?.razaoSocial || novoPagamentoFormData.cnpj}`,
      novoPagamento.id,
      {
        valor: novoPagamento.valor,
        cnpj: novoPagamento.cnpj,
        codigo: novoPagamento.codigo,
        formaPagamento: novoPagamento.formaPagamento,
      },
    )

    setPagamentos((prev) => [...prev, novoPagamento])
    setShowNovoPagamento(false)
    resetNovoPagamentoFormData()
  }

  const handleImportarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setArquivoImportado(file) // Corresponds to arquivoSelecionado
    setNomeArquivoSelecionado(file.name)

    // Determine file type by extension
    const ext = file.name.split(".").pop()?.toLowerCase()
    let tipo: "cnab240" | "cnab400" | "ofx" | "csv" = "cnab240"
    if (ext === "ofx") tipo = "ofx"
    else if (ext === "csv") tipo = "csv"
    else if (ext === "ret" || ext === "txt") {
      tipo = "cnab240"
    }
    setTipoArquivo(tipo)

    // Parse file and generate preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      console.log("[v0] Parsing file:", file.name, "tipo:", tipo)
      console.log("[v0] File content preview:", content.substring(0, 500))
      const pagamentosImportados = parseArquivoBancario(content, tipo, file.name)
      console.log("[v0] Pagamentos importados:", pagamentosImportados.length)
      console.log("[v0] Pagamentos data:", JSON.stringify(pagamentosImportados, null, 2))
      setImportacaoPreview(pagamentosImportados)
    }
    reader.readAsText(file)
  }

  const parseArquivoBancario = (content: string, tipo: string, fileName: string): Pagamento[] => {
    const pagamentos: Pagamento[] = []
    const lines = content.split("\n").filter((l) => l.trim())

    if (tipo === "csv") {
      // Parse CSV - skip header
      lines.forEach((line, index) => {
        // Changed from .slice(1) to parse header row if it has data
        const cols = line.split(";")
        if (cols.length >= 4) {
          // Ensure enough columns are present
          pagamentos.push({
            id: `imp-${Date.now()}-${index}`,
            codigo: `IMP-${index}`, // Example code for imported CSV
            data: cols[0] || new Date().toISOString().split("T")[0],
            pagador: cols[1] || "Não identificado",
            cnpj: cols[2] || "",
            valor: Number.parseFloat(cols[3]?.replace(",", ".") || "0"),
            valorEsperado: 0, // CSV format doesn't typically include expected value
            status: "excecao",
            tipo: "identificacao_incorreta", // Default to exception for missing expected value
            canal: cols[5] || "Importação CSV",
            banco: cols[6] || "",
            identificacao: cols[7] || fileName,
            origem: "importacao",
            formaPagamento: "", // Default to empty, can be inferred if available in CSV
            valorRecebido: Number.parseFloat(cols[3]?.replace(",", ".") || "0"), // Added for preview
          })
        }
      })
    } else if (tipo === "ofx") {
      console.log("[v0] Iniciando parsing OFX")

      const getBankInfo = (tag: string): string => {
        const match = content.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))
        return match ? match[1].trim() : ""
      }
      const bankId = getBankInfo("BANKID")
      const branchId = getBankInfo("BRANCHID")
      const acctId = getBankInfo("ACCTID")

      // Map common Brazilian bank codes to names
      const bankNames: Record<string, string> = {
        "001": "Banco do Brasil",
        "033": "Santander",
        "104": "Caixa Econômica",
        "237": "Bradesco",
        "341": "Itaú",
        "356": "Banco Real",
        "389": "Banco Mercantil",
        "399": "HSBC",
        "422": "Safra",
        "453": "Banco Rural",
        "633": "Rendimento",
        "652": "Itaú Unibanco",
        "745": "Citibank",
        "756": "Sicoob",
        "748": "Sicredi",
      }
      const bancoNome = bankNames[bankId] || (bankId ? `Banco ${bankId}` : "")
      console.log("[v0] Banco identificado:", bancoNome, "- BankID:", bankId, "- Branch:", branchId, "- Conta:", acctId)

      // Try to find transactions - OFX can have different formats
      // Some have closing tags, some don't
      let transacoes: string[] = []

      // Try format with closing tags first
      const withClosingTags = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi)
      if (withClosingTags && withClosingTags.length > 0) {
        transacoes = withClosingTags
        console.log("[v0] Encontradas", transacoes.length, "transações (formato com tags de fechamento)")
      } else {
        // Try format without closing tags (SGML style)
        const sgmlMatches = content.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)
        if (sgmlMatches && sgmlMatches.length > 0) {
          transacoes = sgmlMatches
          console.log("[v0] Encontradas", transacoes.length, "transações (formato SGML)")
        }
      }

      console.log("[v0] Total de transações encontradas:", transacoes.length)

      transacoes.forEach((trn, index) => {
        const getValue = (tag: string): string => {
          // Match tag followed by content until next tag or newline
          const match = trn.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"))
          return match ? match[1].trim() : ""
        }

        const valorStr = getValue("TRNAMT")
        const valor = Number.parseFloat(valorStr || "0")

        // Accept both positive and negative values (credits and debits)
        if (valor !== 0) {
          const memo = getValue("MEMO") || ""
          const name = getValue("NAME") || ""
          const fitid = getValue("FITID") || ""
          const postedDateRaw = getValue("DTPOSTED") || ""
          // Fixed date parsing - DTPOSTED format is YYYYMMDD
          const postedDate =
            postedDateRaw.length >= 8
              ? `${postedDateRaw.substring(0, 4)}-${postedDateRaw.substring(4, 6)}-${postedDateRaw.substring(6, 8)}`
              : new Date().toISOString().split("T")[0]

          console.log("[v0] MEMO completo:", memo)
          console.log("[v0] NAME:", name)

          let pagadorNome = ""
          let pagadorCnpj = ""
          let credorNome = ""
          let credorCnpj = ""
          let idTitulo = ""
          let formaPagamentoDetectada: "pix" | "ted" | "boleto" | "transferencia" | "" = ""

          // Updated regex to support new format with codigo: "7776 - PAGADOR27 Solar Leste ME CNPJ 39551858000180"
          // Also supports old format: "PAGADOR Nome CNPJ 14digits"
          let pagadorCodigo = ""
          let credorCodigo = ""

          // New format: "7776 - PAGADOR27 Solar Leste ME CNPJ 39551858000180"
          const pagadorMatchNovo = memo.match(/(\d+)\s*-\s*(\S+)\s+(.+?)\s+CNPJ\s+(\d{14})/i)
          if (pagadorMatchNovo) {
            pagadorCodigo = pagadorMatchNovo[1].trim()
            pagadorNome = `${pagadorMatchNovo[2].trim()} ${pagadorMatchNovo[3].trim()}`
            pagadorCnpj = pagadorMatchNovo[4].replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
            console.log("[v0] Pagador extraído (novo formato):", pagadorCodigo, pagadorNome, pagadorCnpj)
          } else {
            // Old format: "PAGADOR Nome CNPJ 14digits"
            const pagadorMatch = memo.match(/PAGADOR\s+(.+?)\s+CNPJ\s+(\d{14})/i)
            if (pagadorMatch) {
              pagadorNome = pagadorMatch[1].trim()
              pagadorCnpj = pagadorMatch[2].replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
              console.log("[v0] Pagador extraído (formato antigo):", pagadorNome, pagadorCnpj)
            }
          }

          // Extract second part (after first | separator) for CREDOR
          const partes = memo.split("|")
          if (partes.length >= 2) {
            const parteCRedor = partes[1].trim()
            const credorMatchNovo = parteCRedor.match(/(\d+)\s*-\s*(\S+)\s+(.+?)\s+CNPJ\s+(\d{14})/i)
            if (credorMatchNovo) {
              credorCodigo = credorMatchNovo[1].trim()
              credorNome = `${credorMatchNovo[2].trim()} ${credorMatchNovo[3].trim()}`
              credorCnpj = credorMatchNovo[4].replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
              console.log("[v0] Credor extraído (novo formato):", credorCodigo, credorNome, credorCnpj)
            } else {
              // Old format: "CREDOR Nome CNPJ 14digits"
              const credorMatch = memo.match(/CREDOR\s+(.+?)\s+CNPJ\s+(\d{14})/i)
              if (credorMatch) {
                credorNome = credorMatch[1].trim()
                credorCnpj = credorMatch[2].replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
                console.log("[v0] Credor extraído (formato antigo):", credorNome, credorCnpj)
              }
            }
          }

          // Extract TITULO - format: "TITULO TIT-xxx-xxx"
          const tituloMatch = memo.match(/TITULO\s+(TIT-[\w-]+)/i)
          if (tituloMatch) {
            idTitulo = tituloMatch[1].trim()
            console.log("[v0] ID Título extraído:", idTitulo)
          }

          // Heuristic:
          //   If MEMO contains 'PIX' or 'E2EID' -> PIX
          //   elif MEMO contains 'BOLETO' (at end, not in TITULO) -> BOLETO
          //   else -> TED
          const memoUpper = memo.toUpperCase()

          if (memoUpper.includes("PIX") || memoUpper.includes("E2EID")) {
            formaPagamentoDetectada = "pix"
          } else if (memoUpper.match(/\|\s*BOLETO\s*$/i) || memoUpper.endsWith("BOLETO")) {
            formaPagamentoDetectada = "boleto"
          } else if (memoUpper.match(/\|\s*TED\s*$/i) || memoUpper.endsWith("TED")) {
            formaPagamentoDetectada = "ted"
          } else {
            // Default to TED if no specific indicator found
            formaPagamentoDetectada = "ted"
          }
          console.log("[v0] Forma de pagamento detectada:", formaPagamentoDetectada)

          // Fallback to NAME if no pagador found in MEMO
          if (!pagadorNome && name) {
            pagadorNome = name
          }

          // Final fallback
          if (!pagadorNome) {
            pagadorNome = `Pagamento OFX ${index + 1}`
          }

          const observacaoFinal = credorNome ? `Credor: ${credorNome} (${credorCnpj}) | Título: ${idTitulo}` : memo

          pagamentos.push({
            id: `ofx-${Date.now()}-${index}`, // Changed prefix to 'ofx' for clarity
            codigo: pagadorCodigo || `OFX-${index}`, // Example code for imported OFXV
            data: postedDate,
            pagador: pagadorNome,
            cnpj: pagadorCnpj,
            valor: Math.abs(valor),
            valorEsperado: 0, // OFX doesn't typically contain expected value for reconciliation
            canal: formaPagamentoDetectada.toUpperCase() || "OFX", // Use detected payment method as canal or OFX
            banco: bancoNome,
            identificacao: idTitulo || fitid, // Use fitid as fallback for identification
            status: "excecao", // Default to exception if expected value is missing
            origem: "importacao",
            formaPagamento: formaPagamentoDetectada || "", // Use detected formaPagamento
            valorRecebido: Math.abs(valor), // Added for preview
          })
        }
      })
    } else if (tipo === "cnab240" || tipo === "cnab400") {
      // Parse CNAB - simplified parser for segment T (240) or type 1 (400)
      lines.forEach((line, index) => {
        // CNAB 240 - Segment T (payment details)
        if (tipo === "cnab240" && line.length === 240) {
          const codigoRegistro = line.substring(0, 1)
          const codigoSegmento = line.substring(13, 14)
          const codigoMovimento = line.substring(15, 17) // Used for payment method detection
          const formaLancamento = line.substring(17, 18) // Used for payment method detection

          // Segmento T (Cobrança)
          if (codigoSegmento === "T") {
            const valorNominal = Number.parseFloat(line.substring(77, 92).replace(/^0+/, "")) / 100
            const valorPago = Number.parseFloat(line.substring(92, 107).replace(/^0+/, "")) / 100 // This is the actual paid amount
            const dataPagamento = line.substring(137, 145)
            const dataFormatada =
              dataPagamento.length === 8
                ? `${dataPagamento.substring(4, 8)}-${dataPagamento.substring(2, 4)}-${dataPagamento.substring(0, 2)}`
                : new Date().toISOString().split("T")[0]

            // Detect payment method from formaLancamento and codigoMovimento
            let formaPagamentoCNAB: "pix" | "ted" | "boleto" | "transferencia" | "" = ""
            if (formaLancamento === "1" || codigoMovimento === "01") {
              // Boleto
              formaPagamentoCNAB = "boleto"
            } else if (formaLancamento === "3" || formaLancamento === "41") {
              // TED / DOC
              formaPagamentoCNAB = "ted"
            } else if (formaLancamento === "45" || formaLancamento === "47") {
              // PIX
              formaPagamentoCNAB = "pix"
            } else if (formaLancamento === "48" || formaLancamento === "49") {
              // Transferência (other types)
              formaPagamentoCNAB = "transferencia"
            }

            if (valorPago > 0) {
              pagamentos.push({
                id: `cnab240-${Date.now()}-${index}`,
                codigo: `CNAB240-${index}`, // Example code for imported CNAB240
                data: dataFormatada,
                pagador: line.substring(33, 73).trim() || "Não identificado",
                cnpj: line.substring(18, 32).trim(),
                valor: valorPago, // Use the actual paid amount
                valorEsperado: valorNominal, // Use nominal value as expected if available
                canal: formaPagamentoCNAB.toUpperCase() || "CNAB240",
                banco: line.substring(0, 3),
                identificacao: line.substring(73, 93).trim() || fileName,
                status:
                  valorPago === valorNominal ? "conciliado" : valorPago > valorNominal ? "divergente" : "divergente",
                tipo: valorPago === valorNominal ? "igual" : valorPago > valorNominal ? "valor_maior" : "valor_menor",
                origem: "importacao",
                formaPagamento: formaPagamentoCNAB, // Use detected formaPagamento
                valorRecebido: valorPago, // Added for preview
              })
            }
          }
        }
        // CNAB 400 - Record type 1
        else if (tipo === "cnab400" && line.length === 400) {
          const tipoRegistro = line.substring(0, 1)
          if (tipoRegistro === "1") {
            const valor = Number.parseFloat(line.substring(152, 165).replace(/^0+/, "")) / 100
            const dataPagamento = line.substring(110, 116)
            const dataFormatada =
              dataPagamento.length === 6
                ? `20${dataPagamento.substring(4, 6)}-${dataPagamento.substring(2, 4)}-${dataPagamento.substring(0, 2)}`
                : new Date().toISOString().split("T")[0]
            if (valor > 0) {
              pagamentos.push({
                id: `cnab400-${Date.now()}-${index}`,
                codigo: `CNAB400-${index}`, // Example code for imported CNAB400
                data: dataFormatada,
                pagador: line.substring(34, 74).trim() || "Não identificado",
                cnpj: line.substring(3, 17).trim(),
                valor: valor,
                valorEsperado: 0, // CNAB 400 typically doesn't have expected value
                status: "excecao",
                tipo: "identificacao_incorreta",
                canal: "CNAB400",
                banco: line.substring(76, 79),
                identificacao: line.substring(110, 120).trim() || fileName,
                origem: "importacao",
                formaPagamento: "", // CNAB 400 might not explicitly provide formaPagamento
                valorRecebido: valor, // Added for preview
              })
            }
          }
        }
      })
    }

    // If no payments found, create sample for demo
    if (pagamentos.length === 0) {
      pagamentos.push({
        id: `imp-${Date.now()}-0`,
        codigo: `DEMO-0`, // Example code for demo
        data: new Date().toISOString().split("T")[0],
        pagador: "Pagamento importado de " + fileName,
        cnpj: "",
        valor: 0,
        valorEsperado: 0,
        status: "excecao",
        tipo: "igual",
        canal: `Importação ${tipo.toUpperCase()}`,
        banco: "",
        identificacao: fileName,
        origem: "importacao",
        formaPagamento: "", // Default to empty
        valorRecebido: 0, // Added for preview
      })
    }

    return pagamentos
  }

  const credoresFiltrados = credoresBase.filter((c) => {
    if (buscaCredor.length < 3) return false
    const busca = buscaCredor.toLowerCase()
    return (
      c.agente?.toLowerCase().includes(busca) ??
      (false || c.nome?.toLowerCase().includes(busca)) ??
      (false || c.documento?.toLowerCase().includes(busca)) ??
      (false || c.codigo?.toLowerCase().includes(busca)) ??
      false
    )
  })

  // Valores por pagador baseado no mapa de liquidação (usando o credor selecionado)
  const valoresPorPagador = credorSelecionado
    ? mapaLiquidacao
        .filter((m) => {
          const credorCodigo = m.credorCodigo?.split(/\s*[-–]\s*/)[0].trim()
          return credorCodigo === credorSelecionado.codigo
        })
        .reduce(
          (acc, m) => {
            // Primeiro tenta buscar pelo código + nome, depois só pelo código
            const pagadorPorNome = pagadores.find(
              (p) =>
                p.codigo === m.pagadorCodigo?.split(/\s*[-–]\s*/)[0].trim() &&
                p.agente === m.pagadorCodigo?.split(/\s*[-–]\s*/)[1]?.trim(),
            )
            const pagadorPorCodigo = pagadores.find((p) => p.codigo === m.pagadorCodigo?.split(/\s*[-–]\s*/)[0].trim())
            const pagador = pagadorPorNome || pagadorPorCodigo

            const codigoPagadorCompleto = m.pagadorCodigo || ""
            const codigoPagador = codigoPagadorCompleto.split(/\s*[-–]\s*/)[0].trim()
            const nomePagadorMapa = codigoPagadorCompleto.split(/\s*[-–]\s*/)[1]?.trim() || "-"

            const razaoSocialCadastro = pagador?.razaoSocial || pagador?.agente || nomePagadorMapa

            // Se não encontrou pagador específico pelo nome, usar o código como indicador
            const cnpjParaItem = pagadorPorNome?.cnpj || pagadorPorCodigo?.cnpj || `(Código ${codigoPagador})`

            // Verificar se já existe um registro com o mesmo código
            const existente = acc.find((item) => item.codigo === codigoPagador)

            const cnpjLimpoItem = cnpjParaItem.replace(/\D/g, "")
            const valorConciliadoItem =
              cnpjLimpoItem && !cnpjLimpoItem.startsWith("Código")
                ? pagamentos
                    .filter((p) => {
                      const cnpjPagamento = p.cnpj?.replace(/\D/g, "") || ""
                      const codigoPagamento = p.codigo || ""
                      // Considerar conciliado se CNPJ E código coincidem
                      return (
                        cnpjPagamento === cnpjLimpoItem &&
                        codigoPagamento === codigoPagador &&
                        p.status === "conciliado"
                      )
                    })
                    .reduce((sum, p) => sum + Math.abs(p.valor), 0)
                : 0

            const itemIndividual = {
              cnpj: cnpjParaItem,
              nome: nomePagadorMapa,
              razaoSocial: razaoSocialCadastro,
              valor: m.valor,
              valorConciliado: valorConciliadoItem, // Adicionado valorConciliado ao item
            }

            if (existente) {
              // Somar o valor ao registro existente e adicionar item individual
              existente.valor += m.valor
              existente.itensAgrupados.push(itemIndividual)
              existente.valorConciliado = existente.itensAgrupados.reduce((sum, i) => sum + (i.valorConciliado || 0), 0)
            } else {
              acc.push({
                codigoMapa: codigoPagador,
                codigo: codigoPagador,
                nome: nomePagadorMapa,
                razaoSocial: razaoSocialCadastro,
                cnpj: cnpjParaItem,
                valor: m.valor,
                valorConciliado: valorConciliadoItem,
                itensAgrupados: [itemIndividual],
              })
            }

            return acc
          },
          [] as {
            codigoMapa: string
            codigo: string
            nome: string
            razaoSocial: string
            cnpj: string
            valor: number
            valorConciliado: number
            itensAgrupados: {
              cnpj: string
              nome: string
              razaoSocial: string
              valor: number
              valorConciliado: number
            }[]
          }[],
        )
    : []

  const totalValoresPagadores = valoresPorPagador.reduce((acc, v) => acc + (v.valor || 0), 0)
  const totalValoresConciliados = valoresPorPagador.reduce((acc, v) => acc + (v.valorConciliado || 0), 0)

  const totais = {
    totalRecebido: pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0),
    totalEsperado: pagamentos.reduce((acc, p) => acc + (p.valorEsperado || 0), 0),
    conciliados: pagamentos.filter((p) => p.status === "conciliado").length,
    divergentes: pagamentos.filter((p) => p.status === "divergente").length,
    excecoes: pagamentos.filter((p) => p.status === "excecao").length,
    duplicados: pagamentos.filter((p) => p.status === "duplicado").length, // Added count for duplicates
    atrasados: pagamentos.filter((p) => p.status === "atrasado").length, // Added count for 'atrasado'
    antecipados: pagamentos.filter((p) => p.status === "antecipado").length, // Added count for 'antecipado'
    total: pagamentos.length,
  }

  // FIX: Declare excecoesFiltradas before using it
  const excecoesFiltradas = React.useMemo(() => {
    return pagamentos
      .filter(
        (p) =>
          p.status === "divergente" ||
          p.status === "excecao" ||
          p.status === "duplicado" || // Include "duplicado"
          p.status === "atrasado" || // Include "atrasado"
          p.status === "antecipado", // Include "antecipado"
      )
      .filter((p) => {
        // Apply filters for types within these statuses
        return (
          (filtroExcecaoTipo === "todos" || p.tipo === filtroExcecaoTipo) &&
          (filtroExcecaoOrigem === "todos" || p.origem === filtroExcecaoOrigem)
        )
      })
  }, [pagamentos, filtroExcecaoTipo, filtroExcecaoOrigem])

  useEffect(() => {
    if (onEstatisticasChange) {
      const totalPagamentos = totais.total
      const conciliados = totais.conciliados
      const divergentes = totais.divergentes
      const excecoes = totais.excecoes
      // Optionally include duplicated count in statistics
      // const duplicados = totais.duplicados
      onEstatisticasChange({ totalPagamentos, conciliados, divergentes, excecoes })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagamentos, onEstatisticasChange]) // Dependencies for the effect

  const salvarDetalhes = () => {
    if (!pagamentoSelecionado || !detalhesEditados) return
    setPagamentos(
      pagamentos.map((p) =>
        p.id === pagamentoSelecionado.id
          ? {
              ...p,
              detalhes: detalhesEditados,
              formaPagamento: detalhesEditados.formaPagamento,
              codigo: detalhesEditados.numeroONS || p.codigo, // Usar numeroONS em vez de id
              status: (detalhesEditados as any).status || p.status,
              tipo: (detalhesEditados as any).tipo || p.tipo, // Update tipo if changed in details
              valor: detalhesEditados.valorFinal, // Update valor principal com o valor final
              valorEsperado: detalhesEditados.valor, // Update valor esperado com o valor do campo 'valor'
            }
          : p,
      ),
    )

    // Added audit log for editing
    adicionarEventoAuditoria(
      "edicao",
      `Editou detalhes do pagamento ${pagamentoSelecionado.pagador}`,
      pagamentoSelecionado.id,
      {
        statusAnterior: pagamentoSelecionado.status,
        statusNovo: (detalhesEditados as any).status || pagamentoSelecionado.status,
        valorAnterior: pagamentoSelecionado.valor,
        valorNovo: detalhesEditados.valorFinal,
      },
    )

    setShowDetalhes(false)
  }

  const copiarParaClipboard = (texto: string) => {
    navigator.clipboard.writeText(texto)
  }

  const getStatusBadge = (status: Pagamento["status"]) => {
    switch (status) {
      case "conciliado":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Conciliado
          </Badge>
        )
      case "divergente":
        return (
          <Badge className="bg-warning text-warning-foreground">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Divergente
          </Badge>
        )
      case "excecao":
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Exceção
          </Badge>
        )
      case "duplicado":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <Copy className="h-3 w-3 mr-1" />
            Duplicado
          </Badge>
        )
      case "atrasado": // Added case for 'atrasado'
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <Clock className="h-3 w-3 mr-1" />
            Atrasado
          </Badge>
        )
      case "antecipado": // Added case for 'antecipado'
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Clock className="h-3 w-3 mr-1" />
            Antecipado
          </Badge>
        )
    }
  }

  const getOrigemBadge = (origem: Pagamento["origem"]) => {
    const origemConfig = {
      manual: { label: "Manual", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      importacao: {
        label: "Importação",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      api: { label: "API", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      sincronismo: {
        label: "Sincronismo",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      },
    }
    const config = origemConfig[origem]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getTipoBadge = (tipo: Pagamento["tipo"]) => {
    const badges = {
      igual: { label: "Valor Correto", variant: "outline" as const, icon: CheckCircle2 },
      maior: { label: "Valor Maior", variant: "outline" as const, icon: TrendingUp }, // Updated label
      menor: { label: "Valor Menor", variant: "outline" as const, icon: TrendingDown }, // Updated label
      fracionado: { label: "Fracionado", variant: "outline" as const, icon: Plus },
      antecipado: { label: "Antecipado", variant: "outline" as const, icon: Clock },
      atrasado: { label: "Atrasado", variant: "outline" as const, icon: Clock },
      identificacao_incorreta: { label: "Identificação Incorreta", variant: "outline" as const, icon: AlertCircle },
      canal_diferente: { label: "Canal Diferente", variant: "outline" as const, icon: AlertTriangle },
      valor_maior: { label: "Valor Maior", variant: "outline" as const, icon: TrendingUp }, // Added for consistency
      valor_menor: { label: "Valor Menor", variant: "outline" as const, icon: TrendingDown }, // Added for consistency
      duplicado: { label: "Duplicado", variant: "outline" as const, icon: Copy }, // Added for "duplicado" type
    }
    const badge = badges[tipo]
    if (!badge) return null
    const { label, variant, icon: Icon } = badge
    return (
      <Badge variant={variant}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    )
  }

  const abrirDetalhes = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento)
    setDetalhesEditados(
      pagamento.detalhes || {
        id: pagamento.id,
        titulo: "",
        numeroONS: "",
        transmissora: pagamento.pagador,
        valor: pagamento.valorEsperado,
        dataEmissao: "",
        dataVencimento: "",
        dataPagamento: pagamento.data.split(" ")[0],
        formaPagamento:
          pagamento.formaPagamento ||
          (pagamento.canal.toLowerCase() as "pix" | "ted" | "boleto" | "transferencia" | ""), // Added "transferencia"
        pagamentoParcialValor: pagamento.valor < pagamento.valorEsperado ? pagamento.valor : 0,
        dataPagamentoParcial: pagamento.valor < pagamento.valorEsperado ? pagamento.data.split(" ")[0] : "",
        valorFaltante: Math.max(0, pagamento.valorEsperado - pagamento.valor),
        jurosMulta: pagamento.valor > pagamento.valorEsperado ? pagamento.valor - pagamento.valorEsperado : 0,
        valorFinal: pagamento.valorEsperado,
        dataPagamentoRestante: "",
        tratativas: [],
        anexos: [],
        banco: pagamento.banco,
        agencia: "",
        conta: "",
        tipoConta: "",
        favorecido: pagamento.pagador,
        cnpjFavorecido: pagamento.cnpj,
        chavePix: "",
        tipoChavePix: "",
        codigoBarras: "",
        linhaDigitavel: "",
        status: pagamento.status,
      },
    )
    setShowDetalhes(true)
  }

  const adicionarTratativa = () => {
    if (!novaTratativa.trim() || !detalhesEditados) return
    const nova: Tratativa = {
      id: Date.now().toString(),
      data: new Date().toISOString(), // Use ISO string for consistency, format when displaying
      descricao: novaTratativa,
      usuario: "Usuário Atual", // Replace with actual logged-in user
    }
    setDetalhesEditados({
      ...detalhesEditados,
      tratativas: [...detalhesEditados.tratativas, nova],
    })
    setNovaTratativa("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !detalhesEditados) return

    const novosAnexos: Anexo[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random(),
      nome: file.name,
      tipo: file.type,
      tamanho: `${(file.size / 1024).toFixed(0)} KB`,
      dataUpload: new Date().toISOString().split("T")[0],
    }))

    setDetalhesEditados({
      ...detalhesEditados,
      anexos: [...detalhesEditados.anexos, ...novosAnexos],
    })
  }

  const removerAnexo = (anexoId: string) => {
    if (!detalhesEditados) return
    setDetalhesEditados({
      ...detalhesEditados,
      anexos: detalhesEditados.anexos.filter((a) => a.id !== anexoId),
    })
  }

  const normalizeCnpj = (cnpj: string | undefined | null): string => {
    return (cnpj || "").replace(/\D/g, "")
  }

  const formatarMoedaBRL = (valor: number): string => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Helper function to parse Brazilian currency input
  const parseMoedaBRL = (valor: string): number => {
    // Remove currency symbol and spaces, replace comma with dot
    const cleaned = valor.replace(/[R$\s.]/g, "").replace(",", ".")
    return Number.parseFloat(cleaned) || 0
  }

  // const getEntradasCredor = (credor: CredorBase | null) => {
  //   if (!credor) return []

  //   const codigoCredor = credor.codigo
  //   const cnpjCredor = normalizeCnpj(credor.documento)

  //   return mapaLiquidacao.filter((m) => {
  //     if (!m.credorCodigo) return false

  //     const codigoMapa = extractCodigo(m.credorCodigo)
  //     const cnpjMapa = normalizeCnpj(m.credorCodigo)

  //     // Match by codigo OR by CNPJ
  //     return (
  //       codigoMapa === codigoCredor ||
  //       (cnpjCredor && cnpjMapa && (cnpjMapa.includes(cnpjCredor) || cnpjCredor.includes(cnpjMapa)))
  //     )
  //   })
  // }

  // const getValorEsperado = (cnpjPagamento: string, credor: CredorBase | null): number => {
  //   if (!cnpjPagamento || !credor) return 0

  //   const cnpjLimpo = normalizeCnpj(cnpjPagamento)

  //   // Buscar no valoresPorPagador pelo CNPJ
  //   const valorEncontrado = valoresPorPagador.find((v) => {
  //     const cnpjPagador = normalizeCnpj(v.cnpj)
  //     return cnpjPagador === cnpjLimpo
  //   })

  //   if (valorEncontrado) {
  //     console.log(`[v0] Valor encontrado em valoresPorPagador: ${valorEncontrado.valor} para CNPJ ${cnpjLimpo}`)
  //     return valorEncontrado.valor
  //   }

  //   // Se não encontrou, tentar busca direta no mapa
  //   const entradasCredor = getEntradasCredor(credor)

  //   console.log(`[v0] getValorEsperado: CNPJ=${cnpjLimpo}, Credor=${credor.nome}, Entradas=${entradasCredor.length}`)

  //   // Log primeira entrada para debug
  //   if (entradasCredor.length > 0) {
  //     console.log(
  //       `[v0] Exemplo entrada mapa - pagadorCodigo: ${entradasCredor[0].pagadorCodigo}, valor: ${entradasCredor[0].valor}`,
  //     )
  //   }

  //   if (entradasCredor.length === 0) return 0

  //   // 1. Buscar pagador pelo CNPJ no cadastro
  //   const pagadorEncontrado = pagadores.find((p) => normalizeCnpj(p.documento) === cnpjLimpo)

  //   let entradas: typeof mapaLiquidacao = []

  //   if (pagadorEncontrado) {
  //     console.log(`[v0] Pagador encontrado: ${pagadorEncontrado.nome} (${pagadorEncontrado.codigo})`)

  //     // Buscar por código do pagador
  //     entradas = entradasCredor.filter((m) => extractCodigo(m.pagadorCodigo) === pagadorEncontrado.codigo)
  //     console.log(`[v0] Entradas por código: ${entradas.length}`)
  //   }

  //   // 2. Se não encontrou, buscar pelo CNPJ direto no pagadorCodigo
  //   if (entradas.length === 0) {
  //     entradas = entradasCredor.filter((m) => {
  //       const cnpjMapa = normalizeCnpj(m.pagadorCodigo)
  //       return cnpjMapa === cnpjLimpo || cnpjMapa.includes(cnpjLimpo) || cnpjLimpo.includes(cnpjMapa)
  //     })
  //     console.log(`[v0] Entradas por CNPJ direto: ${entradas.length}`)
  //   }

  //   if (entradas.length === 0) return 0

  //   const valorTotal = entradas.reduce((acc, m) => acc + (m.valor || 0), 0)
  //   console.log(`[v0] Valor esperado total: ${valorTotal}`)
  //   return valorTotal
  // }

  const confirmarImportacao = () => {
    if (importacaoPreview.length === 0) return

    adicionarEventoAuditoria(
      "importacao",
      `Iniciou importação de ${importacaoPreview.length} pagamento(s) do arquivo ${nomeArquivoSelecionado}`,
      undefined,
      {
        quantidade: importacaoPreview.length,
        tipoArquivo,
        nomeArquivo: nomeArquivoSelecionado,
      },
    )

    const processedPayments: { cnpj: string; valor: number; data: string }[] = []

    const novosPagamentos = importacaoPreview.map((p) => {
      const cnpjLimpo = normalizeCnpj(p.cnpj)
      const valorEsperado = getValorEsperadoPorCnpj(cnpjLimpo)
      const valorRecebido = Math.abs(p.valor || 0) // Use valorRecebido for comparison

      const codigoPagador = getCodigoPagadorByCnpj(cnpjLimpo)

      // Check for duplicates in existing pagamentos
      const existeDuplicadoNaLista = pagamentos.some(
        (pag) =>
          normalizeCnpj(pag.cnpj) === cnpjLimpo &&
          Math.abs((pag.valor || 0) - valorRecebido) < 0.01 &&
          pag.data === p.data,
      )

      // Check for duplicates within the current import batch
      const existeDuplicadoNoImport = processedPayments.some(
        (proc) => proc.cnpj === cnpjLimpo && Math.abs(proc.valor - valorRecebido) < 0.01 && proc.data === p.data,
      )

      // Add to processed list
      processedPayments.push({ cnpj: cnpjLimpo, valor: valorRecebido, data: p.data })

      // If duplicate found, mark as duplicado
      if (existeDuplicadoNaLista || existeDuplicadoNoImport) {
        return {
          ...p,
          valorEsperado,
          status: "duplicado" as const,
          tipo: "duplicado" as const,
          codigo: codigoPagador || p.codigo || `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        }
      }

      // Determine status based on values
      let status: Pagamento["status"] = "excecao"
      let tipo: Pagamento["tipo"] = "identificacao_incorreta"

      if (valorEsperado > 0) {
        const diff = Math.abs(valorRecebido - valorEsperado)
        if (diff < 0.01) {
          status = "conciliado"
          tipo = "igual"
        } else if (valorRecebido > valorEsperado) {
          status = "divergente"
          tipo = "valor_maior"
        } else {
          status = "divergente"
          tipo = "valor_menor"
        }
      } else {
        status = "excecao"
        tipo = "identificacao_incorreta"
      }

      // Check for atrasado/antecipado status only when conciliado
      if (status === "conciliado" && dataReferenciaMapa) {
        // Parse payment date safely to avoid timezone issues
        const dataStr = p.data
        const dataPagamento = dataStr.includes("T") ? new Date(dataStr) : new Date(dataStr + "T12:00:00")

        // Create reference date at noon to avoid timezone issues
        const dataRef = new Date(dataReferenciaMapa)

        // Compare only dates (year, month, day)
        const dataPagDia = new Date(dataPagamento.getFullYear(), dataPagamento.getMonth(), dataPagamento.getDate())
        const dataRefDia = new Date(dataRef.getFullYear(), dataRef.getMonth(), dataRef.getDate())

        if (dataPagDia.getTime() < dataRefDia.getTime()) {
          status = "antecipado"
          tipo = "antecipado"
        } else if (dataPagDia.getTime() > dataRefDia.getTime()) {
          status = "atrasado"
          tipo = "atrasado"
        }
      }

      return {
        ...p,
        valorEsperado,
        status,
        tipo,
        codigo: codigoPagador || p.codigo || `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      }
    })

    setPagamentos((prev) => [...prev, ...novosPagamentos])

    const statusCount = novosPagamentos.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    adicionarEventoAuditoria(
      "importacao",
      `Concluiu importação: ${Object.entries(statusCount)
        .map(([status, count]) => `${count} ${status}`)
        .join(", ")}`,
      undefined,
      {
        statusCount,
        total: novosPagamentos.length,
      },
    )

    setShowImportarArquivo(false)
    setImportacaoPreview([])
    setArquivoImportado(null)
    setNomeArquivoSelecionado("")
  }

  const handleCriarPagamento = () => {
    // Buscar nome do pagador pelo CNPJ
    const cnpjLimpo = novoPagamentoFormData.cnpj.replace(/\D/g, "")
    const pagadorEncontrado = pagadores.find((p) => p.cnpj.replace(/\D/g, "") === cnpjLimpo)

    // Parse valor from formatted string
    const valorRecebido = parseMoedaBRL(novoPagamentoFormData.valorFormatado)

    // Buscar valor esperado do mapa pelo CNPJ
    const valorEsperado = getValorEsperadoPorCnpj(cnpjLimpo)

    let dataISO = novoPagamentoFormData.data
    if (novoPagamentoFormData.data.includes("/")) {
      const partes = novoPagamentoFormData.data.split("/")
      if (partes.length === 3) {
        dataISO = `${partes[2]}-${partes[1]}-${partes[0]}`
      }
    }

    const isDuplicado = pagamentos.some((p) => {
      const cnpjExistente = p.cnpj.replace(/\D/g, "")
      const codigoExistente = p.codigo || ""
      return (
        cnpjExistente === cnpjLimpo && codigoExistente === novoPagamentoFormData.codigo && p.valor === valorRecebido
      )
    })

    let statusCalculado: Pagamento["status"] = isDuplicado
      ? "duplicado"
      : valorRecebido === valorEsperado && valorEsperado > 0
        ? "conciliado"
        : valorEsperado > 0
          ? "divergente"
          : "excecao"

    // Se conciliado, verificar se é antecipado ou atrasado com base na data de referência
    if (statusCalculado === "conciliado" && dataReferenciaMapa) {
      const dataPagamento = new Date(dataISO.includes("T") ? dataISO : `${dataISO}T12:00:00`)
      const dataReferencia = new Date(dataReferenciaMapa)
      // Comparar apenas as datas (ignorando horário)
      dataPagamento.setHours(12, 0, 0, 0)
      dataReferencia.setHours(12, 0, 0, 0)

      if (dataPagamento.getTime() < dataReferencia.getTime()) {
        statusCalculado = "antecipado"
      } else if (dataPagamento.getTime() > dataReferencia.getTime()) {
        statusCalculado = "atrasado"
      }
      // Se for igual, mantém como "conciliado"
    }

    const novoPagamento: Pagamento = {
      id: `PAG-${Date.now()}`,
      codigo: novoPagamentoFormData.codigo, // Nº ONS do formulário
      data: dataISO, // Usar data convertida
      pagador: pagadorEncontrado?.razaoSocial || "Pagador não identificado",
      cnpj: novoPagamentoFormData.cnpj,
      valor: valorRecebido,
      valorEsperado: valorEsperado,
      canal: "",
      banco: "",
      identificacao: "",
      status: statusCalculado,
      tipo: valorRecebido === valorEsperado ? "igual" : valorRecebido > valorEsperado ? "maior" : "menor",
      observacao: "",
      origem: "manual",
      formaPagamento: novoPagamentoFormData.formaPagamento,
      detalhes: {
        id: "",
        titulo: "",
        numeroONS: novoPagamentoFormData.codigo, // Nº ONS do formulário
        transmissora: "",
        valor: valorRecebido,
        dataEmissao: "",
        dataVencimento: "",
        dataPagamento: dataISO, // Usar data convertida
        formaPagamento: novoPagamentoFormData.formaPagamento,
        pagamentoParcialValor: 0,
        dataPagamentoParcial: "",
        valorFaltante: 0,
        jurosMulta: 0,
        valorFinal: valorRecebido,
        dataPagamentoRestante: "",
        chavePix: "",
        tipoChavePix: "",
        banco: "",
        agencia: "",
        conta: "",
        tipoConta: "",
        favorecido: "",
        cnpjFavorecido: "",
        codigoBarras: "",
        linhaDigitavel: "",
        status: statusCalculado,
      },
    }

    adicionarEventoAuditoria(
      "criacao_manual",
      `Criou pagamento manual para ${pagadorEncontrado?.razaoSocial || novoPagamentoFormData.cnpj}`,
      novoPagamento.id,
      {
        valor: novoPagamento.valor,
        cnpj: novoPagamento.cnpj,
        codigo: novoPagamento.codigo,
        formaPagamento: novoPagamento.formaPagamento,
      },
    )

    setPagamentos((prev) => [...prev, novoPagamento])
    setShowNovoPagamento(false)
    resetNovoPagamentoFormData()
  }

  const handleReconciliarAutomaticamente = () => {
    const totalAntes = pagamentos.length
    const statusAntes = pagamentos.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    adicionarEventoAuditoria(
      "conciliacao_automatica",
      `Iniciou conciliação automática de ${totalAntes} pagamento(s)`,
      undefined,
      {
        statusAntes,
      },
    )

    const novosPagamentos = pagamentos.map((p) => {
      // Skip already reconciled payments
      if (p.status === "conciliado") return p

      // Clean CNPJ from payment for comparison
      const cnpjPagamentoLimpo = p.cnpj.replace(/\D/g, "")

      if (!cnpjPagamentoLimpo) {
        return { ...p, status: "excecao" as const, tipo: "identificacao_incorreta" as const }
      }

      // Find pagador by CNPJ in cadastro
      const pagadorEncontrado = pagadores.find((pag) => pag.cnpj?.replace(/\D/g, "") === cnpjPagamentoLimpo)

      let entradasPagador: typeof mapaLiquidacao = []

      if (pagadorEncontrado) {
        // 1. Buscar por código do pagador
        entradasPagador = mapaLiquidacao.filter((m) => {
          const codigoPagador = m.pagadorCodigo?.split(/\s*[-–]\s*/)[0].trim() || ""
          return codigoPagador === pagadorEncontrado.codigo
        })
      }

      // 2. Se não encontrou, buscar pelo CNPJ diretamente no mapa
      if (entradasPagador.length === 0) {
        entradasPagador = mapaLiquidacao.filter((m) => {
          const mapaCnpj = m.pagadorCodigo?.replace(/\D/g, "") || ""
          return (
            mapaCnpj === cnpjPagamentoLimpo ||
            mapaCnpj.includes(cnpjPagamentoLimpo) ||
            cnpjPagamentoLimpo.includes(mapaCnpj)
          )
        })
      }

      // 3. Se ainda não encontrou, buscar em todas as entradas do credor pelo valor
      if (entradasPagador.length === 0) {
        const valorRecebido = Math.abs(p.valor)
        entradasPagador = mapaLiquidacao.filter((m) => {
          const valorMapa = m.valor || 0
          return Math.abs(valorMapa - valorRecebido) < 0.01
        })
      }

      if (entradasPagador.length === 0) {
        return { ...p, status: "excecao" as const, tipo: "identificacao_incorreta" as const }
      }

      // Sum all expected values for this pagador (valor a pagar)
      const valorEsperadoTotal = entradasPagador.reduce((acc, m) => acc + (m.valor || 0), 0)
      const valorRecebido = Math.abs(p.valor)

      // Compare values with tolerance of 0.01
      const diferenca = Math.abs(valorRecebido - valorEsperadoTotal)
      const tolerancia = 0.01

      if (diferenca <= tolerancia) {
        let status = "conciliado" as const
        let tipo = "igual" as const

        // Check for atrasado/antecipado status only when conciliado
        if (status === "conciliado" && dataReferenciaMapa) {
          const dataPagamento = new Date(p.data.includes("T") ? p.data : p.data + "T12:00:00")
          const dataReferencia = new Date(dataReferenciaMapa)
          dataPagamento.setHours(12, 0, 0, 0)
          dataReferencia.setHours(12, 0, 0, 0)

          if (dataPagamento.getTime() < dataReferencia.getTime()) {
            status = "antecipado"
            tipo = "antecipado"
          } else if (dataPagamento.getTime() > dataReferencia.getTime()) {
            status = "atrasado"
            tipo = "atrasado"
          }
        }

        return {
          ...p,
          valorEsperado: valorEsperadoTotal,
          status,
          tipo,
          valorConciliado: valorRecebido,
        }
      } else if (valorRecebido > valorEsperadoTotal) {
        return {
          ...p,
          valorEsperado: valorEsperadoTotal,
          status: "divergente" as const,
          tipo: "valor_maior" as const,
        }
      } else {
        return {
          ...p,
          valorEsperado: valorEsperadoTotal,
          status: "divergente" as const,
          tipo: "valor_menor" as const,
        }
      }
    })

    setPagamentos(novosPagamentos)

    const statusDepois = novosPagamentos.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const conciliadosNovos = (statusDepois.conciliado || 0) - (statusAntes.conciliado || 0)

    adicionarEventoAuditoria(
      "conciliacao_automatica",
      `Concluiu conciliação automática: ${conciliadosNovos} pagamento(s) conciliados`,
      undefined,
      {
        statusDepois,
        conciliadosNovos,
      },
    )
  }

  const exportarRelatorioAuditoria = () => {
    const csvContent = [
      ["Timestamp", "Usuário", "Ação", "Descrição", "Pagamento ID", "Detalhes"].join(";"),
      ...auditoriaEventos.map((evento) =>
        [
          new Date(evento.timestamp).toLocaleString("pt-BR"),
          evento.usuario,
          evento.acao,
          evento.descricao,
          evento.pagamentoId || "",
          JSON.stringify(evento.detalhes || {}),
        ].join(";"),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `auditoria-conciliacao-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  const getAcaoBadgeVariant = (acao: AuditoriaEvento["acao"]) => {
    switch (acao) {
      case "importacao":
        return "default"
      case "conciliacao_manual":
      case "conciliacao_automatica":
        return "default"
      case "exclusao":
        return "destructive"
      case "criacao_manual":
        return "secondary"
      case "edicao":
        return "outline"
      case "analise_excecao":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatarAcaoLabel = (acao: AuditoriaEvento["acao"]) => {
    const labels = {
      importacao: "Importação",
      conciliacao_manual: "Conciliação Manual",
      conciliacao_automatica: "Conciliação Automática",
      exclusao: "Exclusão",
      criacao_manual: "Criação Manual",
      edicao: "Edição",
      analise_excecao: "Análise de Exceção",
    }
    return labels[acao] || acao
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Conciliador Inteligente</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAuditoria(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Trilha de Auditoria ({auditoriaEventos.length})
          </Button>
          <Button variant="outline" onClick={() => setShowNovoPagamento(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
          <Button variant="outline" onClick={() => setShowImportarArquivo(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar Arquivo
          </Button>
          <Button onClick={handleReconciliarAutomaticamente}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Reconciliar Automaticamente
          </Button>
        </div>
      </div>

      {/* Seleção de Credor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Selecionar Credor
          </CardTitle>
          <CardDescription>Busque e selecione um credor para visualizar os valores a receber</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Digite pelo menos 3 caracteres para buscar..."
                value={buscaCredor}
                onChange={(e) => setBuscaCredor(e.target.value)}
                className="pl-9"
              />
            </div>
            {buscaCredor.length < 3 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Digite pelo menos 3 caracteres para buscar credores
              </div>
            ) : credoresFiltrados.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum credor encontrado para "{buscaCredor}"
              </div>
            ) : (
              <div className="border rounded-md max-h-64 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-24">Código</TableHead>
                      <TableHead>Agente</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-40">CNPJ</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credoresFiltrados.map((credor) => (
                      <TableRow
                        key={credor.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          credorSelecionado?.id === credor.id && "bg-primary/10",
                        )}
                        onClick={() => setCredorSelecionado(credor)}
                      >
                        <TableCell className="font-medium">{credor.codigo}</TableCell>
                        <TableCell>{credor.agente}</TableCell>
                        <TableCell>{credor.nome}</TableCell>
                        <TableCell>{credor.documento}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={credorSelecionado?.id === credor.id ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCredorSelecionado(credor)
                            }}
                          >
                            {credorSelecionado?.id === credor.id ? "Selecionado" : "Selecionar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {credorSelecionado && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Credor selecionado:</span> {credorSelecionado.codigo} -{" "}
                {credorSelecionado.nome}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Valores a Receber por Pagador */}
      {credorSelecionado && valoresPorPagador.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Valor a Receber por Pagador - Avisos de Crédito (AVC)
                {dataReferenciaMapa && (
                  <Badge variant="outline" className="ml-2 font-normal">
                    Ref: {format(dataReferenciaMapa, "MMMM/yyyy", { locale: ptBR })}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Valores que o credor {credorSelecionado.nome} deve receber de cada pagador
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setMostrarValoresPagador(!mostrarValoresPagador)}>
              {mostrarValoresPagador ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CardHeader>
          {mostrarValoresPagador && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead className="text-right">Valor a Pagar</TableHead>
                    <TableHead className="text-right">Valor Conciliado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valoresPorPagador.map((v, idx) => (
                    <React.Fragment key={idx}>
                      <TableRow className={v.itensAgrupados && v.itensAgrupados.length > 1 ? "bg-amber-50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {v.itensAgrupados && v.itensAgrupados.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleLinhaExpandida(v.codigo)}
                              >
                                {linhasExpandidas.has(v.codigo) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <span className="font-mono">{v.codigo}</span>
                            {v.itensAgrupados && v.itensAgrupados.length > 1 && (
                              <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                                {v.itensAgrupados.length} agrupados
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{v.razaoSocial}</TableCell>
                        <TableCell>{v.cnpj}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {(v.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          R$ {(v.valorConciliado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                      {v.itensAgrupados &&
                        v.itensAgrupados.length > 1 &&
                        linhasExpandidas.has(v.codigo) &&
                        v.itensAgrupados.map((item, itemIdx) => (
                          <TableRow key={`${idx}-${itemIdx}`} className="bg-gray-50 text-sm">
                            <TableCell className="pl-12 text-muted-foreground">↳ {item.nome}</TableCell>
                            <TableCell className="text-muted-foreground">{item.razaoSocial}</TableCell>
                            <TableCell className="text-muted-foreground">{item.cnpj}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              R$ {(item.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            {/* CHANGE: Exibir valorConciliado de cada item agrupado */}
                            <TableCell className="text-right text-green-600">
                              R$ {(item.valorConciliado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      R$ {(totalValoresPagadores || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      R$ {(totalValoresConciliados || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          )}
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              R$ {totais.totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R${" "}
              {credorSelecionado
                ? totalValoresPagadores.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                : totais.totalEsperado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            {credorSelecionado && (
              <p className="text-xs text-muted-foreground">{valoresPorPagador.length} pagador(es)</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conciliados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totais.conciliados}</p>
            <p className="text-xs text-muted-foreground">de {totais.total} pagamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Divergentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{totais.divergentes}</p>
            <p className="text-xs text-muted-foreground">de {totais.total} pagamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Exceções</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{totais.excecoes}</p>
            <p className="text-xs text-muted-foreground">de {totais.total} pagamentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Resumo e Filtros da Tabela de Pagamentos Recebidos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pagamentos Recebidos
              </CardTitle>
              <CardDescription>Lista de pagamentos importados e cadastrados</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowImportarArquivo(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importar Arquivo
              </Button>
              <Button variant="outline" onClick={() => setShowNovoPagamento(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pagamento
              </Button>
              {/* CHANGE: Removed "Conciliar Automaticamente" button */}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por pagador..."
                value={filtroPagador}
                onChange={(e) => setFiltroPagador(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as typeof filtroStatus)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="conciliado">Conciliados</SelectItem>
                <SelectItem value="divergente">Divergentes</SelectItem>
                <SelectItem value="excecao">Exceções</SelectItem>
                <SelectItem value="duplicado">Duplicados</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
                <SelectItem value="antecipado">Antecipados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroOrigem} onValueChange={(v) => setFiltroOrigem(v as typeof filtroOrigem)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Origens</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="importacao">Importação</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="sincronismo">Sincronismo</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">De:</span>
              <DateInputBrazilian value={filtroDataInicio} onChange={setFiltroDataInicio} className="w-36" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Até:</span>
              <DateInputBrazilian value={filtroDataFim} onChange={setFiltroDataFim} className="w-36" />
            </div>
            {(filtroStatus !== "todos" ||
              filtroOrigem !== "todos" ||
              filtroDataInicio ||
              filtroDataFim ||
              filtroPagador) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroStatus("todos")
                  setFiltroOrigem("todos")
                  setFiltroDataInicio("")
                  setFiltroDataFim("")
                  setFiltroPagador("")
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            {pagamentosFiltrados.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setShowRemoverTodos(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {pagamentosFiltrados.length === pagamentos.length
                  ? "Remover Todos"
                  : `Remover ${pagamentosFiltrados.length} Filtrados`}
              </Button>
            )}
          </div>
          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground mt-2">
            Exibindo {pagamentosFiltrados.length} de {pagamentos.length} pagamentos
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("codigo")}>
                  <div className="flex items-center">
                    Código
                    <SortIcon column="codigo" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("data")}>
                  <div className="flex items-center">
                    Data
                    <SortIcon column="data" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("pagador")}>
                  <div className="flex items-center">
                    Pagador
                    <SortIcon column="pagador" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("cnpj")}>
                  <div className="flex items-center">
                    CNPJ
                    <SortIcon column="cnpj" />
                  </div>
                </TableHead>
                <TableHead className="text-right cursor-pointer hover:bg-muted/50" onClick={() => handleSort("valor")}>
                  <div className="flex items-center justify-end">
                    Valor Recebido
                    <SortIcon column="valor" />
                  </div>
                </TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("valorEsperado")}
                >
                  <div className="flex items-center justify-end">
                    Valor Esperado
                    <SortIcon column="valorEsperado" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    <SortIcon column="status" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("tipo")}>
                  <div className="flex items-center">
                    Tipo
                    <SortIcon column="tipo" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("formaPagamento")}>
                  <div className="flex items-center">
                    Forma Pgto
                    <SortIcon column="formaPagamento" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("origem")}>
                  <div className="flex items-center">
                    Origem
                    <SortIcon column="origem" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("banco")}>
                  <div className="flex items-center">
                    Banco
                    <SortIcon column="banco" />
                  </div>
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentosFiltrados.map((pagamento) => (
                <TableRow
                  key={pagamento.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setPagamentoSelecionado(pagamento)
                    setDetalhesEditados(
                      pagamento.detalhes || {
                        id: pagamento.id,
                        titulo: "",
                        numeroONS: pagamento.codigo || "",
                        transmissora: pagamento.pagador,
                        valor: pagamento.valorEsperado,
                        dataEmissao: "",
                        dataVencimento: "",
                        dataPagamento: pagamento.data.split(" ")[0],
                        formaPagamento:
                          pagamento.formaPagamento ||
                          (pagamento.canal.toLowerCase() as "pix" | "ted" | "boleto" | "transferencia" | ""),
                        pagamentoParcialValor: pagamento.valor < pagamento.valorEsperado ? pagamento.valor : 0,
                        dataPagamentoParcial:
                          pagamento.valor < pagamento.valorEsperado ? pagamento.data.split(" ")[0] : "",
                        valorFaltante: Math.max(0, pagamento.valorEsperado - pagamento.valor),
                        jurosMulta:
                          pagamento.valor > pagamento.valorEsperado ? pagamento.valor - pagamento.valorEsperado : 0,
                        valorFinal: pagamento.valorEsperado,
                        dataPagamentoRestante: "",
                        tratativas: [],
                        anexos: [],
                        banco: pagamento.banco,
                        agencia: "",
                        conta: "",
                        tipoConta: "",
                        favorecido: pagamento.pagador,
                        cnpjFavorecido: pagamento.cnpj,
                        chavePix: "",
                        tipoChavePix: "",
                        codigoBarras: "",
                        linhaDigitavel: "",
                        status: pagamento.status,
                      },
                    )
                    setShowDetalhes(true)
                  }}
                >
                  <TableCell className="font-mono text-sm">
                    {pagamento.codigo || getCodigoPagadorByCnpj(pagamento.cnpj)}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      pagamento.data.includes("T") ? pagamento.data : pagamento.data + "T12:00:00",
                    ).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{pagamento.pagador}</TableCell>
                  <TableCell>{pagamento.cnpj}</TableCell>
                  <TableCell className="text-right">
                    R$ {(pagamento.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {(pagamento.valorEsperado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                  <TableCell>{getTipoBadge(pagamento.tipo)}</TableCell>
                  <TableCell>{getFormaPagamentoBadge(pagamento.formaPagamento)}</TableCell>
                  <TableCell>{getOrigemBadge(pagamento.origem)}</TableCell>
                  <TableCell>{pagamento.banco || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AlertDialog
                        open={pagamentoParaRemover === pagamento.id}
                        onOpenChange={(open) => !open && setPagamentoParaRemover(null)}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoverPagamento(pagamento.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este pagamento? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={confirmarRemocao}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise de Exceções e Divergências - movida para após Pagamentos Recebidos */}
      {pagamentos.filter((p) => ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status))
        .length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Análise de Exceções, Divergências, Atrasos, Antecipações e Duplicados
                </CardTitle>
                <CardDescription>
                  Itens que necessitam de revisão manual - {excecoesFiltradas.length} de{" "}
                  {
                    pagamentos.filter((p) =>
                      ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }{" "}
                  pendente(s)
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <Select
                value={filtroExcecaoTipo}
                onValueChange={(v) => setFiltroExcecaoTipo(v as typeof filtroExcecaoTipo)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="maior">Valor Maior</SelectItem>
                  <SelectItem value="menor">Valor Menor</SelectItem>
                  <SelectItem value="fracionado">Fracionado</SelectItem>
                  <SelectItem value="identificacao_incorreta">Identificação Incorreta</SelectItem>
                  <SelectItem value="valor_maior">Valor Maior (Divergência)</SelectItem>
                  <SelectItem value="valor_menor">Valor Menor (Divergência)</SelectItem>
                  <SelectItem value="duplicado">Duplicado</SelectItem>
                  <SelectItem value="antecipado">Antecipado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filtroExcecaoOrigem}
                onValueChange={(v) => setFiltroExcecaoOrigem(v as typeof filtroExcecaoOrigem)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Origens</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="importacao">Importação</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="sincronismo">Sincronismo</SelectItem>
                </SelectContent>
              </Select>
              {(filtroExcecaoTipo !== "todos" || filtroExcecaoOrigem !== "todos") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroExcecaoTipo("todos")
                    setFiltroExcecaoOrigem("todos")
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resumo por Tipo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "maior"
                    ? "bg-yellow-200 dark:bg-yellow-800 border-yellow-400"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "maior" ? "todos" : "maior")}
              >
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Valor Maior</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        (p.tipo === "maior" || p.tipo === "valor_maior") &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "menor"
                    ? "bg-orange-200 dark:bg-orange-800 border-orange-400"
                    : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "menor" ? "todos" : "menor")}
              >
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Valor Menor</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        (p.tipo === "menor" || p.tipo === "valor_menor") &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "fracionado"
                    ? "bg-blue-200 dark:bg-blue-800 border-blue-400"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "fracionado" ? "todos" : "fracionado")}
              >
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Fracionado</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        p.tipo === "fracionado" &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "identificacao_incorreta"
                    ? "bg-red-200 dark:bg-red-800 border-red-400"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
                }`}
                onClick={() =>
                  setFiltroExcecaoTipo(
                    filtroExcecaoTipo === "identificacao_incorreta" ? "todos" : "identificacao_incorreta",
                  )
                }
              >
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Identificação Incorreta</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        p.tipo === "identificacao_incorreta" &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              {/* Added stats for new types */}
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "valor_maior"
                    ? "bg-yellow-200 dark:bg-yellow-800 border-yellow-400"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "valor_maior" ? "todos" : "valor_maior")}
              >
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Valor Maior (Divergência)</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        p.tipo === "valor_maior" &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "valor_menor"
                    ? "bg-orange-200 dark:bg-orange-800 border-orange-400"
                    : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "valor_menor" ? "todos" : "valor_menor")}
              >
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Valor Menor (Divergência)</p>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        p.tipo === "valor_menor" &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "duplicado"
                    ? "bg-purple-200 dark:bg-purple-800 border-purple-400"
                    : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "duplicado" ? "todos" : "duplicado")}
              >
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Duplicado</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        p.tipo === "duplicado" &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "antecipado"
                    ? "bg-green-200 dark:bg-green-800 border-green-400"
                    : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "antecipado" ? "todos" : "antecipado")}
              >
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Antecipado</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        (p.status === "antecipado" || p.tipo === "antecipado") &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  filtroExcecaoTipo === "atrasado"
                    ? "bg-red-200 dark:bg-red-800 border-red-400"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40"
                }`}
                onClick={() => setFiltroExcecaoTipo(filtroExcecaoTipo === "atrasado" ? "todos" : "atrasado")}
              >
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Atrasado</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {
                    pagamentos.filter(
                      (p) =>
                        (p.status === "atrasado" || p.tipo === "atrasado") &&
                        ["divergente", "excecao", "duplicado", "atrasado", "antecipado"].includes(p.status),
                    ).length
                  }
                </p>
              </div>
            </div>

            {/* Lista de Itens Pendentes */}
            <div className="space-y-3">
              {excecoesFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item encontrado com os filtros selecionados
                </div>
              ) : (
                excecoesFiltradas.map((pagamento) => {
                  const getTipoInfo = (tipo: string) => {
                    switch (tipo) {
                      case "igual":
                        return { label: "Valor Correto", color: "text-green-600 bg-green-100 dark:bg-green-900/30" }
                      case "maior":
                        return {
                          label: "Valor maior que o esperado",
                          color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
                        }
                      case "menor":
                        return {
                          label: "Valor menor que o esperado",
                          color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
                        }
                      case "fracionado":
                        return { label: "Pagamento fracionado", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" }
                      case "antecipado":
                        return {
                          label: "Pagamento antecipado",
                          color: "text-green-600 bg-green-100 dark:bg-green-900/30",
                        }
                      case "atrasado":
                        return { label: "Pagamento atrasado", color: "text-red-600 bg-red-100 dark:bg-red-900/30" }
                      case "identificacao_incorreta":
                        return { label: "Identificação incorreta", color: "text-red-600 bg-red-100 dark:bg-red-900/30" }
                      case "canal_diferente":
                        return {
                          label: "Canal diferente",
                          color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
                        }
                      case "valor_maior": // Added cases for new types
                        return {
                          label: "Valor Maior",
                          color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
                        }
                      case "valor_menor": // Added cases for new types
                        return {
                          label: "Valor Menor",
                          color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
                        }
                      case "duplicado": // Added case for "duplicado"
                        return {
                          label: "Pagamento Duplicado",
                          color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
                        }
                      default:
                        return { label: "Pendente de análise", color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30" }
                    }
                  }

                  const tipoInfo = getTipoInfo(pagamento.tipo)
                  const diferenca = (pagamento.valor || 0) - (pagamento.valorEsperado || 0)

                  return (
                    <div
                      key={pagamento.id}
                      className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pagamento.pagador}</span>
                            <Badge className={tipoInfo.color} variant="outline">
                              {tipoInfo.label}
                            </Badge>
                            <Badge
                              variant={
                                pagamento.status === "divergente"
                                  ? "outline"
                                  : pagamento.status === "duplicado"
                                    ? "secondary"
                                    : pagamento.status === "antecipado"
                                      ? "success"
                                      : pagamento.status === "atrasado"
                                        ? "destructive"
                                        : "outline"
                              }
                            >
                              {pagamento.status === "divergente"
                                ? "Divergente"
                                : pagamento.status === "duplicado"
                                  ? "Duplicado"
                                  : pagamento.status === "antecipado"
                                    ? "Antecipado"
                                    : pagamento.status === "atrasado"
                                      ? "Atrasado"
                                      : "Exceção"}
                            </Badge>
                            {/* Na análise de exceções, adicionar forma de pagamento na grid de informações */}
                            {getFormaPagamentoBadge(pagamento.formaPagamento)}
                            {getOrigemBadge(pagamento.origem)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Valor Esperado:</span>
                              <p className="font-medium">
                                R${" "}
                                {(pagamento.valorEsperado || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Valor Recebido:</span>
                              <p className="font-medium">
                                R$ {(pagamento.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Diferença:</span>
                              <p
                                className={`font-medium ${diferenca > 0 ? "text-green-600" : diferenca < 0 ? "text-red-600" : ""}`}
                              >
                                {diferenca > 0 ? "+" : ""}R${" "}
                                {diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Data:</span>
                              <p className="font-medium">
                                {pagamento.data ? new Date(pagamento.data).toLocaleDateString("pt-BR") : "-"}
                              </p>
                            </div>
                          </div>
                          {pagamento.observacao && (
                            <p className="text-sm text-muted-foreground italic">Obs: {pagamento.observacao}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => abrirDetalhes(pagamento)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Analisar
                          </Button>
                          {/* CHANGE: Habilitando botão que abre modal de conciliação ao invés de mudar status diretamente */}
                          <Button size="sm" variant="default" onClick={() => abrirConciliarModal(pagamento)}>
                            <Check className="h-4 w-4 mr-1" />
                            Conciliar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Totais da Análise */}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Esperado (Filtrados)</p>
                  <p className="text-lg font-bold">
                    R${" "}
                    {excecoesFiltradas
                      .reduce((acc, p) => acc + (p.valorEsperado || 0), 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Recebido (Filtrados)</p>
                  <p className="text-lg font-bold">
                    R${" "}
                    {excecoesFiltradas
                      .reduce((acc, p) => acc + (p.valor || 0), 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Diferença Total (Filtrados)</p>
                  {(() => {
                    const diferencaTotal = excecoesFiltradas.reduce(
                      (acc, p) => acc + ((p.valor || 0) - (p.valorEsperado || 0)),
                      0,
                    )
                    return (
                      <p
                        className={`text-lg font-bold ${diferencaTotal > 0 ? "text-green-600" : diferencaTotal < 0 ? "text-red-600" : ""}`}
                      >
                        {diferencaTotal > 0 ? "+" : ""}R${" "}
                        {diferencaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Pagamento */}
      <Dialog open={showDetalhes} onOpenChange={setShowDetalhes}>
        <DialogContent
          className="overflow-y-auto"
          style={{ maxWidth: "95vw", width: "95vw", maxHeight: "95vh", height: "95vh" }}
        >
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>Visualize e edite os detalhes do pagamento selecionado</DialogDescription>
          </DialogHeader>

          {detalhesEditados && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Status do Pagamento</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={(detalhesEditados as any).status || pagamentoSelecionado?.status || "excecao"}
                      onValueChange={(v) =>
                        setDetalhesEditados({
                          ...detalhesEditados,
                          status: v as
                            | "conciliado"
                            | "divergente"
                            | "excecao"
                            | "duplicado"
                            | "atrasado"
                            | "antecipado", // Added atrasado and antecipado
                        } as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conciliado">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Conciliado
                          </div>
                        </SelectItem>
                        <SelectItem value="divergente">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Divergente
                          </div>
                        </SelectItem>
                        <SelectItem value="excecao">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            Exceção
                          </div>
                        </SelectItem>
                        <SelectItem value="duplicado">
                          <div className="flex items-center gap-2">
                            <Copy className="h-4 w-4 text-purple-600" />
                            Duplicado
                          </div>
                        </SelectItem>
                        <SelectItem value="antecipado">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            Antecipado
                          </div>
                        </SelectItem>
                        <SelectItem value="atrasado">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-red-600" />
                            Atrasado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-end">
                    {(detalhesEditados as any).status === "conciliado" && (
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Pagamento Conciliado
                      </Badge>
                    )}
                    {(detalhesEditados as any).status === "divergente" && (
                      <Badge className="bg-warning text-warning-foreground">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Valor Divergente
                      </Badge>
                    )}
                    {(detalhesEditados as any).status === "excecao" && (
                      <Badge variant="outline" className="border-destructive text-destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Requer Análise
                      </Badge>
                    )}
                    {(detalhesEditados as any).status === "duplicado" && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        <Copy className="h-3 w-3 mr-1" />
                        Pagamento Duplicado
                      </Badge>
                    )}
                    {(detalhesEditados as any).status === "antecipado" && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pagamento Antecipado
                      </Badge>
                    )}
                    {(detalhesEditados as any).status === "atrasado" && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pagamento Atrasado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Dados do Título */}
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Título</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={detalhesEditados.titulo}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, titulo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Nº ONS</Label>
                    <Input
                      value={detalhesEditados.numeroONS}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, numeroONS: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Transmissora</Label>
                    <Input
                      value={detalhesEditados.transmissora}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, transmissora: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Valores e Datas */}
              <div className="space-y-4">
                <h3 className="font-semibold">Valores e Datas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={detalhesEditados.valor}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, valor: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Data Emissão</Label>
                    <DateInputBrazilian
                      value={detalhesEditados.dataEmissao}
                      onChange={(v) => setDetalhesEditados({ ...detalhesEditados, dataEmissao: v })}
                    />
                  </div>
                  <div>
                    <Label>Data Vencimento</Label>
                    <DateInputBrazilian
                      value={detalhesEditados.dataVencimento}
                      onChange={(v) => setDetalhesEditados({ ...detalhesEditados, dataVencimento: v })}
                    />
                  </div>
                  <div>
                    <Label>Data Pagamento</Label>
                    <DateInputBrazilian
                      value={detalhesEditados.dataPagamento}
                      onChange={(v) => setDetalhesEditados({ ...detalhesEditados, dataPagamento: v })}
                    />
                  </div>
                  <div>
                    <Label>Juros/Multa</Label>
                    <Input
                      type="number"
                      value={detalhesEditados.jurosMulta}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, jurosMulta: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Valor Final</Label>
                    <Input
                      type="number"
                      value={detalhesEditados.valorFinal}
                      onChange={(e) => setDetalhesEditados({ ...detalhesEditados, valorFinal: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Pagamento Parcial */}
              <div className="space-y-4">
                <h3 className="font-semibold">Pagamento Parcial</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Valor Parcial</Label>
                    <Input
                      type="number"
                      value={detalhesEditados.pagamentoParcialValor}
                      onChange={(e) =>
                        setDetalhesEditados({
                          ...detalhesEditados,
                          pagamentoParcialValor: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Data Pagamento Parcial</Label>
                    <DateInputBrazilian
                      value={detalhesEditados.dataPagamentoParcial}
                      onChange={(v) => setDetalhesEditados({ ...detalhesEditados, dataPagamentoParcial: v })}
                    />
                  </div>
                  <div>
                    <Label>Valor Faltante</Label>
                    <Input
                      type="number"
                      value={detalhesEditados.valorFaltante}
                      onChange={(e) =>
                        setDetalhesEditados({ ...detalhesEditados, valorFaltante: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Data Pagamento Restante</Label>
                    <DateInputBrazilian
                      value={detalhesEditados.dataPagamentoRestante}
                      onChange={(v) => setDetalhesEditados({ ...detalhesEditados, dataPagamentoRestante: v })}
                    />
                  </div>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-4">
                <h3 className="font-semibold">Forma de Pagamento</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Forma</Label>
                    <Select
                      value={detalhesEditados.formaPagamento}
                      onValueChange={(v) =>
                        setDetalhesEditados({
                          ...detalhesEditados,
                          formaPagamento: v as "pix" | "ted" | "boleto" | "transferencia" | "", // Added "transferencia"
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="ted">TED</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tratativas */}
              <div className="space-y-4">
                <h3 className="font-semibold">Tratativas</h3>
                <div className="space-y-2">
                  {(detalhesEditados.tratativas || []).map((tratativa, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{tratativa.usuario}</p>
                          <p className="text-xs text-muted-foreground">{tratativa.data}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const novasTratativas = detalhesEditados.tratativas.filter((_, i) => i !== idx)
                            setDetalhesEditados({ ...detalhesEditados, tratativas: novasTratativas })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm mt-2">{tratativa.descricao}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Nova tratativa..."
                    value={novaTratativa}
                    onChange={(e) => setNovaTratativa(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (novaTratativa.trim()) {
                        const novasTratativas = [
                          ...(detalhesEditados.tratativas || []),
                          {
                            data: new Date().toLocaleDateString("pt-BR"),
                            usuario: "Super Admin",
                            descricao: novaTratativa,
                          },
                        ]
                        setDetalhesEditados({ ...detalhesEditados, tratativas: novasTratativas })
                        setNovaTratativa("")
                      }
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Anexos */}
              <div className="space-y-4">
                <h3 className="font-semibold">Anexos</h3>
                <div className="space-y-2">
                  {(detalhesEditados.anexos || []).map((anexo, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{anexo.nome}</span>
                        <span className="text-xs text-muted-foreground">({anexo.tamanho})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const novosAnexos = detalhesEditados.anexos.filter((_, i) => i !== idx)
                          setDetalhesEditados({ ...detalhesEditados, anexos: novosAnexos })
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Anexo
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetalhes(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarDetalhes}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Relatório */}
      <Dialog open={showRelatorio} onOpenChange={setShowRelatorio}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatório de Conciliação</DialogTitle>
            <DialogDescription>Detalhes do pagamento para relatório</DialogDescription>
          </DialogHeader>

          {relatorioSelecionado && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Pagador</Label>
                  <p className="font-medium">{relatorioSelecionado.pagador}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CNPJ</Label>
                  <p className="font-medium">{relatorioSelecionado.cnpj}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Data</Label>
                  <p className="font-medium">{relatorioSelecionado.data}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-medium capitalize">{relatorioSelecionado.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Recebido</Label>
                  <p className="font-medium text-green-600">
                    {relatorioSelecionado.valorRecebido.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Esperado</Label>
                  <p className="font-medium">
                    {relatorioSelecionado.valorEsperado.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRelatorio(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Pagamento */}
      <Dialog open={showNovoPagamento} onOpenChange={setShowNovoPagamento}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pagamento Manual</DialogTitle>
            <DialogDescription>Inserir dados do extrato bancário ou CNAB</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nº ONS</Label>
              <Input
                placeholder="Ex: 4557"
                value={novoPagamentoFormData.codigo}
                onChange={(e) => setNovoPagamentoFormData({ ...novoPagamentoFormData, codigo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                placeholder="00.000.000/0000-00"
                value={novoPagamentoFormData.cnpj}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  let formatted = value
                  if (value.length > 2) formatted = value.slice(0, 2) + "." + value.slice(2)
                  if (value.length > 5) formatted = formatted.slice(0, 6) + "." + value.slice(5)
                  if (value.length > 8) formatted = formatted.slice(0, 10) + "/" + value.slice(8)
                  if (value.length > 12) formatted = formatted.slice(0, 15) + "-" + value.slice(12, 14)
                  setNovoPagamentoFormData({ ...novoPagamentoFormData, cnpj: formatted })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Data do Pagamento</Label>
              <Popover open={calendarNovoPagamentoOpen} onOpenChange={setCalendarNovoPagamentoOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {novoPagamentoFormData.data || "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      novoPagamentoFormData.data
                        ? (() => {
                            const [dia, mes, ano] = novoPagamentoFormData.data.split("/")
                            return new Date(
                              Number.parseInt(ano),
                              Number.parseInt(mes) - 1,
                              Number.parseInt(dia),
                              12,
                              0,
                              0,
                            )
                          })()
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        const dia = String(date.getDate()).padStart(2, "0")
                        const mes = String(date.getMonth() + 1).padStart(2, "0")
                        const ano = date.getFullYear()
                        setNovoPagamentoFormData((prev) => ({ ...prev, data: `${dia}/${mes}/${ano}` }))
                      }
                      setCalendarNovoPagamentoOpen(false)
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Valor Recebido</Label>
              <Input
                placeholder="R$ 0,00"
                value={novoPagamentoFormData.valorFormatado}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, "")
                  setNovoPagamentoFormData({ ...novoPagamentoFormData, valorFormatado: value })
                }}
              />
              <p className="text-xs text-muted-foreground">
                O valor esperado será obtido automaticamente do mapa de liquidação
              </p>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={novoPagamentoFormData.formaPagamento}
                onValueChange={(v) =>
                  setNovoPagamentoFormData({
                    ...novoPagamentoFormData,
                    formaPagamento: v as "pix" | "ted" | "boleto" | "transferencia" | "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="ted">TED</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoPagamento(false)}>
              Cancelar
            </Button>
            <Button
              onClick={salvarNovoPagamento}
              disabled={
                !novoPagamentoFormData.cnpj ||
                !novoPagamentoFormData.data ||
                !novoPagamentoFormData.valorFormatado ||
                !novoPagamentoFormData.formaPagamento
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Importar Arquivo */}
      <Dialog open={showImportarArquivo} onOpenChange={setShowImportarArquivo}>
        <DialogContent
          className="overflow-y-auto"
          style={{ maxWidth: "95vw", width: "95vw", maxHeight: "90vh", height: "auto" }}
        >
          <DialogHeader>
            <DialogTitle>Importar Arquivo Bancário</DialogTitle>
            <DialogDescription>Importe arquivos CNAB, OFX ou CSV</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Arquivo</Label>
                <Select value={tipoArquivo} onValueChange={(v) => setTipoArquivo(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnab240">CNAB 240</SelectItem>
                    <SelectItem value="cnab400">CNAB 400</SelectItem>
                    <SelectItem value="ofx">OFX</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Arquivo</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={importFileRef}
                    accept=".ret,.txt,.ofx,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setArquivoImportado(file)
                        setNomeArquivoSelecionado(file.name)
                        handleImportarArquivo(e) // Pass the event to the handler
                      }
                    }}
                  />
                  <div
                    className="flex-1 flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => importFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {nomeArquivoSelecionado || "Escolher Arquivo"}
                    </span>
                  </div>
                  <Button variant="outline" onClick={() => importFileRef.current?.click()}>
                    Selecionar
                  </Button>
                </div>
              </div>
            </div>

            {importacaoPreview.length > 0 && (
              <div className="space-y-2">
                <Label>Preview ({importacaoPreview.length} registros)</Label>
                <div className="border rounded-lg max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº ONS</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Pagador</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importacaoPreview.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.codigo || "-"}</TableCell>
                          <TableCell>{p.data}</TableCell>
                          <TableCell>{p.pagador}</TableCell>
                          <TableCell>{p.cnpj}</TableCell>
                          <TableCell>
                            {(p.valorRecebido || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportarArquivo(false)
                setImportacaoPreview([])
                setArquivoImportado(null)
                setNomeArquivoSelecionado("")
              }}
            >
              Cancelar
            </Button>
            <Button onClick={confirmarImportacao} disabled={importacaoPreview.length === 0}>
              Confirmar Importação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de remoção */}
      <AlertDialog open={!!pagamentoParaRemover} onOpenChange={() => setPagamentoParaRemover(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarRemocao}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de remoção de todos */}
      <AlertDialog open={showRemoverTodos} onOpenChange={setShowRemoverTodos}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Todos os Pagamentos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover todos os {pagamentos.length} pagamentos? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPagamentos([])
                setShowRemoverTodos(false)
              }}
            >
              Remover Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Conciliação Manual */}
      <Dialog open={showConciliarModal} onOpenChange={setShowConciliarModal}>
        <DialogContent
          className="flex flex-col p-0"
          style={{
            width: "calc(100vw - 2rem)",
            maxWidth: "calc(100vw - 2rem)",
            height: "calc(100vh - 2rem)",
            maxHeight: "calc(100vh - 2rem)",
          }}
        >
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>Conciliação Manual</DialogTitle>
            <DialogDescription>Associe o pagamento a um ou mais pagadores do Mapa de Liquidação.</DialogDescription>
          </DialogHeader>

          {pagamentoConciliar && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Código</Label>
                  <p className="font-medium">{pagamentoConciliar.codigo || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Pagador (Recebido)</Label>
                  <p className="font-medium">{pagamentoConciliar.pagador}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">CNPJ</Label>
                  <p className="font-medium">{pagamentoConciliar.cnpj}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Data</Label>
                  <p className="font-medium">
                    {(() => {
                      const dataStr = pagamentoConciliar.data
                      if (!dataStr) return "-"
                      const dateStr = dataStr.includes("T") ? dataStr : dataStr + "T12:00:00"
                      return new Date(dateStr).toLocaleDateString("pt-BR")
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Valor Recebido</Label>
                  <p className="font-medium text-lg text-green-600 dark:text-green-400">
                    R$ {pagamentoConciliar.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <Label className="text-lg font-semibold">Pagadores Disponíveis no Mapa de Liquidação</Label>
                <div className="border rounded-lg overflow-auto" style={{ maxHeight: "calc(100vh - 450px)" }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-12">Sel.</TableHead>
                        <TableHead className="min-w-[100px]">Código</TableHead>
                        <TableHead className="min-w-[250px]">Razão Social</TableHead>
                        <TableHead className="min-w-[160px]">CNPJ</TableHead>
                        <TableHead className="text-right min-w-[130px]">Valor Original</TableHead>
                        <TableHead className="text-right min-w-[150px]">Valor Atribuído</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conciliarSelecionados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Nenhum pagador disponível no Mapa de Liquidação
                          </TableCell>
                        </TableRow>
                      ) : (
                        conciliarSelecionados.map((p, index) => (
                          <TableRow
                            key={index}
                            className={cn(
                              "cursor-pointer hover:bg-muted/50",
                              p.selecionado && "bg-primary/10 hover:bg-primary/20",
                            )}
                            onClick={() =>
                              setConciliarSelecionados(
                                conciliarSelecionados.map((item, i) =>
                                  i === index
                                    ? {
                                        ...item,
                                        selecionado: !item.selecionado,
                                        valorAssociado:
                                          !item.selecionado && item.valorAssociado === 0
                                            ? item.valorOriginal
                                            : item.valorAssociado,
                                      }
                                    : item,
                                ),
                              )
                            }
                          >
                            <TableCell>
                              <Checkbox
                                checked={p.selecionado}
                                onCheckedChange={(checked) =>
                                  setConciliarSelecionados(
                                    conciliarSelecionados.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            selecionado: !!checked,
                                            valorAssociado:
                                              !!checked && item.valorAssociado === 0
                                                ? item.valorOriginal
                                                : item.valorAssociado,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-base">{p.codigo}</TableCell>
                            <TableCell className="text-base">{p.razaoSocial}</TableCell>
                            <TableCell className="font-mono text-base">{p.cnpj}</TableCell>
                            <TableCell className="text-right font-mono text-base">
                              R$ {p.valorOriginal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="text"
                                className="w-32 text-right font-mono ml-auto"
                                value={p.valorAssociado > 0 ? formatToBrazilian(p.valorAssociado) : ""}
                                placeholder="0,00"
                                disabled={!p.selecionado}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const valor = parseBrazilianNumber(e.target.value)
                                  setConciliarSelecionados(
                                    conciliarSelecionados.map((item, i) =>
                                      i === index ? { ...item, valorAssociado: valor } : item,
                                    ),
                                  )
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Tipo de Conciliação</Label>
                  <Select value={conciliarTipo} onValueChange={(v) => setConciliarTipo(v as Pagamento["tipo"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="igual">Valor Igual</SelectItem>
                      <SelectItem value="fracionado">Pagamento Fracionado</SelectItem>
                      <SelectItem value="antecipado">Pagamento Antecipado</SelectItem>
                      <SelectItem value="atrasado">Pagamento Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Selecionados</Label>
                  <p className="text-lg font-medium pt-2">
                    {conciliarSelecionados.filter((p) => p.selecionado).length} pagador(es)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Valor Total Atribuído</Label>
                  <p className="text-lg font-medium text-blue-600 dark:text-blue-400 pt-2">
                    R${" "}
                    {conciliarSelecionados
                      .filter((p) => p.selecionado)
                      .reduce((acc, p) => acc + p.valorAssociado, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Valor Restante</Label>
                  {(() => {
                    const valorAtribuido = conciliarSelecionados
                      .filter((p) => p.selecionado)
                      .reduce((acc, p) => acc + p.valorAssociado, 0)
                    const valorRestante = (pagamentoConciliar?.valor || 0) - valorAtribuido
                    const isNegativo = valorRestante < 0
                    const isZero = Math.abs(valorRestante) < 0.01
                    return (
                      <p
                        className={cn(
                          "text-lg font-medium pt-2",
                          isZero
                            ? "text-green-600 dark:text-green-400"
                            : isNegativo
                              ? "text-red-600 dark:text-red-400"
                              : "text-orange-600 dark:text-orange-400",
                        )}
                      >
                        R$ {valorRestante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        {isZero && " ✓"}
                      </p>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowConciliarModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarConciliacao} disabled={!conciliarSelecionados.some((p) => p.selecionado)}>
              Confirmar Conciliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuditoria} onOpenChange={setShowAuditoria}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle>Trilha de Auditoria - Conciliação</DialogTitle>
            <DialogDescription>
              Histórico completo de todas as operações realizadas no sistema de conciliação
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{auditoriaEventos.length} eventos registrados</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={exportarRelatorioAuditoria}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <div className="space-y-3">
              {auditoriaEventos.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento de auditoria registrado ainda</p>
                  <p className="text-sm mt-2">Todas as ações realizadas aparecerão aqui</p>
                </div>
              ) : (
                auditoriaEventos.map((evento) => (
                  <div key={evento.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getAcaoBadgeVariant(evento.acao)}>{formatarAcaoLabel(evento.acao)}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(evento.timestamp).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                          <span className="text-sm text-muted-foreground">• {evento.usuario}</span>
                        </div>
                        <p className="text-sm font-medium mb-2">{evento.descricao}</p>
                        {evento.detalhes && Object.keys(evento.detalhes).length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1 mt-2 bg-muted/30 p-2 rounded">
                            {evento.detalhes.cnpj && <p>CNPJ: {evento.detalhes.cnpj}</p>}
                            {evento.detalhes.codigo && <p>Código: {evento.detalhes.codigo}</p>}
                            {evento.detalhes.valor !== undefined && (
                              <p>
                                Valor: R${" "}
                                {evento.detalhes.valor.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            )}
                            {evento.detalhes.statusAnterior && (
                              <p>
                                Status: {evento.detalhes.statusAnterior} → {evento.detalhes.statusNovo}
                              </p>
                            )}
                            {evento.detalhes.quantidade !== undefined && (
                              <p>Quantidade: {evento.detalhes.quantidade}</p>
                            )}
                            {evento.detalhes.tipoArquivo && <p>Tipo de Arquivo: {evento.detalhes.tipoArquivo}</p>}
                          </div>
                        )}
                      </div>
                      {evento.pagamentoId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const pag = pagamentos.find((p) => p.id === evento.pagamentoId)
                            if (pag) {
                              setPagamentoSelecionado(pag)
                              setShowDetalhes(true)
                              setShowAuditoria(false)
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowAuditoria(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ... rest of the component ... */}
    </div>
  )
}

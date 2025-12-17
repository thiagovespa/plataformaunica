"use client"

import { TooltipContent } from "@/components/ui/tooltip"

import type React from "react"
import { History, Calculator, Check, FileText, Pencil, Plus, Search, Trash2, X, CalendarIcon, Info } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Pagador, CredorBase, MapaLiquidacao } from "@/components/administracao"

// Format number to Brazilian format
const formatToBrazilian = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0,00"
  }
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Parse Brazilian format to number
const parseBrazilianNumber = (value: string): number => {
  if (!value) return 0
  const cleaned = value.replace(/\./g, "").replace(",", ".")
  const parsed = Number.parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Arredondamento Bancário (Round Half to Even)
// Arredonda para o número par mais próximo quando o valor está exatamente no meio (ex: 2.5 -> 2, 3.5 -> 4)
// Isso reduz o viés de arredondamento em grandes conjuntos de dados financeiros
const arredondamentoBancario = (valor: number, casasDecimais = 2): number => {
  const multiplicador = Math.pow(10, casasDecimais)
  const valorShift = valor * multiplicador
  const valorTruncado = Math.trunc(valorShift)
  const parteDecimal = valorShift - valorTruncado

  // Se a parte decimal é exatamente 0.5
  if (Math.abs(parteDecimal - 0.5) < 1e-9) {
    // Arredonda para o par mais próximo
    if (valorTruncado % 2 === 0) {
      return valorTruncado / multiplicador
    } else {
      return (valorTruncado + 1) / multiplicador
    }
  }

  // Caso contrário, arredondamento padrão
  return Math.round(valorShift) / multiplicador
}

// Currency input component
const CurrencyInput = ({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    inputValue = inputValue.replace(/[^\d.,]/g, "")
    onChange(inputValue)
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || "0,00"}
      className={className}
    />
  )
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

  // Convert ISO string to Date object
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined

  useEffect(() => {
    if (value) {
      const date = new Date(value + "T00:00:00")
      setInputValue(format(date, "dd/MM/yyyy"))
    } else {
      setInputValue("")
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const isoDate = format(date, "yyyy-MM-dd")
      onChange(isoDate)
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

    // Parse and validate complete date
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 bg-transparent">
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} locale={ptBR} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface Credor {
  id: string
  codigo: string
  agente: string
  nome: string
  documento: string
  banco: string
  agencia: string
  conta: string
  formasRecebimento: string
  valorTotal: number
  valoresPagos: number
  aceitaParcial: boolean
}

interface Distribuicao extends Credor {
  valorDevido: number
  percentualDoRateio: number
  valorRateado: number
  valorPago: number
  saldoRemanescente: number
  status: "quitado" | "parcial" | "excluido" | "mínimo"
}

interface HistoricoEntry {
  data: string
  dataPagamento: string
  pagador: string
  valorTotalDevido: number
  valoresParciaisDevidos: { nome: string; valor: number; valorRateado: number }[]
  valorRateado: number
  valorEmAberto: number
  valorLesado: number
  credoresLesados: { nome: string; valorLesado: number }[] // Changed: now includes valor per credor
  credoresParticipantes: number
  credoresExcluidos: number
}

interface DistribuidorProporcionalProps {
  pagadores: Pagador[]
  credoresBase: CredorBase[]
  mapaLiquidacao: MapaLiquidacao[]
  onEstatisticasChange?: (stats: {
    distribuicoesAtivas: number
    ultimaSimulacao: string
    valorProcessado: number
  }) => void
}

export function DistribuidorProporcional({
  pagadores,
  credoresBase,
  mapaLiquidacao,
  onEstatisticasChange,
}: DistribuidorProporcionalProps) {
  const [pagadorSelecionado, setPagadorSelecionado] = useState<string>("")
  const [buscaPagador, setBuscaPagador] = useState("")

  const [credores, setCredores] = useState<Credor[]>([])
  const [valorDisponivel, setValorDisponivel] = useState("")
  const [dataPagamento, setDataPagamento] = useState("")
  const [valorMinimo, setValorMinimo] = useState("0,01")
  const [distribuicao, setDistribuicao] = useState<Distribuicao[]>([])
  const [resultado, setResultado] = useState<{
    valorDistribuido: number
    valorSobra: number
    valorLesado: number
    credoresParticipantes: number
    credoresExcluidos: number
  } | null>(null)
  const [historico, setHistorico] = useState<HistoricoEntry[]>([])
  const [erroRateio, setErroRateio] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValorTotal, setEditValorTotal] = useState("")
  const [editValoresPagos, setEditValoresPagos] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newCredor, setNewCredor] = useState<Credor>({
    id: "",
    codigo: "",
    agente: "",
    nome: "",
    documento: "",
    banco: "",
    agencia: "",
    conta: "",
    formasRecebimento: "",
    valorTotal: 0,
    valoresPagos: 0,
    aceitaParcial: true,
  })

  const [showRelatorio, setShowRelatorio] = useState(false)
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<HistoricoEntry | null>(null)
  const [showRelatorioConsolidado, setShowRelatorioConsolidado] = useState(false)

  useEffect(() => {
    if (pagadorSelecionado && mapaLiquidacao.length > 0 && credoresBase.length > 0) {
      const pagadorCodigo = pagadorSelecionado.split(/\s*[-—–]\s*/)[0]

      const mapaCredores = mapaLiquidacao.filter((m) => {
        const mapaCodigo = m.pagadorCodigo.split(/\s*[-—–]\s*/)[0]
        return mapaCodigo === pagadorCodigo
      })

      console.log("[v0] useEffect - pagadorCodigo:", pagadorCodigo)
      console.log("[v0] useEffect - mapaCredores encontrados:", mapaCredores.length)
      console.log("[v0] useEffect - credoresBase sample:", credoresBase.slice(0, 3))

      const novosCredores: Credor[] = mapaCredores.map((m, idx) => {
        const credorCodigo = m.credorCodigo.split(/\s*[-—–]\s*/)[0]
        const credorBase = credoresBase.find((c) => {
          const cCodigo = c.codigo.split(/\s*[-—–]\s*/)[0]
          return cCodigo === credorCodigo
        })

        console.log(
          "[v0] credor mapping - credorCodigo:",
          credorCodigo,
          "credorBase found:",
          !!credorBase,
          "nome:",
          credorBase?.nome,
          "doc:",
          credorBase?.documento,
        )

        return {
          id: `credor-${idx}`,
          codigo: credorCodigo,
          agente: credorBase?.agente || "",
          nome: credorBase?.nome || m.credorCodigo.split(/\s*[-—–]\s*/)[1] || m.credorCodigo,
          documento: credorBase?.documento || "",
          banco: credorBase?.banco || "",
          agencia: credorBase?.agencia || "",
          conta: credorBase?.conta || "",
          formasRecebimento: credorBase?.formasRecebimento || "",
          valorTotal: m.valor,
          valoresPagos: 0,
          aceitaParcial: true,
        }
      })

      console.log("[v0] useEffect - novosCredores:", novosCredores.length)
      console.log("[v0] useEffect - primeiro credor:", novosCredores[0])
      setCredores(novosCredores)
      setResultado(null)
      setDistribuicao([])
      setErroRateio(null)
    }
  }, [pagadorSelecionado, mapaLiquidacao, credoresBase])

  const getValorDevido = (credor: Credor) => credor.valorTotal - credor.valoresPagos
  const getTotaisConsolidados = () => {
    return {
      totalDevido: historico.reduce((acc, h) => acc + h.valorTotalDevido, 0),
      totalRateado: historico.reduce((acc, h) => acc + h.valorRateado, 0),
      totalEmAberto: historico.reduce((acc, h) => acc + h.valorEmAberto, 0),
      totalLesado: historico.reduce((acc, h) => acc + h.valorLesado, 0),
      totalCredoresParticipantes: historico.reduce((acc, h) => acc + h.credoresParticipantes, 0),
      totalCredoresExcluidos: historico.reduce((acc, h) => acc + h.credoresExcluidos, 0),
    }
  }

  const totalDevido = credores.reduce((sum, c) => sum + getValorDevido(c), 0)
  const totalValorTotal = credores.reduce((sum, c) => sum + c.valorTotal, 0)

  const simularDistribuicao = () => {
    const disponivel = parseBrazilianNumber(valorDisponivel)
    const minimo = parseBrazilianNumber(valorMinimo)

    console.log("[v0] simularDistribuicao - disponivel:", disponivel, "minimo:", minimo)
    console.log("[v0] simularDistribuicao - credores:", credores.length)

    if (totalDevido <= 0) {
      setErroRateio("Não é possível simular: o total devido é zero.")
      setDistribuicao([])
      setResultado(null)
      return
    }

    if (disponivel <= 0) {
      setErroRateio("Não é possível simular: o valor disponível deve ser maior que zero.")
      setDistribuicao([])
      setResultado(null)
      return
    }

    setErroRateio(null)

    // Refactored distribution logic to properly exclude "mínimo" and "excluido" creditors
    // and redistribute their portion among valid creditors

    // Step 1: Identify creditors with value below minimum
    const credoresAbaixoMinimo = credores.filter((c) => getValorDevido(c) < minimo)
    let credoresPotenciais = credores.filter((c) => getValorDevido(c) >= minimo)

    console.log("[v0] simularDistribuicao - credoresAbaixoMinimo:", credoresAbaixoMinimo.length)
    console.log("[v0] simularDistribuicao - credoresPotenciais:", credoresPotenciais.length)

    if (credoresPotenciais.length === 0 && credoresAbaixoMinimo.length > 0) {
      setErroRateio(
        `Não é possível simular: todos os ${credoresAbaixoMinimo.length} credores têm valor devido menor que o mínimo de R$ ${formatToBrazilian(minimo)}.`,
      )
      setDistribuicao([])
      setResultado(null)
      return
    }

    // Step 2: If disponivel < totalDevido, exclude creditors that don't accept partial payment
    const totalDevidoPotencial = credoresPotenciais.reduce((sum, c) => sum + getValorDevido(c), 0)
    const credoresExcluidos: typeof credores = [...credoresAbaixoMinimo]

    if (disponivel < totalDevidoPotencial) {
      const naoAceitamParcial = credoresPotenciais.filter((c) => !c.aceitaParcial)
      credoresPotenciais = credoresPotenciais.filter((c) => c.aceitaParcial)
      credoresExcluidos.push(...naoAceitamParcial)
    }

    // Step 3: Calculate total due for potential creditors
    const totalDevidoFinal = credoresPotenciais.reduce((sum, c) => sum + getValorDevido(c), 0)

    console.log("[v0] simularDistribuicao - totalDevidoFinal:", totalDevidoFinal)

    if (totalDevidoFinal < 0.01) {
      setErroRateio("Não é possível simular: não há credores elegíveis com valor suficiente para distribuição.")
      setDistribuicao([])
      setResultado(null)
      return
    }

    // Step 4: First pass - identify creditors whose proportional share would be below minimum
    const valorADistribuir = Math.min(disponivel, totalDevidoFinal)
    const credoresComRateioValido: typeof credores = []
    const credoresComRateioMinimo: typeof credores = []

    for (const credor of credoresPotenciais) {
      const valorDevido = getValorDevido(credor)
      const proporcao = valorDevido / totalDevidoFinal
      const valorRateadoEstimado = arredondamentoBancario(valorADistribuir * proporcao)

      if (valorRateadoEstimado <= minimo) {
        credoresComRateioMinimo.push(credor)
      } else {
        credoresComRateioValido.push(credor)
      }
    }

    console.log("[v0] simularDistribuicao - credoresComRateioValido:", credoresComRateioValido.length)
    console.log("[v0] simularDistribuicao - credoresComRateioMinimo:", credoresComRateioMinimo.length)

    // Step 5: Recalculate distribution only for valid creditors
    const totalDevidoValido = credoresComRateioValido.reduce((sum, c) => sum + getValorDevido(c), 0)
    const valorADistribuirFinal = Math.min(disponivel, totalDevidoValido)

    const resultadoDistribuicao: Distribuicao[] = []
    let valorTotalPago = 0
    const credoresLesadosNaDistribuicao: string[] = []

    // Add valid creditors with their distribution
    for (const credor of credoresComRateioValido) {
      const valorDevido = getValorDevido(credor)
      const proporcao = totalDevidoValido > 0 ? valorDevido / totalDevidoValido : 0
      const valorRateado = arredondamentoBancario(Math.min(valorADistribuirFinal * proporcao, valorDevido))
      const isPago = valorRateado >= valorDevido || Math.abs(valorRateado - valorDevido) < 0.01

      valorTotalPago += valorRateado

      resultadoDistribuicao.push({
        ...credor,
        valorDevido,
        percentualDoRateio: 0,
        valorRateado,
        valorPago: valorRateado,
        saldoRemanescente: isPago ? 0 : arredondamentoBancario(valorDevido - valorRateado),
        status: isPago ? "quitado" : "parcial",
      })
    }

    // Add creditors whose proportional share would be below minimum
    for (const credor of credoresComRateioMinimo) {
      const valorDevido = getValorDevido(credor)
      resultadoDistribuicao.push({
        ...credor,
        valorDevido,
        percentualDoRateio: 0,
        valorRateado: 0,
        valorPago: 0,
        saldoRemanescente: valorDevido,
        status: valorDevido <= 0 ? "quitado" : "mínimo",
      })
      if (valorDevido > 0) credoresLesadosNaDistribuicao.push(credor.nome)
    }

    // Add excluded creditors (below minimum or don't accept partial)
    for (const credor of credoresExcluidos) {
      const valorDevido = getValorDevido(credor)
      resultadoDistribuicao.push({
        ...credor,
        valorDevido,
        percentualDoRateio: 0,
        valorRateado: 0,
        valorPago: 0,
        saldoRemanescente: valorDevido,
        status: valorDevido <= 0 ? "quitado" : valorDevido < minimo ? "mínimo" : "excluido",
      })
      if (valorDevido > 0) credoresLesadosNaDistribuicao.push(credor.nome)
    }

    // Calculate percentages based on valorRateado
    const totalRateado = resultadoDistribuicao.reduce((sum, r) => sum + r.valorRateado, 0)
    for (const r of resultadoDistribuicao) {
      r.percentualDoRateio = totalRateado > 0 ? (r.valorRateado / totalRateado) * 100 : 0
    }

    console.log("[v0] simularDistribuicao - resultado:", resultadoDistribuicao.length, "totalRateado:", totalRateado)

    const credoresAtivos = resultadoDistribuicao.filter((r) => r.status !== "mínimo" && r.status !== "excluido")
    if (credoresAtivos.length === 0) {
      setErroRateio(
        `Aviso: Todos os credores estão com valor devido igual ou abaixo do mínimo (R$ ${formatToBrazilian(minimo)}). Não há valores a distribuir.`,
      )
      setDistribuicao(resultadoDistribuicao)
      setResultado({
        valorDistribuido: 0,
        valorSobra: disponivel,
        valorLesado: 0,
        credoresParticipantes: 0,
        credoresExcluidos: resultadoDistribuicao.length,
      })
      return
    }

    let ajusteArredondamento = 0
    if (totalRateado > disponivel) {
      const excedente = arredondamentoBancario(totalRateado - disponivel)
      ajusteArredondamento = excedente

      // Find highest value creditor that accepts partial payment
      const credorParaAjuste = resultadoDistribuicao
        .filter((r) => r.aceitaParcial && r.valorRateado > 0)
        .sort((a, b) => b.valorRateado - a.valorRateado)[0]

      if (credorParaAjuste) {
        credorParaAjuste.valorRateado = arredondamentoBancario(credorParaAjuste.valorRateado - excedente)
        credorParaAjuste.valorPago = credorParaAjuste.valorRateado
        credorParaAjuste.saldoRemanescente = arredondamentoBancario(
          credorParaAjuste.valorDevido - credorParaAjuste.valorRateado,
        )
        if (credorParaAjuste.saldoRemanescente > 0) {
          credorParaAjuste.status = "parcial"
        }
        // Add to lesados if not already there from exclusion or minimum
        if (!credoresLesadosNaDistribuicao.includes(credorParaAjuste.nome)) {
          credoresLesadosNaDistribuicao.push(credorParaAjuste.nome)
        }

        setErroRateio(
          `Aviso: Devido ao arredondamento bancário, o credor "${credorParaAjuste.nome}" terá R$ ${formatToBrazilian(excedente)} deduzido do seu rateio, ficando como valor a pagar posteriormente.`,
        )
      }
    }

    // Recalculate total and percentages after adjustment
    const totalRateadoFinal = resultadoDistribuicao.reduce((sum, r) => sum + r.valorRateado, 0)
    for (const r of resultadoDistribuicao) {
      r.percentualDoRateio = totalRateadoFinal > 0 ? (r.valorRateado / totalRateadoFinal) * 100 : 0
    }

    setDistribuicao(resultadoDistribuicao)
    const finalResultado = {
      valorDistribuido: totalRateadoFinal,
      valorSobra: arredondamentoBancario(disponivel - totalRateadoFinal),
      valorLesado: ajusteArredondamento,
      credoresParticipantes: resultadoDistribuicao.filter((r) => r.valorRateado > 0).length,
      credoresExcluidos: resultadoDistribuicao.filter((r) => r.status === "excluido" || r.status === "mínimo").length,
    }
    setResultado(finalResultado)

    // Call onEstatisticasChange after simulation
    if (onEstatisticasChange) {
      onEstatisticasChange({
        distribuicoesAtivas: finalResultado.credoresParticipantes,
        ultimaSimulacao: new Date().toLocaleString("pt-BR"),
        valorProcessado: finalResultado.valorDistribuido,
      })
    }
  }

  const confirmarRateio = () => {
    // CHANGE Check if valorDistribuido is 0, do not allow confirmation
    if (!resultado || resultado.valorDistribuido === 0) {
      setErroRateio("Não é possível confirmar: o valor distribuído é zero.")
      return
    }
    // Allow confirmation even with warning message (erroRateio that starts with "Aviso:")
    if (erroRateio && !erroRateio.startsWith("Aviso:") && !erroRateio.startsWith("Warning:")) return

    const pagadorNome = pagadorSelecionado || "Não selecionado"

    const valorLesadoExcluidos = distribuicao
      .filter((d) => d.status === "mínimo" || d.status === "excluido")
      .reduce((sum, d) => sum + d.valorDevido, 0)

    const credoresLesados: { nome: string; valorLesado: number }[] = []

    // Add credores who were excluded or below minimum with their valores
    distribuicao
      .filter((d) => d.status === "mínimo" || d.status === "excluido")
      .forEach((d) => {
        credoresLesados.push({
          nome: d.nome,
          valorLesado: d.valorDevido, // The amount this credor lost
        })
      })

    // Check if there was a rounding adjustment warning
    const valorArredondamento =
      erroRateio?.startsWith("Aviso:") || erroRateio?.startsWith("Warning:") ? resultado.valorLesado : 0

    if (valorArredondamento > 0 && erroRateio) {
      const match = erroRateio.match(/"([^"]+)"/)
      if (match && match[1]) {
        const credorExistente = credoresLesados.find((c) => c.nome === match[1])
        if (credorExistente) {
          credorExistente.valorLesado += valorArredondamento
        } else {
          credoresLesados.push({
            nome: match[1],
            valorLesado: valorArredondamento,
          })
        }
      }
    }

    const novoHistorico: HistoricoEntry = {
      data: new Date().toISOString(), // CHANGE changed to ISO string
      dataPagamento,
      pagador: pagadorNome,
      valorTotalDevido: distribuicao.reduce((sum, d) => sum + d.valorDevido, 0),
      valoresParciaisDevidos: distribuicao.map((d) => ({
        nome: d.nome,
        valor: d.valorDevido,
        valorRateado: d.valorRateado,
      })),
      valorRateado: resultado.valorDistribuido,
      valorEmAberto: resultado.valorSobra,
      valorLesado: valorLesadoExcluidos + valorArredondamento,
      credoresLesados, // Store who was affected
      credoresParticipantes: resultado.credoresParticipantes,
      credoresExcluidos: resultado.credoresExcluidos,
    }

    setHistorico([novoHistorico, ...historico])

    // </CHANGE> Send statistics to parent
    if (onEstatisticasChange) {
      const currentHistoricoLength = historico.length // Get the length before prepending
      const totalValorProcessado = historico.reduce((acc, h) => acc + h.valorRateado, 0) + resultado.valorDistribuido
      onEstatisticasChange({
        distribuicoesAtivas: currentHistoricoLength + 1,
        ultimaSimulacao: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        valorProcessado: totalValorProcessado,
      })
    }

    // Atualizar credores com os valores pagos
    const credoresAtualizados = credores.map((credor) => {
      const dist = distribuicao.find((d) => d.id === credor.id)
      if (dist && dist.valorRateado > 0) {
        return {
          ...credor,
          valoresPagos: credor.valoresPagos + dist.valorRateado,
        }
      }
      return credor
    })
    setCredores(credoresAtualizados)

    // Limpar
    setDistribuicao([])
    setResultado(null)
    setValorDisponivel("")
    setDataPagamento("")
    setErroRateio(null)
  }

  const startEditing = (credor: Credor) => {
    setEditingId(credor.id)
    setEditValorTotal(formatToBrazilian(credor.valorTotal))
    setEditValoresPagos(formatToBrazilian(credor.valoresPagos))
  }

  const saveEditing = (id: string) => {
    setCredores(
      credores.map((c) =>
        c.id === id
          ? {
              ...c,
              valorTotal: parseBrazilianNumber(editValorTotal),
              valoresPagos: parseBrazilianNumber(editValoresPagos),
            }
          : c,
      ),
    )
    setEditingId(null)
  }

  const deleteCredor = (id: string) => {
    setCredores(credores.filter((c) => c.id !== id))
  }

  const addNewCredor = () => {
    if (newCredor.nome) {
      setCredores([
        ...credores,
        {
          ...newCredor,
          id: `credor-${Date.now()}`,
        },
      ])
      setNewCredor({
        id: "",
        codigo: "",
        agente: "",
        nome: "",
        documento: "",
        banco: "",
        agencia: "",
        conta: "",
        formasRecebimento: "",
        valorTotal: 0,
        valoresPagos: 0,
        aceitaParcial: true,
      })
      setIsAddingNew(false)
    }
  }

  const handleSelectPagador = (value: string) => {
    setPagadorSelecionado(value)
    setHistorico([])
    setDistribuicao([])
    setResultado(null)
    setErroRateio(null)
    setValorDisponivel("") // Reset values when changing pagador
    setDataPagamento("")
  }

  const pagadoresFiltrados = pagadores.filter(
    (p) =>
      p.agente.toLowerCase().includes(buscaPagador.toLowerCase()) ||
      p.razaoSocial.toLowerCase().includes(buscaPagador.toLowerCase()) ||
      p.cnpj.includes(buscaPagador) ||
      p.codigo.includes(buscaPagador),
  )

  const abrirRelatorio = (entry: HistoricoEntry) => {
    setRelatorioSelecionado(entry)
    setShowRelatorio(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Distribuidor Proporcional</h2>
        <p className="text-muted-foreground mt-1">Calcule e distribua pagamentos proporcionalmente entre os credores</p>
      </div>

      {/* Selecionar Pagador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Selecionar Pagador
          </CardTitle>
          <CardDescription>Escolha o pagador para carregar os credores do mapa de liquidação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Digite pelo menos 3 caracteres para buscar..."
                value={buscaPagador}
                onChange={(e) => setBuscaPagador(e.target.value)}
                className="pl-9"
              />
            </div>
            {buscaPagador.length < 3 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Digite pelo menos 3 caracteres para buscar pagadores
              </div>
            ) : pagadoresFiltrados.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum pagador encontrado para "{buscaPagador}"
              </div>
            ) : (
              <div className="border rounded-md max-h-64 overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-24">Código</TableHead>
                      <TableHead>Razão Social</TableHead>
                      <TableHead className="w-40">CNPJ</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagadoresFiltrados.map((p) => (
                      <TableRow
                        key={p.id}
                        className={`cursor-pointer hover:bg-muted/50 ${pagadorSelecionado === `${p.codigo} - ${p.razaoSocial}` ? "bg-primary/10" : ""}`}
                        onClick={() => handleSelectPagador(`${p.codigo} - ${p.razaoSocial}`)}
                      >
                        <TableCell className="font-medium">{p.codigo}</TableCell>
                        <TableCell>{p.razaoSocial}</TableCell>
                        <TableCell>{p.cnpj}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={pagadorSelecionado === `${p.codigo} - ${p.razaoSocial}` ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectPagador(`${p.codigo} - ${p.razaoSocial}`)
                            }}
                          >
                            {pagadorSelecionado === `${p.codigo} - ${p.razaoSocial}` ? "Selecionado" : "Selecionar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {pagadorSelecionado && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Pagador selecionado:</span> {pagadorSelecionado}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Valor Disponível */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Valor Disponível para Distribuição</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="font-semibold mb-1">Arredondamento Bancário</p>
                    <p className="text-sm">
                      Os cálculos utilizam arredondamento bancário (Round Half to Even), que arredonda valores
                      exatamente no meio para o número par mais próximo. Isso reduz o viés estatístico em grandes
                      volumes de transações financeiras.
                    </p>
                    <p className="text-sm mt-2 font-medium">Exemplos (3 para 2 casas decimais):</p>
                    <ul className="text-sm mt-1 space-y-0.5">
                      <li>1,245 → 1,24 (porque 4 é par)</li>
                      <li>1,255 → 1,26 (porque 6 é par)</li>
                      <li>1,235 → 1,24 (porque 4 é par)</li>
                      <li>1,225 → 1,22 (porque 2 é par)</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="valorDisponivel">Valor Disponível (R$)</Label>
              <CurrencyInput
                value={valorDisponivel}
                onChange={setValorDisponivel}
                placeholder="0,00"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataPagamento">Data para Pagamento</Label>
              <DateInputBrazilian value={dataPagamento} onChange={setDataPagamento} className="text-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Valor Mínimo */}
        <Card>
          <CardHeader>
            <CardTitle>Valor Mínimo para Rateio</CardTitle>
            <CardDescription>Credores com valor abaixo serão excluídos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="valorMinimo">Valor Mínimo (R$)</Label>
              <CurrencyInput value={valorMinimo} onChange={setValorMinimo} placeholder="0,01" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de Liquidação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Valores a serem pagos - Avisos de Débito (AVD)
              </CardTitle>
              <CardDescription>Lista de credores e valores devidos</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsAddingNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Credor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!pagadorSelecionado ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FileText className="mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Selecione um pagador</p>
              <p className="text-sm">Escolha um pagador acima para carregar o mapa de liquidação</p>
            </div>
          ) : credores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {/* CHANGE Renamed "Administração" to "Configurações" */}
              Importe o mapa de liquidação na aba Configurações ou adicione credores manualmente
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Valores Pagos</TableHead>
                      <TableHead className="text-right">Valor Devido</TableHead>
                      <TableHead className="text-right">% do Total</TableHead>
                      <TableHead className="text-center">Aceita Parcial</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isAddingNew && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={newCredor.nome}
                            onChange={(e) => setNewCredor({ ...newCredor, nome: e.target.value })}
                            placeholder="Nome"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={newCredor.documento}
                            onChange={(e) => setNewCredor({ ...newCredor, documento: e.target.value })}
                            placeholder="Documento"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <CurrencyInput
                            value={formatToBrazilian(newCredor.valorTotal)}
                            onChange={(v) => setNewCredor({ ...newCredor, valorTotal: parseBrazilianNumber(v) })}
                            className="h-8 text-right"
                          />
                        </TableCell>
                        <TableCell>
                          <CurrencyInput
                            value={formatToBrazilian(newCredor.valoresPagos)}
                            onChange={(v) => setNewCredor({ ...newCredor, valoresPagos: parseBrazilianNumber(v) })}
                            className="h-8 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {formatToBrazilian(newCredor.valorTotal - newCredor.valoresPagos)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {totalValorTotal > 0
                            ? ((newCredor.valorTotal / totalValorTotal) * 100).toFixed(8)
                            : "0,00000000"}
                          %
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={newCredor.aceitaParcial}
                            onCheckedChange={(checked) => setNewCredor({ ...newCredor, aceitaParcial: checked })}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={addNewCredor}>
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setIsAddingNew(false)}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {credores.map((credor) => (
                      <TableRow key={credor.id}>
                        {editingId === credor.id ? (
                          <>
                            <TableCell>{credor.nome}</TableCell>
                            <TableCell>{credor.documento}</TableCell>
                            <TableCell>
                              <CurrencyInput
                                value={editValorTotal}
                                onChange={setEditValorTotal}
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell>
                              <CurrencyInput
                                value={editValoresPagos}
                                onChange={setEditValoresPagos}
                                className="h-8 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              R${" "}
                              {formatToBrazilian(
                                parseBrazilianNumber(editValorTotal) - parseBrazilianNumber(editValoresPagos),
                              )}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {totalValorTotal > 0
                                ? ((credor.valorTotal / totalValorTotal) * 100).toFixed(8)
                                : "0,00000000"}
                              %
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={credor.aceitaParcial}
                                onCheckedChange={(checked) =>
                                  setCredores(
                                    credores.map((c) => (c.id === credor.id ? { ...c, aceitaParcial: checked } : c)),
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => saveEditing(credor.id)}>
                                  <Check className="h-4 w-4 text-success" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                                  <X className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium">{credor.nome}</TableCell>
                            <TableCell>{credor.documento}</TableCell>
                            <TableCell className="text-right">R$ {formatToBrazilian(credor.valorTotal)}</TableCell>
                            <TableCell className="text-right">R$ {formatToBrazilian(credor.valoresPagos)}</TableCell>
                            <TableCell className="text-right font-medium">
                              R$ {formatToBrazilian(getValorDevido(credor))}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {totalValorTotal > 0
                                ? ((credor.valorTotal / totalValorTotal) * 100).toFixed(8)
                                : "0,00000000"}
                              %
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={credor.aceitaParcial}
                                onCheckedChange={(checked) =>
                                  setCredores(
                                    credores.map((c) => (c.id === credor.id ? { ...c, aceitaParcial: checked } : c)),
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => startEditing(credor)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteCredor(credor.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Total de credores: <span className="font-medium">{credores.length}</span>
                </div>
                <div className="text-sm font-medium">Total Devido: R$ {formatToBrazilian(totalDevido)}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={simularDistribuicao} disabled={!valorDisponivel || !dataPagamento || credores.length === 0}>
          <Calculator className="mr-2 h-4 w-4" />
          Simular Distribuição
        </Button>
      </div>

      {erroRateio && (
        <div
          className={`p-3 rounded-md ${erroRateio.startsWith("Aviso:") || erroRateio.startsWith("Warning:") ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}
        >
          <p
            className={`text-sm ${erroRateio.startsWith("Aviso:") || erroRateio.startsWith("Warning:") ? "text-yellow-700" : "text-red-600"}`}
          >
            {erroRateio}
          </p>
        </div>
      )}

      {/* Resultado da Distribuição */}
      {/* CHANGE Allow showing result when there's a warning (erroRateio starts with "Aviso:") */}
      {resultado && (!erroRateio || erroRateio.startsWith("Aviso:") || erroRateio.startsWith("Warning:")) && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Distribuição</CardTitle>
            <CardDescription>Visualize como o valor será distribuído entre os credores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Valor Total Devido</div>
                <div className="text-2xl font-bold">R$ {formatToBrazilian(totalDevido)}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Valor Distribuído</div>
                <div className="text-2xl font-bold text-success">
                  R$ {formatToBrazilian(resultado.valorDistribuido)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Sobra</div>
                <div className="text-2xl font-bold">R$ {formatToBrazilian(resultado.valorSobra)}</div>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Valor Devido</TableHead>
                    <TableHead className="text-right">% do Rateio</TableHead>
                    <TableHead className="text-right">Valor Rateado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distribuicao.map((d) => (
                    <TableRow
                      key={d.id}
                      className={d.status === "mínimo" || d.status === "excluido" ? "bg-muted/50" : ""}
                    >
                      <TableCell className="font-medium">{d.nome}</TableCell>
                      <TableCell className="text-right">R$ {formatToBrazilian(d.valorDevido)}</TableCell>
                      <TableCell className="text-right">{d.percentualDoRateio.toFixed(8)}%</TableCell>
                      <TableCell className="text-right font-medium">R$ {formatToBrazilian(d.valorRateado)}</TableCell>
                      <TableCell className="text-right">R$ {formatToBrazilian(d.saldoRemanescente)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            d.status === "quitado" ? "default" : d.status === "parcial" ? "secondary" : "destructive"
                          }
                        >
                          {d.status === "quitado"
                            ? "Quitado"
                            : d.status === "parcial"
                              ? "Parcial"
                              : d.status === "mínimo"
                                ? "Mínimo"
                                : "Excluído"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {resultado.valorDistribuido > 0 && (
              <div className="mt-6 flex justify-end">
                <Button variant="default" onClick={confirmarRateio}>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar Rateio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Histórico de Rateios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Rateios
            </CardTitle>
            <CardDescription>Clique em um item para ver o relatório detalhado</CardDescription>
          </div>
          {historico.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowRelatorioConsolidado(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Relatório Consolidado
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum rateio confirmado ainda.</p>
          ) : (
            <div className="space-y-2">
              {historico.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => abrirRelatorio(entry)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{entry.pagador}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.dataPagamento} | {entry.data}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">R$ {formatToBrazilian(entry.valorRateado)}</p>
                    <p className="text-sm text-muted-foreground">{entry.credoresParticipantes} credor(es)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Relatório */}
      <Dialog open={showRelatorio} onOpenChange={setShowRelatorio}>
        <DialogContent className="!w-[95vw] !max-w-6xl !h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Relatório de Rateio</DialogTitle>
            <DialogDescription>
              {relatorioSelecionado?.pagador} - Pagamento em: {relatorioSelecionado?.dataPagamento} (
              {relatorioSelecionado?.data})
            </DialogDescription>
          </DialogHeader>
          {relatorioSelecionado && (
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor Total Devido</p>
                    <p className="text-xl font-bold">R$ {formatToBrazilian(relatorioSelecionado.valorTotalDevido)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor Rateado</p>
                    <p className="text-xl font-bold text-primary">
                      R$ {formatToBrazilian(relatorioSelecionado.valorRateado)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Sobra</p>
                    <p className="text-xl font-bold text-orange-600">
                      R$ {formatToBrazilian(relatorioSelecionado.valorEmAberto)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor Lesado</p>
                    <p className="text-xl font-bold text-red-600">
                      R$ {formatToBrazilian(relatorioSelecionado.valorLesado)}
                    </p>
                    {relatorioSelecionado.credoresLesados && relatorioSelecionado.credoresLesados.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Credores Afetados:</p>
                        <TooltipProvider>
                          <div className="flex flex-wrap gap-1">
                            {relatorioSelecionado.credoresLesados.map((credor, i) => (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive" className="cursor-help text-xs">
                                    {credor.nome}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-popover text-popover-foreground border shadow-md">
                                  <div className="space-y-1">
                                    <p className="font-semibold">{credor.nome}</p>
                                    <p className="text-sm">
                                      Valor Lesado:{" "}
                                      <span className="font-medium text-red-600">
                                        R$ {formatToBrazilian(credor.valorLesado)}
                                      </span>
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </TooltipProvider>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Credores</p>
                    <p className="text-xl font-bold">
                      {relatorioSelecionado.credoresParticipantes} /{" "}
                      {relatorioSelecionado.credoresParticipantes + relatorioSelecionado.credoresExcluidos}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes por Credor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Credor</TableHead>
                        <TableHead className="text-right">Valor Devido</TableHead>
                        <TableHead className="text-right">Valor Rateado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatorioSelecionado.valoresParciaisDevidos.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell>{v.nome}</TableCell>
                          <TableCell className="text-right">R$ {formatToBrazilian(v.valor)}</TableCell>
                          <TableCell className="text-right">R$ {formatToBrazilian(v.valorRateado)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {relatorioSelecionado.credoresLesados && relatorioSelecionado.credoresLesados.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Credores Lesados</CardTitle>
                    <CardDescription>
                      Credores cujos valores foram afetados por exclusão, valor mínimo ou ajuste de arredondamento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {relatorioSelecionado.credoresLesados.map((credor, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200"
                        >
                          <span className="font-medium text-red-900">{credor.nome}</span>
                          <Badge variant="destructive" className="text-xs px-3 py-1">
                            R$ {formatToBrazilian(credor.valorLesado)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRelatorioConsolidado} onOpenChange={setShowRelatorioConsolidado}>
        <DialogContent className="!w-[95vw] !max-w-7xl !h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Relatório Consolidado de Rateios</DialogTitle>
            <DialogDescription>Visão geral de todos os {historico.length} rateios realizados</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Qtd. Rateios</p>
                  <p className="text-xl font-bold">{historico.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total Rateado</p>
                  <p className="text-xl font-bold text-primary">
                    R$ {formatToBrazilian(getTotaisConsolidados().totalRateado)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* All rateios table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Todos os Rateios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Pagador</TableHead>
                        <TableHead className="text-right">Valor Devido</TableHead>
                        <TableHead className="text-right">Valor Rateado</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Sobra</TableHead>
                        <TableHead className="text-right">Lesado</TableHead>
                        <TableHead>Credores Lesados</TableHead>
                        <TableHead className="text-center">Credores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="whitespace-nowrap">{entry.dataPagamento}</TableCell>
                          <TableCell>{entry.pagador}</TableCell>
                          <TableCell className="text-right">R$ {formatToBrazilian(entry.valorTotalDevido)}</TableCell>
                          <TableCell className="text-right text-primary font-medium">
                            R$ {formatToBrazilian(entry.valorRateado)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${entry.valorRateado - entry.valorTotalDevido < 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            R$ {formatToBrazilian(entry.valorRateado - entry.valorTotalDevido)}
                          </TableCell>
                          <TableCell className="text-right text-orange-600">
                            R$ {formatToBrazilian(entry.valorEmAberto)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            R$ {formatToBrazilian(entry.valorLesado)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {entry.credoresLesados && entry.credoresLesados.length > 0 ? (
                              <div className="text-sm space-y-1">
                                {entry.credoresLesados.map((credor, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between gap-2"
                                    title={`${credor.nome}: R$ ${formatToBrazilian(credor.valorLesado)}`}
                                  >
                                    <span className="text-red-600 truncate">{credor.nome}</span>
                                    <span className="text-red-600 font-medium whitespace-nowrap">
                                      R$ {formatToBrazilian(credor.valorLesado)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{entry.credoresParticipantes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed breakdown by creditor across all rateios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhamento por Credor (Todos os Rateios)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Credor</TableHead>
                        <TableHead className="text-right">Total Rateado</TableHead>
                        <TableHead className="text-center">Participações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        // Aggregate by creditor name
                        const credorTotals: Record<string, { devido: number; rateado: number; participacoes: number }> =
                          {}
                        historico.forEach((h) => {
                          h.valoresParciaisDevidos.forEach((v) => {
                            if (!credorTotals[v.nome]) {
                              credorTotals[v.nome] = { devido: 0, rateado: 0, participacoes: 0 }
                            }
                            credorTotals[v.nome].devido += v.valor
                            credorTotals[v.nome].rateado += v.valorRateado
                            if (v.valorRateado > 0) {
                              credorTotals[v.nome].participacoes += 1
                            }
                          })
                        })
                        return Object.entries(credorTotals)
                          .sort((a, b) => b[1].rateado - a[1].rateado)
                          .map(([nome, totals], i) => (
                            <TableRow key={i}>
                              <TableCell>{nome}</TableCell>
                              <TableCell className="text-right">R$ {formatToBrazilian(totals.rateado)}</TableCell>
                              <TableCell className="text-center">{totals.participacoes}</TableCell>
                            </TableRow>
                          ))
                      })()}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

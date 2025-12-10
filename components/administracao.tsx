"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Eye,
  Search,
  History,
  Trash2,
  Download,
  ChevronDown,
  ChevronRight,
  CalendarIcon,
  Pencil,
  Users,
  FileText,
  MapIcon,
  X,
  ChevronUp,
  Plus,
  AlertTriangle,
  Building2,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

const DateInputBrazilian = ({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string
  onChange: (isoDate: string) => void
  className?: string
  placeholder?: string
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
        placeholder={placeholder || "dd/mm/aaaa"}
        className="flex-1"
        maxLength={10}
      />
      <Popover open={open} onOpenChange={setOpen}>
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

const formatCnpjInput = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14)
  let formatted = ""
  if (digits.length > 0) {
    formatted = digits.slice(0, 2)
    if (digits.length > 2) {
      formatted += "." + digits.slice(2, 5)
      if (digits.length > 5) {
        formatted += "." + digits.slice(5, 8)
        if (digits.length > 8) {
          formatted += "/" + digits.slice(8, 12)
          if (digits.length > 12) {
            formatted += "-" + digits.slice(12, 14)
          }
        }
      }
    }
  }
  return formatted
}

const formatDateBrazilian = (isoDate: string): string => {
  if (!isoDate) return ""
  const date = new Date(isoDate + "T00:00:00")
  if (isNaN(date.getTime())) return isoDate
  return format(date, "dd/MM/yyyy")
}

export interface Pagador {
  id: string
  codigo: string
  agente: string
  razaoSocial: string
  cnpj: string
  dataPagamentoPrevista: string
}

export interface CredorBase {
  id: string
  codigo: string
  agente: string
  nome: string
  documento: string
  banco: string
  agencia: string
  conta: string
  formasRecebimento: string
}

export interface MapaLiquidacao {
  pagadorCodigo: string
  credorCodigo: string
  valor: number
}

export interface HistoricoImportacao {
  id: string
  dataReferencia: string
  dataImportacao: string
  totalAssociacoes: number
  totalPagadores: number
  totalCredores: number
  mapa: MapaLiquidacao[]
}

interface AdministracaoProps {
  pagadores: Pagador[]
  setPagadores: React.Dispatch<React.SetStateAction<Pagador[]>>
  credoresBase: CredorBase[]
  setCredoresBase: React.Dispatch<React.SetStateAction<CredorBase[]>>
  mapaLiquidacao: MapaLiquidacao[]
  setMapaLiquidacao: React.Dispatch<React.SetStateAction<MapaLiquidacao[]>>
  dataReferenciaMapa: Date | undefined
  setDataReferenciaMapa: React.Dispatch<React.SetStateAction<Date | undefined>>
  historicoImportacaoMapa: HistoricoImportacao[]
  setHistoricoImportacaoMapa: React.Dispatch<React.SetStateAction<HistoricoImportacao[]>>
}

export function Administracao({
  pagadores,
  setPagadores,
  credoresBase,
  setCredoresBase,
  mapaLiquidacao,
  setMapaLiquidacao,
  dataReferenciaMapa,
  setDataReferenciaMapa,
  historicoImportacaoMapa,
  setHistoricoImportacaoMapa,
}: AdministracaoProps) {
  const [showPagadores, setShowPagadores] = useState(false)
  const [showCredores, setShowCredores] = useState(false)
  const [showMapa, setShowMapa] = useState(false)
  const [showAVD_AVC, setShowAVD_AVC] = useState(false) // Renamed from showRelatorioAVD_AVC
  const [buscaPagadorModal, setBuscaPagadorModal] = useState("")
  const [buscaCredorModal, setBuscaCredorModal] = useState("")
  const [buscaMapaModal, setBuscaMapaModal] = useState("")
  // const [historicoImportacaoMapa, setHistoricoImportacaoMapa] = useState<HistoricoImportacao[]>([])
  const [showHistoricoMapa, setShowHistoricoMapa] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [buscaAVD, setBuscaAVD] = useState("")
  const [buscaAVC, setBuscaAVC] = useState("")
  const [avdExpandidos, setAvdExpandidos] = useState<Set<string>>(new Set())
  const [avcExpandidos, setAvcExpandidos] = useState<Set<string>>(new Set())

  // State for controlling inline card expansion
  const [expandedPagadores, setExpandedPagadores] = useState(false)
  const [expandedCredores, setExpandedCredores] = useState(false)

  const [showNovoPagador, setShowNovoPagador] = useState(false)
  const [editingPagadorId, setEditingPagadorId] = useState<string | null>(null)
  const [novoPagador, setNovoPagador] = useState({
    codigo: "",
    agente: "",
    razaoSocial: "",
    cnpj: "",
    dataPagamentoPrevista: "",
  })

  const [showNovoCredor, setShowNovoCredor] = useState(false)
  const [editingCredorId, setEditingCredorId] = useState<string | null>(null)
  const [novoCredor, setNovoCredor] = useState({
    codigo: "",
    agente: "",
    nome: "",
    documento: "",
    banco: "",
    agencia: "",
    conta: "",
    formasRecebimento: "",
  })

  const [showDuplicadosModal, setShowDuplicadosModal] = useState(false)
  const [duplicadosPagadores, setDuplicadosPagadores] = useState<
    { codigo: string; ocorrencias: number; novoCodigoBase: string }[]
  >([])
  const [duplicadosCredores, setDuplicadosCredores] = useState<
    { codigo: string; ocorrencias: number; novoCodigoBase: string }[]
  >([])
  const [mapaPreview, setMapaPreview] = useState<MapaLiquidacao[]>([])
  const [pagadoresSetPreview, setPagadoresSetPreview] = useState<Set<string>>(new Set())
  const [credoresSetPreview, setCredoresSetPreview] = useState<Set<string>>(new Set())

  const fileInputPagadores = useRef<HTMLInputElement>(null)
  const fileInputCredores = useRef<HTMLInputElement>(null)
  const fileInputMapa = useRef<HTMLInputElement>(null)

  const handleSalvarPagador = () => {
    if (!novoPagador.codigo || !novoPagador.razaoSocial || !novoPagador.cnpj) {
      alert("Preencha os campos obrigatórios: Código, Razão Social e CNPJ")
      return
    }

    if (editingPagadorId) {
      // Editing existing
      setPagadores(pagadores.map((p) => (p.id === editingPagadorId ? { ...p, ...novoPagador } : p)))
      setEditingPagadorId(null)
      setExpandedPagadores(false) // Collapse after saving
    } else {
      // Adding new
      const newPagador: Pagador = {
        id: `pag-${Date.now()}`,
        ...novoPagador,
      }
      setPagadores([...pagadores, newPagador])
    }

    setNovoPagador({
      codigo: "",
      agente: "",
      razaoSocial: "",
      cnpj: "",
      dataPagamentoPrevista: "",
    })
    setShowNovoPagador(false) // Close modal after saving
  }

  const handleEditarPagador = (pagador: Pagador) => {
    setEditingPagadorId(pagador.id)
    setNovoPagador({
      codigo: pagador.codigo,
      agente: pagador.agente || "",
      razaoSocial: pagador.razaoSocial,
      cnpj: pagador.cnpj,
      dataPagamentoPrevista: pagador.dataPagamentoPrevista || "",
    })
    setExpandedPagadores(true)
    setShowPagadores(true) // Ensure the pagadores section is visible
  }

  const handleCancelarPagador = () => {
    setEditingPagadorId(null)
    setNovoPagador({
      codigo: "",
      agente: "",
      razaoSocial: "",
      cnpj: "",
      dataPagamentoPrevista: "",
    })
    setShowNovoPagador(false) // Close modal on cancel
    setExpandedPagadores(false) // Collapse inline card on cancel
  }

  const handleNovoPagador = () => {
    setEditingPagadorId(null)
    setNovoPagador({
      codigo: "",
      agente: "",
      razaoSocial: "",
      cnpj: "",
      dataPagamentoPrevista: "",
    })
    setExpandedPagadores(true)
    setShowPagadores(true)
  }

  const handleNovoCredor = () => {
    setEditingCredorId(null)
    setNovoCredor({
      codigo: "",
      agente: "",
      nome: "",
      documento: "",
      banco: "",
      agencia: "",
      conta: "",
      formasRecebimento: "",
    })
    setExpandedCredores(true)
    setShowCredores(true)
  }

  const handleSalvarCredor = () => {
    if (!novoCredor.codigo || !novoCredor.nome || !novoCredor.documento) {
      alert("Preencha os campos obrigatórios: Código, Nome e Documento")
      return
    }

    if (editingCredorId) {
      // Editing existing
      setCredoresBase(credoresBase.map((c) => (c.id === editingCredorId ? { ...c, ...novoCredor } : c)))
      setEditingCredorId(null)
      setExpandedCredores(false) // Collapse after saving
    } else {
      // Adding new
      const newCredor: CredorBase = {
        id: `cred-${Date.now()}`,
        ...novoCredor,
      }
      setCredoresBase([...credoresBase, newCredor])
    }

    setNovoCredor({
      codigo: "",
      agente: "",
      nome: "",
      documento: "",
      banco: "",
      agencia: "",
      conta: "",
      formasRecebimento: "",
    })
    setShowNovoCredor(false) // Close modal after saving
  }

  const handleEditarCredor = (credor: CredorBase) => {
    setEditingCredorId(credor.id)
    setNovoCredor({
      codigo: credor.codigo,
      agente: credor.agente || "",
      nome: credor.nome,
      documento: credor.documento,
      banco: credor.banco || "",
      agencia: credor.agencia || "",
      conta: credor.conta || "",
      formasRecebimento: credor.formasRecebimento || "",
    })
    setExpandedCredores(true)
    setShowCredores(true) // Ensure the credores section is visible
  }

  const handleCancelarCredor = () => {
    setEditingCredorId(null)
    setNovoCredor({
      codigo: "",
      agente: "",
      nome: "",
      documento: "",
      banco: "",
      agencia: "",
      conta: "",
      formasRecebimento: "",
    })
    setShowNovoCredor(false) // Close modal on cancel
    setExpandedCredores(false) // Collapse inline card on cancel
  }

  const importarPagadores = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const newPagadores: Pagador[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";")
        if (cols.length >= 5) {
          newPagadores.push({
            id: `pag-${i}`,
            codigo: cols[0]?.trim() || "",
            agente: cols[1]?.trim() || "",
            razaoSocial: cols[2]?.trim() || "",
            cnpj: cols[3]?.trim() || "",
            dataPagamentoPrevista: cols[4]?.trim() || "",
          })
        }
      }

      setPagadores(newPagadores)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const importarCredores = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const newCredores: CredorBase[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";")
        if (cols.length >= 8) {
          newCredores.push({
            id: `cred-${i}`,
            codigo: cols[0]?.trim() || "",
            agente: cols[1]?.trim() || "",
            nome: cols[2]?.trim() || "",
            documento: cols[3]?.trim() || "",
            banco: cols[4]?.trim() || "",
            agencia: cols[5]?.trim() || "",
            conta: cols[6]?.trim() || "",
            formasRecebimento: cols[7]?.trim() || "",
          })
        }
      }

      setCredoresBase(newCredores)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  // State to control if unique code validation is enabled
  const [validarCodigoUnico, setValidarCodigoUnico] = useState(true)

  const importarMapa = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!dataReferenciaMapa) {
      alert("Por favor, informe a data de referência antes de importar o mapa.")
      e.target.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) return

      const headers = lines[0].split(";")
      const credorCodigos = headers.slice(1)

      const newMapa: MapaLiquidacao[] = []
      const pagadoresSet = new Set<string>()
      const credoresSet = new Set<string>()

      const pagadorOcorrencias: Record<string, number> = {}
      const credorOcorrencias: Record<string, number> = {}

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(";")
        const pagadorCodigo = cols[0]?.trim() || ""
        pagadoresSet.add(pagadorCodigo)

        const codigoPagadorBase = pagadorCodigo.split(/\s*[-–]\s*/)[0].trim()
        pagadorOcorrencias[codigoPagadorBase] = (pagadorOcorrencias[codigoPagadorBase] || 0) + 1

        for (let j = 1; j < cols.length; j++) {
          const valorStr = cols[j]?.trim() || "0"
          const valorNormalizado = valorStr.replace(/\./g, "").replace(",", ".")
          const valor = Number.parseFloat(valorNormalizado)

          if (valor > 0 && credorCodigos[j - 1]) {
            const credorCodigo = credorCodigos[j - 1].trim()
            credoresSet.add(credorCodigo)

            const codigoCredorBase = credorCodigo.split(/\s*[-–]\s*/)[0].trim()
            if (!credorOcorrencias[codigoCredorBase]) {
              credorOcorrencias[codigoCredorBase] = 0
            }

            newMapa.push({
              pagadorCodigo,
              credorCodigo,
              valor,
            })
          }
        }
      }

      credorCodigos.forEach((c) => {
        const codigoCredorBase = c
          .trim()
          .split(/\s*[-–]\s*/)[0]
          .trim()
        credorOcorrencias[codigoCredorBase] = (credorOcorrencias[codigoCredorBase] || 0) + 1
      })

      const dupPagadores = Object.entries(pagadorOcorrencias)
        .filter(([_, count]) => count > 1)
        .map(([codigo, count]) => ({ codigo, ocorrencias: count, novoCodigoBase: codigo }))

      const dupCredores = Object.entries(credorOcorrencias)
        .filter(([_, count]) => count > 1)
        .map(([codigo, count]) => ({ codigo, ocorrencias: count, novoCodigoBase: codigo }))

      if (validarCodigoUnico && (dupPagadores.length > 0 || dupCredores.length > 0)) {
        setDuplicadosPagadores(dupPagadores)
        setDuplicadosCredores(dupCredores)
        setMapaPreview(newMapa)
        setPagadoresSetPreview(pagadoresSet)
        setCredoresSetPreview(credoresSet)
        setShowDuplicadosModal(true)
      } else {
        // No duplicates or validation disabled, proceed normally
        confirmarImportacaoMapa(newMapa, pagadoresSet, credoresSet)
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const confirmarImportacaoMapa = (mapa: MapaLiquidacao[], pagadoresSet: Set<string>, credoresSet: Set<string>) => {
    const novoHistorico: HistoricoImportacao = {
      id: Date.now().toString(),
      dataReferencia: format(dataReferenciaMapa!, "yyyy-MM-dd"),
      dataImportacao: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      totalAssociacoes: mapa.length,
      totalPagadores: pagadoresSet.size,
      totalCredores: credoresSet.size,
      mapa: mapa,
    }

    setHistoricoImportacaoMapa((prev) => [novoHistorico, ...prev])
    setMapaLiquidacao(mapa)
  }

  const aplicarCorrecoesDuplicados = () => {
    let mapaCorrigido = [...mapaPreview]

    // Apply pagador corrections
    duplicadosPagadores.forEach((dup) => {
      if (dup.novoCodigoBase !== dup.codigo) {
        mapaCorrigido = mapaCorrigido.map((m) => {
          const codigoBase = m.pagadorCodigo.split(/\s*[-–]\s*/)[0].trim()
          if (codigoBase === dup.codigo) {
            const resto = m.pagadorCodigo.substring(dup.codigo.length)
            return { ...m, pagadorCodigo: dup.novoCodigoBase + resto }
          }
          return m
        })
      }
    })

    // Apply credor corrections
    duplicadosCredores.forEach((dup) => {
      if (dup.novoCodigoBase !== dup.codigo) {
        mapaCorrigido = mapaCorrigido.map((m) => {
          const codigoBase = m.credorCodigo.split(/\s*[-–]\s*/)[0].trim()
          if (codigoBase === dup.codigo) {
            const resto = m.credorCodigo.substring(dup.codigo.length)
            return { ...m, credorCodigo: dup.novoCodigoBase + resto }
          }
          return m
        })
      }
    })

    // Update sets with corrected codes
    const novoPagadoresSet = new Set<string>()
    const novoCredoresSet = new Set<string>()
    mapaCorrigido.forEach((m) => {
      novoPagadoresSet.add(m.pagadorCodigo)
      novoCredoresSet.add(m.credorCodigo)
    })

    confirmarImportacaoMapa(mapaCorrigido, novoPagadoresSet, novoCredoresSet)
    setShowDuplicadosModal(false)
    setDuplicadosPagadores([])
    setDuplicadosCredores([])
    setMapaPreview([])
  }

  const restaurarHistoricoMapa = (historico: HistoricoImportacao) => {
    setMapaLiquidacao(historico.mapa)
    setDataReferenciaMapa(parse(historico.dataReferencia, "yyyy-MM-dd", new Date()))
  }

  const removerHistoricoMapa = (id: string) => {
    setHistoricoImportacaoMapa((prev) => prev.filter((h) => h.id !== id))
  }

  const formatDateBR = (dateStr: string) => {
    try {
      if (dateStr.includes(" ")) {
        const [datePart, timePart] = dateStr.split(" ")
        const date = parse(datePart, "yyyy-MM-dd", new Date())
        return `${format(date, "dd/MM/yyyy")} ${timePart}`
      }
      const date = parse(dateStr, "yyyy-MM-dd", new Date())
      return format(date, "dd/MM/yyyy")
    } catch {
      return dateStr
    }
  }

  const pagadoresFiltrados = pagadores.filter(
    (p) =>
      p.agente.toLowerCase().includes(buscaPagadorModal.toLowerCase()) ||
      p.razaoSocial.toLowerCase().includes(buscaPagadorModal.toLowerCase()) ||
      p.cnpj.includes(buscaPagadorModal) ||
      p.codigo.includes(buscaPagadorModal),
  )

  const credoresFiltrados = credoresBase.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaCredorModal.toLowerCase()) ||
      c.documento.includes(buscaCredorModal) ||
      c.codigo.includes(buscaCredorModal) ||
      c.agente.toLowerCase().includes(buscaCredorModal.toLowerCase()),
  )

  const mapaAgrupado = mapaLiquidacao.reduce(
    (acc, item) => {
      if (!acc[item.pagadorCodigo]) {
        acc[item.pagadorCodigo] = []
      }
      acc[item.pagadorCodigo].push(item)
      return acc
    },
    {} as Record<string, MapaLiquidacao[]>,
  )

  const mapaFiltrado = Object.entries(mapaAgrupado).filter(
    ([pagadorCodigo]) =>
      pagadorCodigo.toLowerCase().includes(buscaMapaModal.toLowerCase()) ||
      pagadores
        .find((p) => p.codigo === pagadorCodigo)
        ?.razaoSocial.toLowerCase()
        .includes(buscaMapaModal.toLowerCase()),
  )

  const credoresUnicos = [...new Set(mapaLiquidacao.map((m) => m.credorCodigo))].sort()
  const pagadoresUnicos = [...new Set(mapaLiquidacao.map((m) => m.pagadorCodigo))].sort()

  const getPagadorNome = (codigo: string) => {
    // O código vem no formato "4557 - PAGADOR16", então extraímos a segunda parte
    const partes = codigo.split(/\s*[-–]\s*/)
    const nomeMapa = partes[1]?.trim() || codigo
    return nomeMapa
  }

  const getCredorNome = (codigo: string) => {
    const partes = codigo.split(/\s*[-–]\s*/)
    const nomeMapa = partes[1]?.trim() || codigo
    return nomeMapa
  }

  const valorMap = new Map<string, number>()
  mapaLiquidacao.forEach((m) => {
    valorMap.set(`${m.pagadorCodigo}-${m.credorCodigo}`, m.valor)
  })

  const getValor = (pagadorCodigo: string, credorCodigo: string) => {
    return valorMap.get(`${pagadorCodigo}-${credorCodigo}`) || 0
  }

  const getTotalPorPagador = (pagadorCodigo: string) => {
    return credoresUnicos.reduce((acc, credorCodigo) => acc + getValor(pagadorCodigo, credorCodigo), 0)
  }

  const getTotalPorCredor = (credorCodigo: string) => {
    return pagadoresUnicos.reduce((acc, pagadorCodigo) => acc + getValor(pagadorCodigo, credorCodigo), 0)
  }

  const getTotalGeral = () => {
    return pagadoresUnicos.reduce((acc, pagadorCodigo) => acc + getTotalPorPagador(pagadorCodigo), 0)
  }

  const pagadoresMapaFiltrados = pagadoresUnicos.filter(
    (pagadorCodigo) =>
      pagadorCodigo.toLowerCase().includes(buscaMapaModal.toLowerCase()) ||
      pagadores
        .find((p) => p.codigo === pagadorCodigo)
        ?.razaoSocial.toLowerCase()
        .includes(buscaMapaModal.toLowerCase()),
  )

  const getAVDPorPagador = () => {
    const avdMap = new Map<
      string,
      {
        pagadorCodigo: string
        pagadorNome: string
        pagadorCnpj: string
        credores: { credorCodigo: string; credorNome: string; valor: number }[]
        total: number
      }
    >()

    mapaLiquidacao.forEach((entrada) => {
      const pagadorCodigo = entrada.pagadorCodigo
      const pagador = pagadores.find(
        (p) =>
          p.codigo === pagadorCodigo ||
          pagadorCodigo.includes(p.codigo) ||
          p.codigo.includes(pagadorCodigo.split(" - ")[0]),
      )
      const pagadorNome = pagador?.razaoSocial || pagadorCodigo
      const pagadorCnpj = pagador?.cnpj || ""

      const credorCodigo = entrada.credorCodigo
      const credor = credoresBase.find(
        (c) =>
          c.codigo === credorCodigo ||
          credorCodigo.includes(c.codigo) ||
          c.codigo.includes(credorCodigo.split(" - ")[0]),
      )
      const credorNome = credor?.nome || credorCodigo

      if (!avdMap.has(pagadorCodigo)) {
        avdMap.set(pagadorCodigo, {
          pagadorCodigo,
          pagadorNome,
          pagadorCnpj,
          credores: [],
          total: 0,
        })
      }

      const avd = avdMap.get(pagadorCodigo)!
      avd.credores.push({ credorCodigo, credorNome, valor: entrada.valor })
      avd.total += entrada.valor
    })

    return Array.from(avdMap.values()).sort((a, b) => b.total - a.total)
  }

  const getAVCPorCredor = () => {
    const avcMap = new Map<
      string,
      {
        credorCodigo: string
        credorNome: string
        credorCnpj: string
        pagadores: { pagadorCodigo: string; pagadorNome: string; valor: number }[]
        total: number
      }
    >()

    mapaLiquidacao.forEach((entrada) => {
      const credorCodigo = entrada.credorCodigo
      const credor = credoresBase.find(
        (c) =>
          c.codigo === credorCodigo ||
          credorCodigo.includes(c.codigo) ||
          c.codigo.includes(credorCodigo.split(" - ")[0]),
      )
      const credorNome = credor?.nome || credorCodigo
      const credorCnpj = credor?.documento || ""

      const pagadorCodigo = entrada.pagadorCodigo
      const pagador = pagadores.find(
        (p) =>
          p.codigo === pagadorCodigo ||
          pagadorCodigo.includes(p.codigo) ||
          p.codigo.includes(pagadorCodigo.split(" - ")[0]),
      )
      const pagadorNome = pagador?.razaoSocial || pagadorCodigo

      if (!avcMap.has(credorCodigo)) {
        avcMap.set(credorCodigo, {
          credorCodigo,
          credorNome,
          credorCnpj,
          pagadores: [],
          total: 0,
        })
      }

      const avc = avcMap.get(credorCodigo)!
      avc.pagadores.push({ pagadorCodigo, pagadorNome, valor: entrada.valor })
      avc.total += entrada.valor
    })

    return Array.from(avcMap.values()).sort((a, b) => b.total - a.total)
  }

  const exportarAVDPagador = (avd: ReturnType<typeof getAVDPorPagador>[0]) => {
    const dataRef = dataReferenciaMapa ? format(dataReferenciaMapa, "MM/yyyy") : "N/A"
    let csv = `Aviso de Débito (AVD) - ${avd.pagadorNome}\n`
    csv += `CNPJ: ${avd.pagadorCnpj}\n`
    csv += `Referência: ${dataRef}\n\n`
    csv += `Credor;Valor\n`
    avd.credores.forEach((c) => {
      csv += `${c.credorNome};${c.valor.toFixed(2).replace(".", ",")}\n`
    })
    csv += `\nTotal;${avd.total.toFixed(2).replace(".", ",")}\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `AVD_${avd.pagadorCodigo.replace(/[^a-zA-Z0-9]/g, "_")}_${dataRef.replace("/", "_")}.csv`
    link.click()
  }

  const exportarAVCCredor = (avc: ReturnType<typeof getAVCPorCredor>[0]) => {
    const dataRef = dataReferenciaMapa ? format(dataReferenciaMapa, "MM/yyyy") : "N/A"
    let csv = `Aviso de Crédito (AVC) - ${avc.credorNome}\n`
    csv += `CNPJ: ${avc.credorCnpj}\n`
    csv += `Referência: ${dataRef}\n\n`
    csv += `Pagador;Valor\n`
    avc.pagadores.forEach((p) => {
      csv += `${p.pagadorNome};${p.valor.toFixed(2).replace(".", ",")}\n`
    })
    csv += `\nTotal;${avc.total.toFixed(2).replace(".", ",")}\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `AVC_${avc.credorCodigo.replace(/[^a-zA-Z0-9]/g, "_")}_${dataRef.replace("/", "_")}.csv`
    link.click()
  }

  const exportarTodosAVDs = () => {
    const dataRef = dataReferenciaMapa ? format(dataReferenciaMapa, "MM/yyyy") : "N/A"
    const avds = getAVDPorPagador()
    let csv = `Relatório de Avisos de Débito (AVD)\n`
    csv += `Referência: ${dataRef}\n\n`
    csv += `Pagador;CNPJ;Credor;Valor\n`
    avds.forEach((avd) => {
      avd.credores.forEach((c) => {
        csv += `${avd.pagadorNome};${avd.pagadorCnpj};${c.credorNome};${c.valor.toFixed(2).replace(".", ",")}\n`
      })
    })

    const totalGeral = avds.reduce((sum, avd) => sum + avd.total, 0)
    csv += `\nTotal Geral;;;${totalGeral.toFixed(2).replace(".", ",")}\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `AVDs_${dataRef.replace("/", "_")}.csv`
    link.click()
  }

  const exportarTodosAVCs = () => {
    const dataRef = dataReferenciaMapa ? format(dataReferenciaMapa, "MM/yyyy") : "N/A"
    const avcs = getAVCPorCredor()
    let csv = `Relatório de Avisos de Crédito (AVC)\n`
    csv += `Referência: ${dataRef}\n\n`
    csv += `Credor;CNPJ;Pagador;Valor\n`
    avcs.forEach((avc) => {
      avc.pagadores.forEach((p) => {
        csv += `${avc.credorNome};${avc.credorCnpj};${p.pagadorNome};${p.valor.toFixed(2).replace(".", ",")}\n`
      })
    })

    const totalGeral = avcs.reduce((sum, avc) => sum + avc.total, 0)
    csv += `\nTotal Geral;;;${totalGeral.toFixed(2).replace(".", ",")}\n`

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `AVCs_${dataRef.replace("/", "_")}.csv`
    link.click()
  }

  const avdList = getAVDPorPagador()
  const avcList = getAVCPorCredor()

  const avdFiltrados = avdList.filter(
    (avd) =>
      avd.pagadorNome.toLowerCase().includes(buscaAVD.toLowerCase()) ||
      avd.pagadorCnpj.includes(buscaAVD) ||
      avd.pagadorCodigo.toLowerCase().includes(buscaAVD.toLowerCase()),
  )

  const avcFiltrados = avcList.filter(
    (avc) =>
      avc.credorNome.toLowerCase().includes(buscaAVC.toLowerCase()) ||
      avc.credorCnpj.includes(buscaAVC) ||
      avc.credorCodigo.toLowerCase().includes(buscaAVC.toLowerCase()),
  )

  const toggleAVDExpandido = (codigo: string) => {
    setAvdExpandidos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) {
        newSet.delete(codigo)
      } else {
        newSet.add(codigo)
      }
      return newSet
    })
  }

  const toggleAVCExpandido = (codigo: string) => {
    setAvcExpandidos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) {
        newSet.delete(codigo)
      } else {
        newSet.add(codigo)
      }
      return newSet
    })
  }

  const expandirTodosAVD = () => {
    setAvdExpandidos(new Set(avdFiltrados.map((avd) => avd.pagadorCodigo)))
  }

  const recolherTodosAVD = () => {
    setAvdExpandidos(new Set())
  }

  const expandirTodosAVC = () => {
    setAvcExpandidos(new Set(avcFiltrados.map((avc) => avc.credorCodigo)))
  }

  const recolherTodosAVC = () => {
    setAvcExpandidos(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Pagadores and Credores - compact cards side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Pagadores */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Pagadores</CardTitle>
                <CardDescription className="text-xs">Cadastro de pagadores do sistema</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3">
                {pagadores.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputPagadores}
                accept=".csv"
                className="hidden"
                onChange={importarPagadores}
              />
              <Button variant="default" size="sm" className="flex-1" onClick={handleNovoPagador}>
                <Plus className="mr-2 h-4 w-4" />
                Novo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => fileInputPagadores.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button
                variant={showPagadores ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowPagadores(!showPagadores)
                  if (!showPagadores) {
                    setShowCredores(false)
                  }
                }}
              >
                {showPagadores ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Gerenciar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Credores */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Credores</CardTitle>
                <CardDescription className="text-xs">Cadastro de credores do sistema</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3">
                {credoresBase.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <input type="file" ref={fileInputCredores} accept=".csv" className="hidden" onChange={importarCredores} />
              <Button variant="default" size="sm" className="flex-1" onClick={handleNovoCredor}>
                <Plus className="mr-2 h-4 w-4" />
                Novo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => fileInputCredores.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
              <Button
                variant={showCredores ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowCredores(!showCredores)
                  if (!showCredores) {
                    setShowPagadores(false)
                  }
                }}
              >
                {showCredores ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Recolher
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Gerenciar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPagadores && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciar Pagadores
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPagadores(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de Adicionar/Editar */}
            <Card
              className={`${editingPagadorId ? "border-amber-500" : "border-dashed"} ${expandedPagadores ? "" : "hidden"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{editingPagadorId ? "Editar Pagador" : "Novo Pagador"}</span>
                  {editingPagadorId && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Editando
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Código *</label>
                    <Input
                      placeholder="PAG001"
                      value={novoPagador.codigo}
                      onChange={(e) => setNovoPagador({ ...novoPagador, codigo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Agente</label>
                    <Input
                      placeholder="Nome do agente"
                      value={novoPagador.agente}
                      onChange={(e) => setNovoPagador({ ...novoPagador, agente: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Razão Social *</label>
                    <Input
                      placeholder="Razão social"
                      value={novoPagador.razaoSocial}
                      onChange={(e) => setNovoPagador({ ...novoPagador, razaoSocial: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">CNPJ *</label>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={novoPagador.cnpj}
                      onChange={(e) => setNovoPagador({ ...novoPagador, cnpj: formatCnpjInput(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Data Pgto Prevista</label>
                    <DateInputBrazilian
                      value={novoPagador.dataPagamentoPrevista}
                      onChange={(value) => setNovoPagador({ ...novoPagador, dataPagamentoPrevista: value })}
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingPagadorId && (
                    <Button variant="outline" size="sm" onClick={handleCancelarPagador}>
                      Cancelar
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSalvarPagador}>
                    {editingPagadorId ? "Salvar Alterações" : "Adicionar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Busca e Tabela */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por agente, razão social, CNPJ ou código..."
                  value={buscaPagadorModal}
                  onChange={(e) => setBuscaPagadorModal(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagadoresFiltrados.map((pagador) => (
                    <TableRow key={pagador.id} className={editingPagadorId === pagador.id ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">{pagador.codigo}</TableCell>
                      <TableCell>{pagador.agente}</TableCell>
                      <TableCell>{pagador.razaoSocial}</TableCell>
                      <TableCell>{pagador.cnpj}</TableCell>
                      <TableCell>{formatDateBrazilian(pagador.dataPagamentoPrevista)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditarPagador(pagador)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPagadores(pagadores.filter((p) => p.id !== pagador.id))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showCredores && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gerenciar Credores
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCredores(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Formulário de Adicionar/Editar */}
            <Card
              className={`${editingCredorId ? "border-amber-500" : "border-dashed"} ${expandedCredores ? "" : "hidden"}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{editingCredorId ? "Editar Credor" : "Novo Credor"}</span>
                  {editingCredorId && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      Editando
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Código *</label>
                    <Input
                      placeholder="CRED001"
                      value={novoCredor.codigo}
                      onChange={(e) => setNovoCredor({ ...novoCredor, codigo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Agente</label>
                    <Input
                      placeholder="Nome do agente"
                      value={novoCredor.agente}
                      onChange={(e) => setNovoCredor({ ...novoCredor, agente: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nome *</label>
                    <Input
                      placeholder="Nome do credor"
                      value={novoCredor.nome}
                      onChange={(e) => setNovoCredor({ ...novoCredor, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Documento (CNPJ) *</label>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={novoCredor.documento}
                      onChange={(e) => setNovoCredor({ ...novoCredor, documento: formatCnpjInput(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Banco</label>
                    <Input
                      placeholder="Código do banco"
                      value={novoCredor.banco}
                      onChange={(e) => setNovoCredor({ ...novoCredor, banco: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Agência</label>
                    <Input
                      placeholder="0000"
                      value={novoCredor.agencia}
                      onChange={(e) => setNovoCredor({ ...novoCredor, agencia: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Conta</label>
                    <Input
                      placeholder="00000-0"
                      value={novoCredor.conta}
                      onChange={(e) => setNovoCredor({ ...novoCredor, conta: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Formas Recebimento</label>
                    <Input
                      placeholder="PIX, TED, Boleto"
                      value={novoCredor.formasRecebimento}
                      onChange={(e) => setNovoCredor({ ...novoCredor, formasRecebimento: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingCredorId && (
                    <Button variant="outline" size="sm" onClick={handleCancelarCredor}>
                      Cancelar
                    </Button>
                  )}
                  <Button size="sm" onClick={handleSalvarCredor}>
                    {editingCredorId ? "Salvar Alterações" : "Adicionar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Busca e Tabela */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, documento, código ou agente..."
                  value={buscaCredorModal}
                  onChange={(e) => setBuscaCredorModal(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Ag/Conta</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credoresFiltrados.map((credor) => (
                    <TableRow key={credor.id} className={editingCredorId === credor.id ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">{credor.codigo}</TableCell>
                      <TableCell>{credor.agente}</TableCell>
                      <TableCell>{credor.nome}</TableCell>
                      <TableCell>{credor.documento}</TableCell>
                      <TableCell>{credor.banco}</TableCell>
                      <TableCell>
                        {credor.agencia}/{credor.conta}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditarCredor(credor)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCredoresBase(credoresBase.filter((c) => c.id !== credor.id))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Row 2: Mapa de Liquidação - full width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <MapIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Mapa de Liquidação</CardTitle>
                <CardDescription>Associações entre pagadores e credores</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {mapaLiquidacao.length} associações
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Data de Referência */}
            <div className="space-y-2">
              <Label className="text-sm">Data de Referência</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    {dataReferenciaMapa
                      ? format(dataReferenciaMapa, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataReferenciaMapa}
                    onSelect={(date) => {
                      setDataReferenciaMapa(date)
                      setCalendarOpen(false)
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Importar CSV */}
            <div className="space-y-2">
              <Label className="text-sm">Importar Dados</Label>
              <input type="file" ref={fileInputMapa} accept=".csv" className="hidden" onChange={importarMapa} />
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => fileInputMapa.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar CSV
              </Button>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="validarCodigoUnico"
                  checked={validarCodigoUnico}
                  onCheckedChange={(checked) => setValidarCodigoUnico(checked === true)}
                />
                <label htmlFor="validarCodigoUnico" className="text-xs text-muted-foreground cursor-pointer">
                  Validar código único
                </label>
              </div>
            </div>

            {/* Visualizar */}
            <div className="space-y-2">
              <Label className="text-sm">Visualizar Mapa</Label>
              <Dialog open={showMapa} onOpenChange={setShowMapa}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent" disabled={mapaLiquidacao.length === 0}>
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-[95vw] !w-[95vw] !h-[85vh] !max-h-[85vh] overflow-hidden flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Mapa de Liquidação</DialogTitle>
                    <DialogDescription>Pagadores em linhas e credores em colunas</DialogDescription>
                  </DialogHeader>
                  <div className="flex-1 flex flex-col min-h-0 space-y-4">
                    <div className="flex-shrink-0">
                      <Input
                        placeholder="Buscar por código ou razão social do pagador..."
                        value={buscaMapaModal}
                        onChange={(e) => setBuscaMapaModal(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex-1 overflow-auto border rounded-lg min-h-0">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted z-10">
                          <TableRow>
                            <TableHead className="sticky left-0 bg-muted z-20 min-w-[200px]">Pagador</TableHead>
                            {credoresUnicos.map((credorCodigo) => (
                              <TableHead key={credorCodigo} className="text-center min-w-[150px]">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{getCredorNome(credorCodigo)}</span>
                                  <span className="text-xs text-muted-foreground">{credorCodigo.split(" - ")[0]}</span>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="text-center min-w-[120px] bg-primary/10 font-bold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagadoresMapaFiltrados.map((pagadorCodigo) => (
                            <TableRow key={pagadorCodigo}>
                              <TableCell className="sticky left-0 bg-background font-medium z-10">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{getPagadorNome(pagadorCodigo)}</span>
                                  <span className="text-xs text-muted-foreground">{pagadorCodigo.split(" - ")[0]}</span>
                                </div>
                              </TableCell>
                              {credoresUnicos.map((credorCodigo) => {
                                const valor = getValor(pagadorCodigo, credorCodigo)
                                return (
                                  <TableCell key={credorCodigo} className="text-right">
                                    {valor > 0
                                      ? `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                      : "-"}
                                  </TableCell>
                                )
                              })}
                              <TableCell className="text-right bg-primary/5 font-semibold">
                                R$
                                {getTotalPorPagador(pagadorCodigo).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-primary/10 font-bold sticky bottom-0">
                            <TableCell className="sticky left-0 bg-primary/10 font-bold z-10">Total</TableCell>
                            {credoresUnicos.map((credorCodigo) => (
                              <TableCell key={credorCodigo} className="text-right font-semibold">
                                R$
                                {getTotalPorCredor(credorCodigo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </TableCell>
                            ))}
                            <TableCell className="text-right font-bold bg-primary/20">
                              R$ {getTotalGeral().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Relatório AVD/AVC */}
            <div className="space-y-2">
              <Label className="text-sm">Relatórios</Label>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                disabled={mapaLiquidacao.length === 0}
                onClick={() => setShowAVD_AVC(true)} // Use updated state name
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatório AVD/AVC
              </Button>
            </div>
          </div>

          {/* Row with History button and reference info */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Dialog open={showHistoricoMapa} onOpenChange={setShowHistoricoMapa}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  disabled={historicoImportacaoMapa.length === 0}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico de Importações ({historicoImportacaoMapa.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-auto" style={{ maxWidth: "95vw", width: "95vw" }}>
                <DialogHeader>
                  <DialogTitle>Histórico de Importações do Mapa</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Referência</TableHead>
                      <TableHead>Data Importação</TableHead>
                      <TableHead className="text-right">Pagadores</TableHead>
                      <TableHead className="text-right">Credores</TableHead>
                      <TableHead className="text-right">Associações</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoImportacaoMapa.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{formatDateBR(h.dataReferencia)}</TableCell>
                        <TableCell>{formatDateBR(h.dataImportacao)}</TableCell>
                        <TableCell className="text-right">{h.totalPagadores}</TableCell>
                        <TableCell className="text-right">{h.totalCredores}</TableCell>
                        <TableCell className="text-right">{h.totalAssociacoes}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                restaurarHistoricoMapa(h)
                                setShowHistoricoMapa(false)
                              }}
                            >
                              Restaurar
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive bg-transparent"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover do histórico?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. O registro de importação de{" "}
                                    {formatDateBR(h.dataReferencia)} será removido permanentemente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => removerHistoricoMapa(h.id)}
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
              </DialogContent>
            </Dialog>

            {dataReferenciaMapa && mapaLiquidacao.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Referência atual:{" "}
                <span className="font-medium">{format(dataReferenciaMapa, "MMMM/yyyy", { locale: ptBR })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* The content for managing pagadores and credores is now rendered inline above */}

      {/* Modal Relatório AVD/AVC */}
      <Dialog open={showAVD_AVC} onOpenChange={setShowAVD_AVC}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] !h-[90vh] !max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              Relatório AVD/AVC
              {dataReferenciaMapa && (
                <Badge variant="outline" className="ml-2">
                  Referência: {format(dataReferenciaMapa, "MMMM/yyyy", { locale: ptBR })}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Avisos de Débito (valores devidos por pagadores) e Avisos de Crédito (valores a receber por credores)
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="avd" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="avd" className="flex items-center gap-2">
                Avisos de Débito (AVD)
                <Badge variant="secondary">{avdList.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="avc" className="flex items-center gap-2">
                Avisos de Crédito (AVC)
                <Badge variant="secondary">{avcList.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="avd" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por pagador, CNPJ ou código..."
                    value={buscaAVD}
                    onChange={(e) => setBuscaAVD(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={avdExpandidos.size > 0 ? recolherTodosAVD : expandirTodosAVD}
                >
                  {avdExpandidos.size > 0 ? (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Recolher Todos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Expandir Todos
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={exportarTodosAVDs}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos
                </Button>
              </div>

              <div className="flex-1 overflow-auto border rounded-lg min-h-0">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="min-w-[200px]">Pagador</TableHead>
                      <TableHead className="min-w-[150px]">CNPJ</TableHead>
                      <TableHead className="min-w-[100px] text-center">Qtd Credores</TableHead>
                      <TableHead className="text-right min-w-[150px]">Total a Pagar</TableHead>
                      <TableHead className="text-center min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avdFiltrados.map((avd) => (
                      <>
                        <TableRow
                          key={avd.pagadorCodigo}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleAVDExpandido(avd.pagadorCodigo)}
                        >
                          <TableCell className="p-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {avdExpandidos.has(avd.pagadorCodigo) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{avd.pagadorNome}</span>
                              <span className="text-xs text-muted-foreground">{avd.pagadorCodigo}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{avd.pagadorCnpj}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{avd.credores.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            R$ {avd.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => exportarAVDPagador(avd)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {avdExpandidos.has(avd.pagadorCodigo) && (
                          <TableRow key={`${avd.pagadorCodigo}-details`} className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 pl-12">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="h-8 text-xs">Credor</TableHead>
                                      <TableHead className="h-8 text-xs">Código</TableHead>
                                      <TableHead className="h-8 text-xs text-right">Valor</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {avd.credores.map((c, idx) => (
                                      <TableRow key={idx} className="hover:bg-muted/50">
                                        <TableCell className="py-2 text-sm">{c.credorNome}</TableCell>
                                        <TableCell className="py-2 text-sm text-muted-foreground">
                                          {c.credorCodigo}
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-right text-red-600">
                                          R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
                <span className="text-sm text-muted-foreground">{avdFiltrados.length} pagador(es)</span>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground mr-2">Total Geral:</span>
                  <span className="text-lg font-bold text-red-600">
                    R$
                    {avdFiltrados
                      .reduce((sum, avd) => sum + avd.total, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="avc" className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por credor, CNPJ ou código..."
                    value={buscaAVC}
                    onChange={(e) => setBuscaAVC(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={avcExpandidos.size > 0 ? recolherTodosAVC : expandirTodosAVC}
                >
                  {avcExpandidos.size > 0 ? (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      Recolher Todos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Expandir Todos
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={exportarTodosAVCs}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todos
                </Button>
              </div>

              <div className="flex-1 overflow-auto border rounded-lg min-h-0">
                <Table>
                  <TableHeader className="sticky top-0 bg-muted z-10">
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead className="min-w-[200px]">Credor</TableHead>
                      <TableHead className="min-w-[150px]">CNPJ</TableHead>
                      <TableHead className="min-w-[100px] text-center">Qtd Pagadores</TableHead>
                      <TableHead className="text-right min-w-[150px]">Total a Receber</TableHead>
                      <TableHead className="text-center min-w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {avcFiltrados.map((avc) => (
                      <>
                        <TableRow
                          key={avc.credorCodigo}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleAVCExpandido(avc.credorCodigo)}
                        >
                          <TableCell className="p-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {avcExpandidos.has(avc.credorCodigo) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{avc.credorNome}</span>
                              <span className="text-xs text-muted-foreground">{avc.credorCodigo}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{avc.credorCnpj}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{avc.pagadores.length}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            R$ {avc.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => exportarAVCCredor(avc)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {avcExpandidos.has(avc.credorCodigo) && (
                          <TableRow key={`${avc.credorCodigo}-details`} className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4 pl-12">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      <TableHead className="h-8 text-xs">Pagador</TableHead>
                                      <TableHead className="h-8 text-xs">Código</TableHead>
                                      <TableHead className="h-8 text-xs text-right">Valor</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {avc.pagadores.map((p, idx) => (
                                      <TableRow key={idx} className="hover:bg-muted/50">
                                        <TableCell className="py-2 text-sm">{p.pagadorNome}</TableCell>
                                        <TableCell className="py-2 text-sm text-muted-foreground">
                                          {p.pagadorCodigo}
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-right text-green-600">
                                          R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
                <span className="text-sm text-muted-foreground">{avcFiltrados.length} credor(es)</span>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground mr-2">Total Geral:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$
                    {avcFiltrados
                      .reduce((sum, avc) => sum + avc.total, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal for adding new pagador */}
      <Dialog
        open={showNovoPagador}
        onOpenChange={(isOpen) => {
          setShowNovoPagador(isOpen)
          if (!isOpen) {
            handleCancelarPagador() // Reset form when modal closes
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPagadorId ? "Editar Pagador" : "Novo Pagador"}</DialogTitle>
            <DialogDescription>Preencha os dados do novo pagador.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={novoPagador.codigo}
                onChange={(e) => setNovoPagador({ ...novoPagador, codigo: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agente" className="text-right">
                Agente
              </Label>
              <Input
                id="agente"
                value={novoPagador.agente}
                onChange={(e) => setNovoPagador({ ...novoPagador, agente: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="razaoSocial" className="text-right">
                Razão Social
              </Label>
              <Input
                id="razaoSocial"
                value={novoPagador.razaoSocial}
                onChange={(e) => setNovoPagador({ ...novoPagador, razaoSocial: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cnpj" className="text-right">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={novoPagador.cnpj}
                onChange={(e) => setNovoPagador({ ...novoPagador, cnpj: formatCnpjInput(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataPagamentoPrevista" className="text-right">
                Data Prevista
              </Label>
              <div className="col-span-3">
                <DateInputBrazilian
                  value={novoPagador.dataPagamentoPrevista}
                  onChange={(date) => setNovoPagador({ ...novoPagador, dataPagamentoPrevista: date })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            {editingPagadorId && (
              <Button variant="outline" onClick={handleCancelarPagador}>
                Cancelar Edição
              </Button>
            )}
            <Button type="submit" onClick={handleSalvarPagador}>
              {editingPagadorId ? "Salvar Alterações" : "Adicionar Pagador"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for adding new credor */}
      <Dialog
        open={showNovoCredor}
        onOpenChange={(isOpen) => {
          setShowNovoCredor(isOpen)
          if (!isOpen) {
            handleCancelarCredor() // Reset form when modal closes
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCredorId ? "Editar Credor" : "Novo Credor"}</DialogTitle>
            <DialogDescription>Preencha os dados do novo credor.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={novoCredor.codigo}
                onChange={(e) => setNovoCredor({ ...novoCredor, codigo: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agente" className="text-right">
                Agente
              </Label>
              <Input
                id="agente"
                value={novoCredor.agente}
                onChange={(e) => setNovoCredor({ ...novoCredor, agente: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={novoCredor.nome}
                onChange={(e) => setNovoCredor({ ...novoCredor, nome: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="documento" className="text-right">
                Documento
              </Label>
              <Input
                id="documento"
                value={novoCredor.documento}
                onChange={(e) => setNovoCredor({ ...novoCredor, documento: formatCnpjInput(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="banco" className="text-right">
                Banco
              </Label>
              <Input
                id="banco"
                value={novoCredor.banco}
                onChange={(e) => setNovoCredor({ ...novoCredor, banco: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agencia" className="text-right">
                Agência
              </Label>
              <Input
                id="agencia"
                value={novoCredor.agencia}
                onChange={(e) => setNovoCredor({ ...novoCredor, agencia: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conta" className="text-right">
                Conta
              </Label>
              <Input
                id="conta"
                value={novoCredor.conta}
                onChange={(e) => setNovoCredor({ ...novoCredor, conta: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="formasRecebimento" className="text-right">
                Formas Recebimento
              </Label>
              <Input
                id="formasRecebimento"
                value={novoCredor.formasRecebimento}
                onChange={(e) => setNovoCredor({ ...novoCredor, formasRecebimento: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            {editingCredorId && (
              <Button variant="outline" onClick={handleCancelarCredor}>
                Cancelar Edição
              </Button>
            )}
            <Button type="submit" onClick={handleSalvarCredor}>
              {editingCredorId ? "Salvar Alterações" : "Adicionar Credor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDuplicadosModal} onOpenChange={setShowDuplicadosModal}>
        <DialogContent className="max-h-[80vh] overflow-auto" style={{ maxWidth: "90vw", width: "90vw" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Códigos Duplicados Detectados
            </DialogTitle>
            <DialogDescription>
              Foram encontrados códigos duplicados no arquivo. Você pode editar os códigos abaixo antes de confirmar a
              importação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {duplicadosPagadores.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Pagadores com Código Duplicado
                </h4>
                <div className="space-y-2">
                  {duplicadosPagadores.map((dup, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {dup.ocorrencias}x
                      </Badge>
                      <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                        <div>
                          <Label className="text-xs text-muted-foreground">Código Original</Label>
                          <p className="font-mono text-sm">{dup.codigo}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Novo Código</Label>
                          <Input
                            value={dup.novoCodigoBase}
                            onChange={(e) => {
                              const novos = [...duplicadosPagadores]
                              novos[idx].novoCodigoBase = e.target.value
                              setDuplicadosPagadores(novos)
                            }}
                            className="h-8 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {duplicadosCredores.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Credores com Código Duplicado
                </h4>
                <div className="space-y-2">
                  {duplicadosCredores.map((dup, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {dup.ocorrencias}x
                      </Badge>
                      <div className="flex-1 grid grid-cols-2 gap-3 items-center">
                        <div>
                          <Label className="text-xs text-muted-foreground">Código Original</Label>
                          <p className="font-mono text-sm">{dup.codigo}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Novo Código</Label>
                          <Input
                            value={dup.novoCodigoBase}
                            onChange={(e) => {
                              const novos = [...duplicadosCredores]
                              novos[idx].novoCodigoBase = e.target.value
                              setDuplicadosCredores(novos)
                            }}
                            className="h-8 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicadosModal(false)
                setDuplicadosPagadores([])
                setDuplicadosCredores([])
                setMapaPreview([])
              }}
            >
              Cancelar Importação
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                confirmarImportacaoMapa(mapaPreview, pagadoresSetPreview, credoresSetPreview)
                setShowDuplicadosModal(false)
                setDuplicadosPagadores([])
                setDuplicadosCredores([])
                setMapaPreview([])
              }}
            >
              Importar sem Alterações
            </Button>
            <Button onClick={aplicarCorrecoesDuplicados}>Aplicar Correções e Importar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

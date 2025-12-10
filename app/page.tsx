"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  TrendingUp,
  GitCompare,
  AlertCircle,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ChevronRight,
  LucideMapPin as LucideMapIcon,
  MessageSquare,
  Bell,
  MessageCircle,
  Send,
  X,
  Bot,
  Shield,
  SettingsIcon,
  LogOut,
  Trash2,
} from "lucide-react"
import { DistribuidorProporcional } from "@/components/distribuidor-proporcional"
import { ConciliadorInteligente } from "@/components/conciliador-inteligente"
import {
  Administracao,
  type Pagador,
  type CredorBase,
  type MapaLiquidacao,
  type HistoricoImportacao,
} from "@/components/administracao"
import { cn } from "@/lib/utils"
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
} from "@/components/ui/alert-dialog" // Added AlertDialog import

interface Mensagem {
  id: number
  remetente: string
  assunto: string
  preview: string
  data: string
  lida: boolean
}

interface Notificacao {
  id: number
  tipo: "info" | "warning" | "success" | "error"
  titulo: string
  descricao: string
  data: string
  lida: boolean
}

interface Alerta {
  id: number
  tipo: "info" | "warning" | "success" | "error"
  titulo: string
  descricao: string
  acao: string
}

export default function PlataformaUnica() {
  const [activeModule, setActiveModule] = useState<"dashboard" | "distribuidor" | "conciliador" | "administracao">(
    "dashboard",
  )

  const [pagadores, setPagadores] = useState<Pagador[]>([])
  const [credoresBase, setCredoresBase] = useState<CredorBase[]>([])
  const [mapaLiquidacao, setMapaLiquidacao] = useState<MapaLiquidacao[]>([])
  const [dataReferenciaMapa, setDataReferenciaMapa] = useState<Date | undefined>(undefined)
  const [historicoImportacaoMapa, setHistoricoImportacaoMapa] = useState<HistoricoImportacao[]>([])
  const [estatisticasConciliacao, setEstatisticasConciliacao] = useState({
    totalPagamentos: 0,
    conciliados: 0,
    divergentes: 0,
    excecoes: 0,
  })

  const [alertas, setAlertas] = useState([
    {
      id: 1,
      tipo: "warning",
      titulo: "3 pagamentos com divergência detectada",
      descricao: "Requerem análise no Conciliador Inteligente",
      acao: "Revisar",
    },
    {
      id: 2,
      tipo: "success",
      titulo: "Distribuição proporcional confirmada",
      descricao: "R$ 75.000,00 distribuídos entre 5 credores",
      acao: "Ver Detalhes",
    },
  ])

  const [estatisticasDistribuidor, setEstatisticasDistribuidor] = useState({
    distribuicoesAtivas: 0,
    ultimaSimulacao: "",
    valorProcessado: 0,
  })

  const totalDistribuir = mapaLiquidacao.reduce((acc, item) => acc + item.valor, 0)

  const taxaConciliacao =
    estatisticasConciliacao.totalPagamentos > 0
      ? Math.round((estatisticasConciliacao.conciliados / estatisticasConciliacao.totalPagamentos) * 100)
      : 0

  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      remetente: "Financeiro",
      assunto: "Pagamento confirmado",
      preview: "O pagamento do credor XPTO foi confirmado com sucesso...",
      data: "Hoje, 14:30",
      lida: false,
    },
    {
      id: 2,
      remetente: "Suporte",
      assunto: "Atualização do sistema",
      preview: "Uma nova versão do sistema está disponível com melhorias...",
      data: "Hoje, 10:15",
      lida: false,
    },
    {
      id: 3,
      remetente: "Administração",
      assunto: "Relatório mensal disponível",
      preview: "O relatório consolidado de novembro já está disponível para...",
      data: "Ontem, 18:00",
      lida: true,
    },
    {
      id: 4,
      remetente: "Sistema",
      assunto: "Backup realizado",
      preview: "O backup automático foi concluído com sucesso às 03:00...",
      data: "Há 30 min",
      lida: true,
    },
  ])

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([
    {
      id: 1,
      tipo: "warning",
      titulo: "Pagamento com divergência",
      descricao: "3 pagamentos precisam de análise no Conciliador",
      data: "Agora",
      lida: false,
    },
    {
      id: 2,
      tipo: "success",
      titulo: "Rateio confirmado",
      descricao: "R$ 75.000,00 distribuídos entre 5 credores",
      data: "Há 30 min",
      lida: false,
    },
    {
      id: 3,
      tipo: "info",
      titulo: "Novo pagador cadastrado",
      descricao: "Empresa ABC foi adicionada ao sistema",
      data: "Há 2 horas",
      lida: false,
    },
    {
      id: 4,
      tipo: "error",
      titulo: "Falha na importação",
      descricao: "O arquivo mapa.csv contém erros de formatação",
      data: "Há 3 horas",
      lida: true,
    },
    {
      id: 5,
      tipo: "success",
      titulo: "Conciliação automática",
      descricao: "12 pagamentos foram conciliados automaticamente",
      data: "Ontem",
      lida: true,
    },
  ])

  const [chatAberto, setChatAberto] = useState(false)
  const [chatMensagens, setChatMensagens] = useState<
    { id: number; tipo: "user" | "bot"; texto: string; hora: string }[]
  >([
    {
      id: 1,
      tipo: "bot",
      texto: "Olá! Sou o assistente virtual da Plataforma Única. Como posso ajudar você hoje?",
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: 2,
      tipo: "bot",
      texto:
        "Posso responder perguntas sobre:\n• Distribuidor Proporcional\n• Conciliador Inteligente\n• Configurações do sistema\n• Importação de dados",
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const chatMessagesEndRef = useRef<HTMLDivElement>(null)

  const mensagensNaoLidas = mensagens.filter((m) => !m.lida).length
  const notificacoesNaoLidas = notificacoes.filter((n) => !n.lida).length

  const marcarMensagemComoLida = (id: number) => {
    setMensagens((prev) => prev.map((m) => (m.id === id ? { ...m, lida: true } : m)))
  }

  const marcarNotificacaoComoLida = (id: number) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  const getNotificacaoIcone = (tipo: Notificacao["tipo"]) => {
    switch (tipo) {
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const enviarMensagemChat = () => {
    if (!chatInput.trim()) return

    const novaMensagemUser = {
      id: chatMensagens.length + 1,
      tipo: "user" as const,
      texto: chatInput,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMensagens((prev) => [...prev, novaMensagemUser])
    setChatInput("")

    // Simular resposta do bot
    setTimeout(() => {
      const respostas: { [key: string]: string } = {
        distribuidor:
          "O Distribuidor Proporcional permite calcular e distribuir valores entre credores de forma proporcional. Você pode simular distribuições, definir valores mínimos e confirmar rateios.",
        conciliador:
          "O Conciliador Inteligente ajuda a reconciliar pagamentos recebidos com os valores esperados. Você pode registrar pagamentos, classificá-los e acompanhar o status de cada um.",
        configurações:
          "Na aba Configurações você pode importar dados de pagadores, credores e o mapa de liquidação. Também é possível definir o valor mínimo para rateio.",
        importar:
          "Para importar dados, acesse a aba Configurações e use os botões de importar CSV para cada tipo de dado: Pagadores, Credores ou Mapa de Liquidação.",
        rateio:
          "O rateio é calculado proporcionalmente ao valor devido de cada credor. Credores com valor abaixo do mínimo são excluídos da distribuição.",
      }

      let resposta =
        "Desculpe, não encontrei informações específicas sobre isso. Posso ajudar com dúvidas sobre o Distribuidor Proporcional, Conciliador Inteligente ou Configurações do sistema."

      const inputLower = chatInput.toLowerCase()
      for (const [chave, texto] of Object.entries(respostas)) {
        if (inputLower.includes(chave)) {
          resposta = texto
          break
        }
      }

      const novaMensagemBot = {
        id: chatMensagens.length + 2,
        tipo: "bot" as const,
        texto: resposta,
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMensagens((prev) => [...prev, novaMensagemBot])
    }, 1000)
  }

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMensagens, chatAberto])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Plataforma Única</h1>
                <p className="text-xs text-muted-foreground">Sistema de Gestão de Pagamentos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Messages Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {mensagensNaoLidas > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {mensagensNaoLidas}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="border-b p-3">
                    <h4 className="font-semibold">Mensagens</h4>
                    <p className="text-xs text-muted-foreground">{mensagensNaoLidas} não lida(s)</p>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="divide-y">
                      {mensagens.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            !msg.lida && "bg-primary/5",
                          )}
                          onClick={() => marcarMensagemComoLida(msg.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{msg.remetente}</span>
                                {!msg.lida && <span className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <p className="text-sm font-medium truncate">{msg.assunto}</p>
                              <p className="text-xs text-muted-foreground truncate">{msg.preview}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{msg.data}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t p-2">
                    <Button variant="ghost" className="w-full text-sm">
                      Ver todas as mensagens
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Notifications Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notificacoesNaoLidas > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {notificacoesNaoLidas}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="border-b p-3">
                    <h4 className="font-semibold">Notificações</h4>
                    <p className="text-xs text-muted-foreground">{notificacoesNaoLidas} não lida(s)</p>
                  </div>
                  <ScrollArea className="h-80">
                    <div className="divide-y">
                      {notificacoes.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            !notif.lida && "bg-primary/5",
                          )}
                          onClick={() => marcarNotificacaoComoLida(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">{getNotificacaoIcone(notif.tipo)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-sm">{notif.titulo}</span>
                                {!notif.lida && <span className="h-2 w-2 rounded-full bg-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground">{notif.descricao}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.data}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="border-t p-2">
                    <Button variant="ghost" className="w-full text-sm">
                      Ver todas as notificações
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* User Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/admin-user-professional.jpg" alt="Usuário" />
                      <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/admin-user-professional.jpg" alt="Usuário" />
                          <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium leading-none">Super Admin</p>
                          <p className="text-xs text-muted-foreground">superadmin@ons.org.br</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="default" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Super Administrador
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Operador Nacional do Sistema Elétrico - ONS</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir Conta</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Added Administração tab */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveModule("dashboard")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeModule === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveModule("distribuidor")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeModule === "distribuidor"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Distribuidor Proporcional
            </button>
            <button
              onClick={() => setActiveModule("conciliador")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeModule === "conciliador"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <GitCompare className="h-4 w-4" />
              Conciliador Inteligente
            </button>
            <button
              onClick={() => setActiveModule("administracao")}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeModule === "administracao"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <LucideMapIcon className="h-4 w-4" />
              Mapa de Liquidação
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        {activeModule === "dashboard" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total a Distribuir</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {totalDistribuir.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mapaLiquidacao.length > 0
                      ? `${mapaLiquidacao.length} registros no mapa`
                      : "Importe o mapa de liquidação"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Credores Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{credoresBase.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {credoresBase.length > 0 ? "Aguardando pagamento" : "Cadastre credores"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagadores Cadastrados</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pagadores.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {pagadores.length > 0 ? "No sistema" : "Cadastre pagadores"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conciliação</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taxaConciliacao}%</div>
                  <p className="text-xs text-muted-foreground">
                    {estatisticasConciliacao.totalPagamentos > 0
                      ? `${estatisticasConciliacao.conciliados}/${estatisticasConciliacao.totalPagamentos} conciliados`
                      : "Importe pagamentos"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveModule("distribuidor")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Distribuidor Proporcional</CardTitle>
                      <CardDescription>Calcule e distribua pagamentos entre credores</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Distribuições Ativas</span>
                      <span className="font-medium">{estatisticasDistribuidor.distribuicoesAtivas}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Última Simulação</span>
                      <span className="font-medium">{estatisticasDistribuidor.ultimaSimulacao || "Nenhuma"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor Processado</span>
                      <span className="font-medium text-green-600">
                        R${" "}
                        {estatisticasDistribuidor.valorProcessado.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveModule("conciliador")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <GitCompare className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Conciliador Inteligente</CardTitle>
                      <CardDescription>Reconcilie pagamentos realizados fora da plataforma</CardDescription>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pagamentos Recebidos</span>
                      <span className="font-medium">{estatisticasConciliacao.totalPagamentos}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Conciliados</span>
                      <span className="font-medium text-success">{estatisticasConciliacao.conciliados}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exceções</span>
                      <span className="font-medium text-warning">{estatisticasConciliacao.excecoes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Alertas e Notificações
                    {alertas.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {alertas.length}
                      </Badge>
                    )}
                  </CardTitle>
                  {alertas.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Limpar Todos
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar todos os alertas?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover todos os {alertas.length} alerta(s) da lista. Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => setAlertas([])}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Sim, limpar todos
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {alertas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">Nenhum alerta pendente</p>
                    <p className="text-sm">Todos os alertas foram resolvidos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alertas.map((alerta) => (
                      <div
                        key={alerta.id}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-4",
                          alerta.tipo === "warning" && "border-amber-500/20 bg-amber-500/5",
                          alerta.tipo === "success" && "border-primary/20 bg-primary/5",
                          alerta.tipo === "error" && "border-destructive/20 bg-destructive/5",
                        )}
                      >
                        {alerta.tipo === "warning" && <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />}
                        {alerta.tipo === "success" && <CheckCircle className="h-5 w-5 text-primary mt-0.5" />}
                        {alerta.tipo === "error" && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alerta.titulo}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alerta.descricao}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (alerta.tipo === "warning") setActiveModule("conciliador")
                              else setActiveModule("distribuidor")
                            }}
                          >
                            {alerta.acao}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setAlertas(alertas.filter((a) => a.id !== alerta.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeModule === "distribuidor" && (
          <DistribuidorProporcional
            credoresBase={credoresBase}
            pagadores={pagadores}
            mapaLiquidacao={mapaLiquidacao}
            onEstatisticasChange={(stats) => setEstatisticasDistribuidor(stats)}
          />
        )}
        {activeModule === "conciliador" && (
          <ConciliadorInteligente
            credoresBase={credoresBase}
            mapaLiquidacao={mapaLiquidacao}
            pagadores={pagadores}
            dataReferenciaMapa={dataReferenciaMapa}
            onEstatisticasChange={setEstatisticasConciliacao}
          />
        )}
        {activeModule === "administracao" && (
          <Administracao
            pagadores={pagadores}
            setPagadores={setPagadores}
            credoresBase={credoresBase}
            setCredoresBase={setCredoresBase}
            mapaLiquidacao={mapaLiquidacao}
            setMapaLiquidacao={setMapaLiquidacao}
            dataReferenciaMapa={dataReferenciaMapa}
            setDataReferenciaMapa={setDataReferenciaMapa}
            historicoImportacaoMapa={historicoImportacaoMapa}
            setHistoricoImportacaoMapa={setHistoricoImportacaoMapa}
          />
        )}
      </main>

      {/* Chat Button */}
      <button
        onClick={() => setChatAberto(!chatAberto)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105",
          chatAberto && "rotate-90",
        )}
      >
        {chatAberto ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {chatAberto && (
        <div className="fixed bottom-24 right-6 z-50 w-96 rounded-lg border bg-card shadow-xl">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b bg-primary p-4 rounded-t-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-foreground">Assistente Virtual</h3>
              <p className="text-xs text-primary-foreground/70">Online</p>
            </div>
            <button
              onClick={() => setChatAberto(false)}
              className="text-primary-foreground/70 hover:text-primary-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {chatMensagens.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.tipo === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      msg.tipo === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.texto}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        msg.tipo === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {msg.hora}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatMessagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                enviarMensagemChat()
              }}
              className="flex gap-2"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-muted/50 border-t border-border py-1 px-4 text-center z-40">
        <p className="text-xs text-muted-foreground">
          v.1.3.181 — sistema transiente / sem persistência — demonstração
        </p>
      </footer>
    </div>
  )
}

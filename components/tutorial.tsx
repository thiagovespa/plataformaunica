"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  CheckCircle2,
  Chrome,
  FileBox as Firefox,
  Award as Safari,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle,
  ArrowRight,
  Download,
} from "lucide-react"

export function Tutorial() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [isExporting, setIsExporting] = useState(false)

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  const browserCompatibility = [
    {
      browser: "Chrome",
      icon: Chrome,
      desktop: { version: "90+", status: "full" },
      mobile: { version: "90+", status: "full" },
    },
    {
      browser: "Firefox",
      icon: Firefox,
      desktop: { version: "88+", status: "full" },
      mobile: { version: "88+", status: "full" },
    },
    {
      browser: "Safari",
      icon: Safari,
      desktop: { version: "14+", status: "full" },
      mobile: { version: "14+", status: "full" },
    },
    {
      browser: "Edge",
      icon: Globe,
      desktop: { version: "90+", status: "full" },
      mobile: { version: "90+", status: "full" },
    },
  ]

  const tutorialSections = [
    {
      id: "conciliador",
      title: "Conciliador Inteligente",
      description: "Aprenda a conciliar pagamentos recebidos com o mapa de liquidação",
      steps: [
        {
          id: "import-bank",
          title: "1. Importar Arquivo Bancário",
          content:
            "Vá até a aba 'Conciliador Inteligente' e clique em 'Importar Arquivo Bancário'. Suportamos OFX, CNAB240 e CNAB400.",
        },
        {
          id: "analyze-payments",
          title: "2. Analisar Pagamentos",
          content:
            "Após a importação, os pagamentos serão listados. O sistema automaticamente tentará conciliar com base em CNPJ e código do pagador.",
        },
        {
          id: "manual-reconciliation",
          title: "3. Conciliação Manual",
          content:
            "Para exceções, clique em 'Conciliar' para associar manualmente o pagamento a um ou mais pagadores do mapa de liquidação.",
        },
        {
          id: "fractionated",
          title: "4. Pagamentos Fracionados",
          content:
            "Ao conciliar com múltiplos pagadores, o sistema cria registros fracionados mantendo o banco original.",
        },
      ],
    },
    {
      id: "distribuidor",
      title: "Distribuidor Proporcional",
      description: "Distribua valores entre credores de forma proporcional",
      steps: [
        {
          id: "select-debtors",
          title: "1. Selecionar Pagadores",
          content: "Escolha os pagadores que farão o repasse aos credores na seção 'Pagadores Disponíveis'.",
        },
        {
          id: "distribute",
          title: "2. Distribuir Proporcionalmente",
          content:
            "Clique em 'Distribuir Proporcionalmente' para calcular automaticamente os valores baseados no mapa de liquidação.",
        },
        {
          id: "export-results",
          title: "3. Exportar Resultados",
          content: "Exporte a distribuição em formato CSV para processamento ou arquivo.",
        },
      ],
    },
    {
      id: "administracao",
      title: "Mapa de Liquidação",
      description: "Gerencie pagadores, credores e o mapa de liquidação",
      steps: [
        {
          id: "import-debtors",
          title: "1. Importar Pagadores",
          content: "Importe a lista de pagadores via CSV com colunas: Código, Razão Social, CNPJ.",
        },
        {
          id: "import-creditors",
          title: "2. Importar Credores",
          content: "Importe a lista de credores via CSV com colunas: Código, Nome, Documento, Forma de Recebimento.",
        },
        {
          id: "import-map",
          title: "3. Importar Mapa de Liquidação",
          content: "Importe o mapa com: Código Pagador, Código Credor, Valor Esperado.",
        },
        {
          id: "view-reports",
          title: "4. Visualizar Relatórios",
          content: "Acesse o relatório AVD por pagador ou credor para analisar a distribuição.",
        },
      ],
    },
    {
      id: "api",
      title: "API REST",
      description: "Integre com sistemas externos usando nossa API",
      steps: [
        {
          id: "api-endpoint",
          title: "1. Endpoint de Pagamentos",
          content: "POST /api/pagamentos - Envie novos pagamentos diretamente para o sistema.",
        },
        {
          id: "api-fields",
          title: "2. Campos Obrigatórios",
          content:
            "data, valor, pagador, cnpj, formaPagamento, credorCodigo, credorNome, credorDocumento, credorFormaRecebimento.",
        },
        {
          id: "api-docs",
          title: "3. Documentação Completa",
          content: "Consulte os arquivos API_DOCUMENTATION.md e GUIA_USO_API.md para exemplos em múltiplas linguagens.",
        },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "full":
        return <Badge className="bg-green-500">Suporte Total</Badge>
      case "partial":
        return <Badge className="bg-yellow-500">Suporte Parcial</Badge>
      case "none":
        return <Badge variant="destructive">Sem Suporte</Badge>
      default:
        return null
    }
  }

  const exportCompatibilityToPDF = async () => {
    setIsExporting(true)
    try {
      // Dynamically import jsPDF and html2canvas
      const jsPDF = (await import("jspdf")).default
      const html2canvas = (await import("html2canvas")).default

      // Get the compatibility section
      const element = document.getElementById("compatibility-matrix")
      if (!element) {
        throw new Error("Elemento de compatibilidade não encontrado")
      }

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add title
      pdf.setFontSize(18)
      pdf.text("Matriz de Compatibilidade de Navegadores", 10, 15)
      pdf.setFontSize(10)
      pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 10, 22)

      // Add image
      pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight)

      // Save PDF
      pdf.save(`compatibilidade-navegadores-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Erro ao gerar PDF. Por favor, tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Tutorial da Plataforma</h1>
          <p className="text-muted-foreground">Guia completo para usar todas as funcionalidades</p>
        </div>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="getting-started">Primeiros Passos</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo à Plataforma Única</CardTitle>
              <CardDescription>
                Sistema completo de conciliação, distribuição e gerenciamento de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Requisito:</strong> Certifique-se de ter importado pagadores, credores e o mapa de liquidação
                  antes de usar o Conciliador.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fluxo Recomendado</h3>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Configure o Mapa de Liquidação</h4>
                    <p className="text-sm text-muted-foreground">
                      Importe pagadores, credores e o mapa de liquidação na aba "Mapa de Liquidação"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Importe Pagamentos</h4>
                    <p className="text-sm text-muted-foreground">
                      Use o Conciliador Inteligente para importar arquivos bancários (OFX, CNAB)
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Concilie e Distribua</h4>
                    <p className="text-sm text-muted-foreground">
                      Concilie pagamentos e use o Distribuidor Proporcional para calcular repasses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {tutorialSections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className="mt-1">
                      {completedSteps.has(step.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{step.content}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Matriz de Compatibilidade de Navegadores</CardTitle>
                  <CardDescription>Navegadores e versões suportados pela plataforma</CardDescription>
                </div>
                <Button onClick={exportCompatibilityToPDF} disabled={isExporting} size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  {isExporting ? "Exportando..." : "Exportar PDF"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div id="compatibility-matrix" className="space-y-6">
                {/* Desktop Compatibility */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Monitor className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Desktop</h3>
                  </div>
                  <div className="grid gap-4">
                    {browserCompatibility.map((browser) => {
                      const Icon = browser.icon
                      return (
                        <div
                          key={`desktop-${browser.browser}`}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6" />
                            <div>
                              <p className="font-medium">{browser.browser}</p>
                              <p className="text-sm text-muted-foreground">Versão {browser.desktop.version}</p>
                            </div>
                          </div>
                          {getStatusBadge(browser.desktop.status)}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Mobile Compatibility */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Mobile</h3>
                  </div>
                  <div className="grid gap-4">
                    {browserCompatibility.map((browser) => {
                      const Icon = browser.icon
                      return (
                        <div
                          key={`mobile-${browser.browser}`}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6" />
                            <div>
                              <p className="font-medium">{browser.browser} Mobile</p>
                              <p className="text-sm text-muted-foreground">Versão {browser.mobile.version}</p>
                            </div>
                          </div>
                          {getStatusBadge(browser.mobile.status)}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Features Support */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Recursos Suportados</h3>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Importação de arquivos (CSV, OFX, CNAB)</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Exportação de relatórios (CSV)</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Validação de dados em tempo real</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">API REST para integrações</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm">Tema claro/escuro</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Nota:</strong> Para melhor experiência, recomendamos usar as versões mais recentes dos
                    navegadores listados acima.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

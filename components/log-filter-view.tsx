"use client"

import { useMemo, useState } from "react"
import type { FilterResult } from "@/lib/log-filters"

// Acima deste total, renderizar um <input> por linha travaria o navegador,
// então mostramos o resultado completo em um único campo de texto.
const MAX_INPUTS = 1000

type LogFilterViewProps = {
  title: string
  description: string
  placeholder: string
  /** Função de filtro que recebe o conteúdo colado e a data, e retorna o resultado. */
  filterFn: (content: string, dateString: string) => FilterResult
  /** Dica sobre o formato de linha esperado. */
  formatHint: string
  /** Quando true, mostra sempre o resultado num único campo de texto em vez de um input por linha. */
  singleField?: boolean
}

export function LogFilterView({
  title,
  description,
  placeholder,
  filterFn,
  formatHint,
  singleField = false,
}: LogFilterViewProps) {
  const [content, setContent] = useState("")
  const [dateString, setDateString] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const result: FilterResult | null = useMemo(() => {
    if (!submitted) return null
    return filterFn(content, dateString)
  }, [submitted, content, dateString, filterFn])

  const handleFilter = () => {
    setCopied(false)
    setSubmitted(true)
  }

  const readFile = async (file: File) => {
    const text = await file.text()
    setContent(text)
    setFileName(file.name)
    setSubmitted(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void readFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void readFile(file)
    e.target.value = ""
  }

  const handleCopyAll = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result.lines.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${dateString.replace("/", "-")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-balance">{title}</h1>
        <p className="leading-relaxed text-muted-foreground">{description}</p>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="log-content" className="text-sm font-medium">
              Cole ou arraste o log.txt
            </label>
            <label className="cursor-pointer rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent">
              Selecionar arquivo
              <input type="file" accept=".txt,.log,text/plain" onChange={handleFileInput} className="sr-only" />
            </label>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            onDrop={handleDrop}
            className="relative"
          >
            <textarea
              id="log-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              className="h-56 w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />
            {isDragging && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md border-2 border-dashed border-primary bg-primary/10">
                <span className="text-sm font-medium text-primary">Solte o arquivo aqui</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{formatHint}</p>
            {fileName && (
              <p className="text-xs text-muted-foreground">
                Arquivo carregado: <span className="font-medium text-foreground">{fileName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="date-input" className="text-sm font-medium">
              Data (dia/mês)
            </label>
            <input
              id="date-input"
              type="text"
              value={dateString}
              onChange={(e) => setDateString(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) handleFilter()
              }}
              placeholder="ex.: 22/7"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={handleFilter}
            className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Filtrar
          </button>
        </div>
      </section>

      {result && (
        <section className="flex flex-col gap-3">
          {result.error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {result.error}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{result.matchedLines}</span> de {result.totalLines}{" "}
                  linhas correspondem à data informada.
                </p>
                {result.matchedLines > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                    >
                      {copied ? "Copiado!" : "Copiar tudo"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                    >
                      Baixar .txt
                    </button>
                  </div>
                )}
              </div>

              {result.matchedLines === 0 ? (
                <p className="rounded-md border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
                  Nenhuma linha encontrada para essa data.
                </p>
              ) : singleField || result.matchedLines > MAX_INPUTS ? (
                <div className="flex flex-col gap-2">
                  {result.matchedLines > MAX_INPUTS && (
                    <p className="text-xs text-muted-foreground">
                      Muitas linhas para exibir uma a uma ({result.matchedLines.toLocaleString("pt-BR")}). Mostrando o
                      resultado completo no campo abaixo — use &quot;Copiar tudo&quot; ou &quot;Baixar .txt&quot;.
                    </p>
                  )}
                  <textarea
                    readOnly
                    value={result.lines.join("\n")}
                    spellCheck={false}
                    className="h-[28rem] w-full resize-y rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-ring"
                    onFocus={(e) => e.currentTarget.select()}
                  />
                </div>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {result.lines.map((line, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        readOnly
                        value={line}
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                        onFocus={(e) => e.currentTarget.select()}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}

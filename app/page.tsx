import Link from "next/link"

const tools = [
  {
    href: "/logs-por-data",
    title: "Logs por data",
    description:
      "Filtra logs em texto cujas linhas começam com a data no formato DD/MM HH:MM:SS. Mantém apenas as linhas do dia informado.",
    sample: "22/7 13:05:01 servidor iniciado...",
  },
  {
    href: "/logs-estruturados",
    title: "Logs estruturados",
    description:
      'Filtra logs em JSON cujas linhas começam com {"timestamp":<ms>}. Usa o timestamp em milissegundos para manter apenas as linhas do dia informado.',
    sample: '{"timestamp":1721646301000,"level":"info",...}',
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-balance">Log Slicer</h1>
        <p className="max-w-2xl leading-relaxed text-muted-foreground text-pretty">
          Cole o conteúdo do seu log, informe uma data e veja apenas as linhas daquele dia — direto no navegador, sem
          upload de arquivo. Escolha a ferramenta conforme o formato do seu log.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <h2 className="text-lg font-medium">{tool.title}</h2>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              {tool.sample}
            </code>
            <span className="text-sm font-medium text-primary group-hover:underline">Abrir ferramenta →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

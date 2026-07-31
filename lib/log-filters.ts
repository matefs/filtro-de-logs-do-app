import moment from "moment"

export type FilterResult = {
  lines: string[]
  totalLines: number
  matchedLines: number
  error?: string
}

/**
 * Constrói um moment a partir das partes de data/hora usando o ano atual —
 * igual à função parseLogDate dos scripts Deno originais.
 */
function makeMoment(day: number, month: number, hour: number, minute: number, second: number, ms = 0): moment.Moment {
  return moment({
    year: moment().year(),
    month: month - 1,
    day,
    hour,
    minute,
    second,
    millisecond: ms,
  })
}

/**
 * Converte uma string de data no formato "D/M" (ex.: "22/7") no intervalo do
 * dia inteiro (00:00:00.000 até 23:59:59.999), usando o ano atual.
 */
function parseDayRange(dateString: string): { start: moment.Moment; end: moment.Moment } | null {
  const match = dateString.trim().match(/^(\d{1,2})\/(\d{1,2})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])

  const start = makeMoment(day, month, 0, 0, 0, 0)
  const end = makeMoment(day, month, 23, 59, 59, 999)

  if (!start.isValid() || !end.isValid()) return null

  return { start, end }
}

// Remove códigos de escape ANSI (cores de terminal), que costumam vir antes da
// data em logs exportados e quebrariam a checagem de início de linha.
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\x1b\[[0-9;]*m/g

// Data no início da linha, tolerando um pequeno prefixo (espaços, ANSI já
// removido, bullets, etc.) antes de "D/M H:M:S".
const TEXT_DATE_REGEX = /^[^\d]{0,8}(\d{1,2})\/(\d{1,2})[ T](\d{1,2}):(\d{1,2}):(\d{1,2})/

/**
 * Réplica de `slice_logs_by_initial_and_end_date.ts`.
 * Filtra linhas de log em texto que começam com "DD/MM HH:MM:SS",
 * mantendo apenas as que pertencem ao dia informado.
 */
export function filterTextLogsByDay(content: string, dateString: string): FilterResult {
  if (!dateString.trim()) {
    return { lines: [], totalLines: 0, matchedLines: 0, error: "Informe uma data (ex.: 22/7)." }
  }

  const range = parseDayRange(dateString)
  if (!range) {
    return { lines: [], totalLines: 0, matchedLines: 0, error: 'Data inválida. Use o formato "dia/mês", ex.: 22/7.' }
  }

  const targetDay = range.start.date()
  const targetMonth = range.start.month() + 1

  const allLines = content.split(/\r?\n/)

  const lines = allLines.filter((logLine) => {
    const m = logLine.replace(ANSI_REGEX, "").match(TEXT_DATE_REGEX)
    if (!m) return false

    // O intervalo é sempre um dia inteiro, então basta comparar dia e mês —
    // rápido e sem problemas de fuso horário mesmo em arquivos enormes.
    return Number(m[1]) === targetDay && Number(m[2]) === targetMonth
  })

  return { lines, totalLines: allLines.length, matchedLines: lines.length }
}

/**
 * Réplica de `slice_structured_logs_by_day.ts`.
 * Filtra linhas de log em JSON que começam com `{"timestamp":<ms>` — o
 * timestamp está em milissegundos desde o Unix Epoch.
 */
export function filterStructuredLogsByDay(content: string, dateString: string): FilterResult {
  if (!dateString.trim()) {
    return { lines: [], totalLines: 0, matchedLines: 0, error: "Informe uma data (ex.: 22/7)." }
  }

  const range = parseDayRange(dateString)
  if (!range) {
    return { lines: [], totalLines: 0, matchedLines: 0, error: 'Data inválida. Use o formato "dia/mês", ex.: 22/7.' }
  }

  const startTimestamp = range.start.valueOf()
  const endTimestamp = range.end.valueOf()

  const allLines = content.split(/\r?\n/)

  const lines = allLines.filter((logLine) => {
    const timestampMatch = logLine.replace(ANSI_REGEX, "").match(/^\s*\{"timestamp":(\d+)/)
    if (!timestampMatch) return false

    const logTimestamp = Number(timestampMatch[1])
    return logTimestamp >= startTimestamp && logTimestamp <= endTimestamp
  })

  return { lines, totalLines: allLines.length, matchedLines: lines.length }
}

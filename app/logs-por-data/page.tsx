"use client"

import { LogFilterView } from "@/components/log-filter-view"
import { filterTextLogsByDay } from "@/lib/log-filters"

export default function LogsPorDataPage() {
  return (
    <LogFilterView
      title="Logs por data"
      description="Réplica do script slice_logs_by_initial_and_end_date. Mantém apenas as linhas cuja data (no início da linha) pertence ao dia informado."
      placeholder={"22/7 13:05:01 servidor iniciado\n22/7 13:05:02 requisição recebida\n23/7 09:00:00 nova conexão"}
      formatHint="Cada linha deve começar com a data no formato DD/MM HH:MM:SS (ex.: 22/7 13:05:01)."
      filterFn={filterTextLogsByDay}
    />
  )
}

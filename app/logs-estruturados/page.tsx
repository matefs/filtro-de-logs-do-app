"use client"

import { LogFilterView } from "@/components/log-filter-view"
import { filterStructuredLogsByDay } from "@/lib/log-filters"

export default function LogsEstruturadosPage() {
  return (
    <LogFilterView
      title="Logs estruturados"
      description="Réplica do script slice_structured_logs_by_day. Mantém apenas as linhas cujo timestamp (em milissegundos) pertence ao dia informado."
      placeholder={'{"timestamp":1721646301000,"level":"info","msg":"iniciado"}\n{"timestamp":1721646302000,"level":"warn","msg":"lento"}'}
      formatHint={'Cada linha deve começar com {"timestamp":<ms>} em milissegundos desde o Unix Epoch. A data informada é convertida para o intervalo de timestamps do dia e comparada diretamente.'}
      filterFn={filterStructuredLogsByDay}
      singleField
    />
  )
}

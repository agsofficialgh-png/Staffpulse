import { reactive } from 'vue'
import { hrModules, type HrModule } from '../data/hrModules'

export type HrRecord = Record<string, string> & { id: string }

const recordsByModule = reactive<Record<HrModule, HrRecord[]>>({
  people: [],
  'hr-records': [],
  administration: [],
  activities: [],
  issues: [],
  training: [],
  documents: [],
  'management-actions': [],
  kpis: [],
  deadlines: [],
})

export function getHrRecords(module: HrModule) {
  return recordsByModule[module]
}

function nextId(module: HrModule) {
  const prefix = hrModules[module].prefix
  const latestNumber = recordsByModule[module].reduce((maximum, record) => {
    const match = new RegExp(`^${prefix}(\\d+)$`).exec(record.id)
    return match ? Math.max(maximum, Number(match[1])) : maximum
  }, 0)
  return `${prefix}${String(latestNumber + 1).padStart(3, '0')}`
}

export function addHrRecord(module: HrModule, values: Record<string, string>) {
  const record: HrRecord = { ...values, id: nextId(module) }
  if (module === 'kpis') record.variance = calculateVariance(record.actual, record.target)
  recordsByModule[module].unshift(record)
  return record
}

export function updateHrRecord(module: HrModule, id: string, values: Record<string, string>) {
  const current = recordsByModule[module].find((record) => record.id === id)
  if (!current) throw new Error(`Cannot update missing ${hrModules[module].title} record ${id}.`)
  const updated: HrRecord = { ...current, ...values, id }
  if (module === 'kpis') updated.variance = calculateVariance(updated.actual, updated.target)
  const index = recordsByModule[module].findIndex((record) => record.id === id)
  recordsByModule[module].splice(index, 1, updated)
}

export function deleteHrRecord(module: HrModule, id: string) {
  const index = recordsByModule[module].findIndex((record) => record.id === id)
  if (index < 0) throw new Error(`Cannot delete missing ${hrModules[module].title} record ${id}.`)
  recordsByModule[module].splice(index, 1)
}

function calculateVariance(actual: string | undefined, target: string | undefined) {
  if (actual === undefined || actual === '' || target === undefined || target === '') return ''
  const actualValue = Number(actual)
  const targetValue = Number(target)
  if (!Number.isFinite(actualValue) || !Number.isFinite(targetValue)) return ''
  return String(Number((actualValue - targetValue).toFixed(4)))
}

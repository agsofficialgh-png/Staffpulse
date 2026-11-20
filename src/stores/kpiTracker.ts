import { reactive } from 'vue'

export const kpiMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const

export interface KpiDefinition {
  id: string
  role: string
  name: string
  measurement: string
  frequency: string
  aggregation: 'sum' | 'latest'
}

export const kpiDefinitions: KpiDefinition[] = [
  { id: 'mkt-members', role: 'Marketer', name: 'New members recruited', measurement: 'Count from member database', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'mkt-conversion', role: 'Marketer', name: 'Conversion rate (enquiry to paid member)', measurement: 'Conversions divided by leads', frequency: 'Monthly', aggregation: 'latest' },
  { id: 'mkt-email', role: 'Marketer', name: 'Email open and click rates', measurement: 'Email platform reports', frequency: 'Per campaign', aggregation: 'latest' },
  { id: 'mkt-engagement', role: 'Marketer', name: 'Social and website engagement', measurement: 'Followers, reach, site visits', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'mkt-events', role: 'Marketer', name: 'Event registrations driven by campaigns', measurement: 'Registrations by source', frequency: 'Per event', aggregation: 'sum' },
  { id: 'mkt-community', role: 'Marketer', name: 'Community engagement activities held', measurement: 'Activity log', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'mkt-active-members', role: 'Marketer', name: 'Active members (took part in at least one activity)', measurement: 'Attendance and platform data', frequency: 'Quarterly', aggregation: 'latest' },
  { id: 'it-uptime', role: 'I.T. Support', name: 'System uptime (email, website, member database)', measurement: 'Monitoring and incident log', frequency: 'Monthly', aggregation: 'latest' },
  { id: 'it-support-tickets', role: 'I.T. Support', name: 'Support tickets resolved within agreed time', measurement: 'Ticket log', frequency: 'Monthly', aggregation: 'latest' },
  { id: 'it-backups', role: 'I.T. Support', name: 'Successful backups and restore tests', measurement: 'Backup and test log', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'it-secured-accounts', role: 'I.T. Support', name: 'Accounts secured (strong password, two-step verification)', measurement: 'Account audit', frequency: 'Quarterly', aggregation: 'sum' },
  { id: 'it-solutions', role: 'I.T. Support', name: 'Member IT solutions delivered or improved', measurement: 'Solutions register', frequency: 'Quarterly', aggregation: 'sum' },
  { id: 'it-audits', role: 'I.T. Support', name: 'I.T. and cyber audits completed; findings closed on time', measurement: 'Audit tracker', frequency: 'Quarterly', aggregation: 'sum' },
  { id: 'pr-mentions', role: 'PR / Media & Comms', name: 'Media mentions and quality of coverage', measurement: 'Media monitoring', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'pr-releases', role: 'PR / Media & Comms', name: 'Press releases and statements issued on time', measurement: 'Communications log', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'pr-newsletters', role: 'PR / Media & Comms', name: 'Newsletters published on schedule', measurement: 'Publishing log', frequency: 'Per issue', aggregation: 'sum' },
  { id: 'pr-campaigns', role: 'PR / Media & Comms', name: 'Flyers and social campaigns delivered on time', measurement: 'Design and campaign tracker', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'pr-podcast-published', role: 'PR / Media & Comms', name: 'AfriqVox episodes published against plan', measurement: 'Podcast schedule', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'pr-podcast-downloads', role: 'PR / Media & Comms', name: 'AfriqVox listens or downloads', measurement: 'Podcast platform stats', frequency: 'Monthly', aggregation: 'sum' },
  { id: 'pr-crisis-response', role: 'PR / Media & Comms', name: 'Crisis response time', measurement: 'Time from issue to approved statement', frequency: 'Per incident', aggregation: 'latest' },
  { id: 'partner-funds', role: 'Partnerships', name: 'Funds mobilised against annual target', measurement: 'Finance records', frequency: 'Quarterly', aggregation: 'sum' },
  { id: 'partner-proposals', role: 'Partnerships', name: 'Proposals submitted and success rate', measurement: 'Proposal tracker', frequency: 'Quarterly', aggregation: 'latest' },
  { id: 'partner-network', role: 'Partnerships', name: 'Active partners and new partners signed', measurement: 'Partner pipeline', frequency: 'Quarterly', aggregation: 'sum' },
  { id: 'partner-reports', role: 'Partnerships', name: 'Donor reports submitted on time', measurement: 'Reporting calendar', frequency: 'Per report', aggregation: 'sum' },
]

interface KpiValues {
  targets: Record<string, string>
  actuals: Record<string, Record<string, string>>
}

const storageKey = 'staffpulse.kpi-tracker.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function loadValues(): KpiValues {
  const stored = window.localStorage.getItem(storageKey)
  if (stored === null) return { targets: {}, actuals: {} }

  let value: unknown
  try {
    value = JSON.parse(stored)
  } catch (error) {
    console.error('Unable to parse the saved StaffPulse KPI tracker.', error)
    throw new Error('The saved KPI tracker data is invalid. Clear the StaffPulse KPI data to continue.')
  }

  if (!isRecord(value) || !isRecord(value.targets) || !isRecord(value.actuals)) {
    throw new Error('The saved KPI tracker data has an invalid format. Clear the StaffPulse KPI data to continue.')
  }

  return {
    targets: Object.fromEntries(
      Object.entries(value.targets).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    ),
    actuals: Object.fromEntries(
      Object.entries(value.actuals)
        .filter((entry): entry is [string, Record<string, unknown>] => isRecord(entry[1]))
        .map(([id, months]) => [
          id,
          Object.fromEntries(Object.entries(months).filter((entry): entry is [string, string] => typeof entry[1] === 'string')),
        ]),
    ),
  }
}

const values = reactive(loadValues())

function save() {
  window.localStorage.setItem(storageKey, JSON.stringify(values))
}

export function updateAnnualTarget(id: string, value: string) {
  if (value === '') delete values.targets[id]
  else values.targets[id] = value
  save()
}

export function updateMonthlyActual(id: string, month: string, value: string) {
  if (!values.actuals[id]) values.actuals[id] = {}
  if (value === '') delete values.actuals[id][month]
  else values.actuals[id][month] = value
  save()
}

export function annualTarget(id: string) {
  return values.targets[id] ?? ''
}

export function monthlyActual(id: string, month: string) {
  return values.actuals[id]?.[month] ?? ''
}

export function kpiRollup(definition: KpiDefinition) {
  const enteredValues = kpiMonths
    .map((month) => values.actuals[definition.id]?.[month])
    .filter((value): value is string => value !== undefined && value !== '')
    .map(Number)
    .filter(Number.isFinite)

  if (!enteredValues.length) return '—'
  if (definition.aggregation === 'latest') return String(enteredValues[enteredValues.length - 1])
  return String(enteredValues.reduce((total, value) => total + value, 0))
}

export function enteredKpiActualCount(month: string) {
  return kpiDefinitions.filter((definition) => monthlyActual(definition.id, month) !== '').length
}

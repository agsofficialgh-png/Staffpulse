import { reactive } from 'vue'
import { taskRoles } from './taskLog'

export const growthStatuses = ['Not started', 'In progress', 'Done'] as const
export type GrowthStatus = (typeof growthStatuses)[number]

export interface GrowthGoal {
  id: string
  role: (typeof taskRoles)[number]
  goal: string
  action: string
  targetDate: string
  status: GrowthStatus
  evidence: string
  lastReviewed: string
}

export type NewGrowthGoal = Omit<GrowthGoal, 'id' | 'lastReviewed'>

const storageKey = 'staffpulse.growth-plans.v1'

function isGrowthGoal(value: unknown): value is GrowthGoal {
  if (typeof value !== 'object' || value === null) return false
  const goal = value as Record<string, unknown>
  return (
    typeof goal.id === 'string' &&
    taskRoles.some((role) => role === goal.role) &&
    typeof goal.goal === 'string' &&
    typeof goal.action === 'string' &&
    typeof goal.targetDate === 'string' &&
    growthStatuses.some((status) => status === goal.status) &&
    typeof goal.evidence === 'string' &&
    typeof goal.lastReviewed === 'string'
  )
}

function loadGrowthGoals(): GrowthGoal[] {
  const stored = window.localStorage.getItem(storageKey)
  if (stored === null) return []

  let value: unknown
  try {
    value = JSON.parse(stored)
  } catch (error) {
    console.error('Unable to parse the saved StaffPulse growth plans.', error)
    throw new Error('The saved growth plan data is invalid. Clear the StaffPulse growth-plan data to continue.')
  }

  if (!Array.isArray(value) || !value.every(isGrowthGoal)) {
    throw new Error('The saved growth plan data has an invalid format. Clear the StaffPulse growth-plan data to continue.')
  }

  return value
}

export const growthGoals = reactive(loadGrowthGoals())

function persist(nextGoals: GrowthGoal[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(nextGoals))
  growthGoals.splice(0, growthGoals.length, ...nextGoals)
}

function todayAsIsoDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function nextGoalId() {
  const latestNumber = growthGoals.reduce((maximum, goal) => {
    const match = /^G-(\d+)$/.exec(goal.id)
    return match ? Math.max(maximum, Number(match[1])) : maximum
  }, 0)
  return `G-${String(latestNumber + 1).padStart(3, '0')}`
}

export function addGrowthGoal(goal: NewGrowthGoal) {
  persist([{ ...goal, id: nextGoalId(), lastReviewed: '' }, ...growthGoals])
}

export function updateGrowthStatus(id: string, status: GrowthStatus) {
  persist(growthGoals.map((goal) => (goal.id === id ? { ...goal, status } : goal)))
}

export function markGrowthGoalReviewed(id: string) {
  persist(growthGoals.map((goal) => (goal.id === id ? { ...goal, lastReviewed: todayAsIsoDate() } : goal)))
}

export function deleteGrowthGoal(id: string) {
  persist(growthGoals.filter((goal) => goal.id !== id))
}

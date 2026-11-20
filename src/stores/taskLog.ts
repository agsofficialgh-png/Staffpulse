import { reactive } from 'vue'

export const taskRoles = ['Marketer', 'I.T. Support', 'PR / Media & Comms', 'Partnerships', 'Finance'] as const
export const taskStatuses = ['Not started', 'In progress', 'Blocked', 'Done'] as const
export const taskPriorities = ['High', 'Medium', 'Low'] as const

export type TaskRole = (typeof taskRoles)[number]
export type TaskStatus = (typeof taskStatuses)[number]
export type TaskPriority = (typeof taskPriorities)[number]

export interface TaskRecord {
  id: string
  dateLogged: string
  ownerRole: TaskRole
  task: string
  category: string
  priority: TaskPriority
  startDate: string
  dueDate: string
  status: TaskStatus
  dateCompleted: string
  outcome: string
}

export type NewTask = Omit<TaskRecord, 'id' | 'dateLogged' | 'dateCompleted'>

const storageKey = 'staffpulse.task-log.v1'

function isOneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return options.some((option) => option === value)
}

function isTaskRecord(value: unknown): value is TaskRecord {
  if (typeof value !== 'object' || value === null) return false

  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.dateLogged === 'string' &&
    isOneOf(task.ownerRole, taskRoles) &&
    typeof task.task === 'string' &&
    typeof task.category === 'string' &&
    isOneOf(task.priority, taskPriorities) &&
    typeof task.startDate === 'string' &&
    typeof task.dueDate === 'string' &&
    isOneOf(task.status, taskStatuses) &&
    typeof task.dateCompleted === 'string' &&
    typeof task.outcome === 'string'
  )
}

function loadTasks(): TaskRecord[] {
  const stored = window.localStorage.getItem(storageKey)
  if (stored === null) return []

  let value: unknown
  try {
    value = JSON.parse(stored)
  } catch (error) {
    console.error('Unable to parse the saved StaffPulse task log.', error)
    throw new Error('The saved task log is invalid. Clear the StaffPulse task-log data to continue.')
  }

  if (!Array.isArray(value) || !value.every(isTaskRecord)) {
    throw new Error('The saved task log has an invalid format. Clear the StaffPulse task-log data to continue.')
  }

  return value
}

export const tasks = reactive(loadTasks())

function persist(nextTasks: TaskRecord[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(nextTasks))
  tasks.splice(0, tasks.length, ...nextTasks)
}

function todayAsIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function nextTaskId() {
  const latestNumber = tasks.reduce((maximum, task) => {
    const match = /^T-(\d+)$/.exec(task.id)
    return match ? Math.max(maximum, Number(match[1])) : maximum
  }, 0)
  return `T-${String(latestNumber + 1).padStart(3, '0')}`
}

export function addTask(task: NewTask) {
  const date = todayAsIsoDate()
  const record: TaskRecord = {
    ...task,
    id: nextTaskId(),
    dateLogged: date,
    dateCompleted: task.status === 'Done' ? date : '',
  }
  persist([record, ...tasks])
}

export function updateTaskStatus(id: string, status: TaskStatus) {
  const nextTasks = tasks.map((task) =>
    task.id === id
      ? { ...task, status, dateCompleted: status === 'Done' ? todayAsIsoDate() : '' }
      : task,
  )
  persist(nextTasks)
}

export function deleteTask(id: string) {
  persist(tasks.filter((task) => task.id !== id))
}

function dateSerial(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return Date.UTC(year, month - 1, day) / 86_400_000
}

export function daysLeft(task: TaskRecord, today = todayAsIsoDate()) {
  if (!task.dueDate || task.status === 'Done') return null
  const due = dateSerial(task.dueDate)
  const current = dateSerial(today)
  return due === null || current === null ? null : due - current
}

export function isOverdue(task: TaskRecord, today = todayAsIsoDate()) {
  const due = dateSerial(task.dueDate)
  const current = dateSerial(today)
  return task.status !== 'Done' && due !== null && current !== null && due < current
}

export function weekStarting(date: string) {
  const serial = dateSerial(date)
  if (serial === null) return ''

  const value = new Date(serial * 86_400_000)
  const weekday = value.getUTCDay()
  value.setUTCDate(value.getUTCDate() + (weekday === 0 ? -6 : 1 - weekday))
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`
}

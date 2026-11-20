import { ref } from 'vue'

export const roleOptions = [
  { id: 'operations-lead', label: 'Operations Lead', home: '/overview', initials: 'OL' },
  { id: 'admin-hr', label: 'Admin & HR', home: '/hr', initials: 'HR' },
  { id: 'super-admin', label: 'Super Admin', home: '/super-admin', initials: 'SA' },
  { id: 'it-support', label: 'I.T. Support', home: '/dashboards/it-support', initials: 'IT' },
  { id: 'finance', label: 'Finance', home: '/dashboards/finance', initials: 'FI' },
  {
    id: 'resource-mobilisation-marketing',
    label: 'Resource Mobilisation & Marketing',
    home: '/dashboards/resource-mobilisation-marketing',
    initials: 'RM',
  },
  {
    id: 'media-communications',
    label: 'Media & Communications',
    home: '/dashboards/media-communications',
    initials: 'MC',
  },
] as const

export type UserRole = (typeof roleOptions)[number]['id']

export const routePermissions = [
  { name: 'overview', label: 'Operations overview', path: '/overview', group: 'Operations' },
  { name: 'task-log', label: 'Task log', path: '/task-log', group: 'Operations' },
  { name: 'worker-profile', label: 'Worker profile', path: '/worker-profile', group: 'Operations' },
  { name: 'dashboard-it-support', label: 'I.T. Support dashboard', path: '/dashboards/it-support', group: 'Department dashboards' },
  { name: 'dashboard-finance', label: 'Finance dashboard', path: '/dashboards/finance', group: 'Department dashboards' },
  {
    name: 'dashboard-resource-mobilisation-marketing',
    label: 'Resource Mobilisation & Marketing dashboard',
    path: '/dashboards/resource-mobilisation-marketing',
    group: 'Department dashboards',
  },
  {
    name: 'dashboard-media-communications',
    label: 'Media & Communications dashboard',
    path: '/dashboards/media-communications',
    group: 'Department dashboards',
  },
  { name: 'hr-dashboard', label: 'HR dashboard', path: '/hr', group: 'HR workspace' },
  { name: 'hr-people', label: 'People', path: '/hr/people', group: 'HR workspace' },
  { name: 'hr-records', label: 'HR records', path: '/hr/hr-records', group: 'HR workspace' },
  { name: 'hr-administration', label: 'Administration records', path: '/hr/administration', group: 'HR workspace' },
  { name: 'hr-activities', label: 'Activities', path: '/hr/activities', group: 'HR workspace' },
  { name: 'hr-issues', label: 'Issues', path: '/hr/issues', group: 'HR workspace' },
  { name: 'hr-training', label: 'Training', path: '/hr/training', group: 'HR workspace' },
  { name: 'hr-documents', label: 'Documents', path: '/hr/documents', group: 'HR workspace' },
  { name: 'hr-management-actions', label: 'Management actions', path: '/hr/management-actions', group: 'HR workspace' },
  { name: 'hr-kpis', label: 'HR KPIs', path: '/hr/kpis', group: 'HR workspace' },
  { name: 'hr-deadlines', label: 'Deadlines', path: '/hr/deadlines', group: 'HR workspace' },
] as const

type PermissionRoute = (typeof routePermissions)[number]['name']

const initialAccountAssignments: Record<string, UserRole> = {
  'ops@ags': 'operations-lead',
  'fin@ags': 'finance',
  'hr@ags': 'admin-hr',
  'it@ags': 'it-support',
  'mark@ags': 'resource-mobilisation-marketing',
  'med@ags': 'media-communications',
  'super@ags': 'super-admin',
}

const roleStorageKey = 'staffpulse.session-role.v1'
const emailStorageKey = 'staffpulse.session-email.v1'
const accountStorageKey = 'staffpulse.account-assignments.v1'
const permissionStorageKey = 'staffpulse.role-permissions.v1'
const knownRouteNames = new Set<string>(routePermissions.map((route) => route.name))

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && roleOptions.some((role) => role.id === value)
}

function loadActiveRole(): UserRole | null {
  const savedRole = window.localStorage.getItem(roleStorageKey)
  return isUserRole(savedRole) ? savedRole : null
}

function readJson(key: string): unknown {
  const stored = window.localStorage.getItem(key)
  if (stored === null) return null

  try {
    return JSON.parse(stored) as unknown
  } catch (error) {
    console.error(`Unable to parse saved StaffPulse data for ${key}.`, error)
    throw new Error(`Saved StaffPulse data for ${key} is invalid. Clear the related local-storage entry to continue.`)
  }
}

function loadAccountAssignments(): Record<string, UserRole> {
  const stored = readJson(accountStorageKey)
  if (stored === null) return { ...initialAccountAssignments }
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) {
    throw new Error('Saved StaffPulse account assignments have an invalid format.')
  }

  const assignments: Record<string, UserRole> = { ...initialAccountAssignments }
  for (const [email, role] of Object.entries(stored)) {
    if (!isUserRole(role)) throw new Error(`Saved account assignment for ${email} has an invalid role.`)
    assignments[email] = role
  }
  return assignments
}

function loadPermissionOverrides(): Partial<Record<UserRole, PermissionRoute[]>> {
  const stored = readJson(permissionStorageKey)
  if (stored === null) return {}
  if (typeof stored !== 'object' || stored === null || Array.isArray(stored)) {
    throw new Error('Saved StaffPulse role permissions have an invalid format.')
  }

  const overrides: Partial<Record<UserRole, PermissionRoute[]>> = {}
  for (const [role, routes] of Object.entries(stored)) {
    if (!isUserRole(role) || role === 'super-admin' || !Array.isArray(routes) ||
      !routes.every((route) => typeof route === 'string' && knownRouteNames.has(route))) {
      throw new Error(`Saved StaffPulse permissions for ${role} have an invalid format.`)
    }
    overrides[role] = routes as PermissionRoute[]
  }
  return overrides
}

export const activeRole = ref<UserRole | null>(loadActiveRole())
export const activeEmail = ref(window.localStorage.getItem(emailStorageKey) ?? '')
export const accountAssignments = ref(loadAccountAssignments())
const permissionOverrides = ref(loadPermissionOverrides())

const defaultPermissions: Record<UserRole, readonly string[]> = {
  'operations-lead': ['overview', 'task-log', 'worker-profile'],
  'admin-hr': [
    'hr-dashboard',
    'hr-people',
    'hr-records',
    'hr-administration',
    'hr-activities',
    'hr-issues',
    'hr-training',
    'hr-documents',
    'hr-management-actions',
    'hr-kpis',
    'hr-deadlines',
  ],
  'super-admin': routePermissions.map((route) => route.name),
  'it-support': ['dashboard-it-support'],
  finance: ['dashboard-finance'],
  'resource-mobilisation-marketing': ['dashboard-resource-mobilisation-marketing'],
  'media-communications': ['dashboard-media-communications'],
}

export function roleDetails(role: UserRole) {
  const details = roleOptions.find((option) => option.id === role)
  if (!details) throw new Error(`Unknown StaffPulse role: ${role}`)
  return details
}

export function roleForEmail(email: string) {
  return accountAssignments.value[email.trim().toLocaleLowerCase()] ?? null
}

export function setAccountRole(email: string, role: UserRole) {
  const normalizedEmail = email.trim().toLocaleLowerCase()
  if (normalizedEmail === 'super@ags') throw new Error('The primary Super Admin account cannot be reassigned.')

  const nextAssignments = { ...accountAssignments.value, [normalizedEmail]: role }
  window.localStorage.setItem(accountStorageKey, JSON.stringify(nextAssignments))
  accountAssignments.value = nextAssignments
}

export function addAccountAssignment(email: string, role: UserRole) {
  const normalizedEmail = email.trim().toLocaleLowerCase()
  if (!/^[^@\s]+@ags$/.test(normalizedEmail)) {
    throw new Error('Enter an account email using the @ags demo domain.')
  }
  if (accountAssignments.value[normalizedEmail]) throw new Error('That email is already assigned. Change its role in the account list.')
  setAccountRole(normalizedEmail, role)
}

export function getRolePermissions(role: UserRole): readonly string[] {
  return permissionOverrides.value[role] ?? defaultPermissions[role]
}

export function setRolePermissions(role: UserRole, routes: readonly string[]) {
  if (role === 'super-admin') throw new Error('Super Admin permissions cannot be restricted.')

  const allowedRoutes = new Set<string>(routePermissions.map((route) => route.name))
  const nextPermissions = [...new Set(routes.filter((route): route is PermissionRoute => allowedRoutes.has(route)))]
  const nextOverrides = { ...permissionOverrides.value, [role]: nextPermissions }
  window.localStorage.setItem(permissionStorageKey, JSON.stringify(nextOverrides))
  permissionOverrides.value = nextOverrides
}

export function canAccessRoute(role: UserRole, routeName: string) {
  if (role === 'super-admin') return true
  if (routeName === 'profile' || routeName === 'settings') return true
  return getRolePermissions(role).some((permission) => permission === routeName)
}

export function roleHome(role: UserRole) {
  const home = roleDetails(role).home
  if (role === 'super-admin') return home

  const homeRoute = routePermissions.find((route) => route.path === home)
  if (homeRoute && canAccessRoute(role, homeRoute.name)) return home

  return routePermissions.find((route) => canAccessRoute(role, route.name))?.path ?? '/profile'
}

export function signInAs(role: UserRole, email: string) {
  window.localStorage.setItem(roleStorageKey, role)
  window.localStorage.setItem(emailStorageKey, email.trim())
  activeRole.value = role
  activeEmail.value = email.trim()
}

export function signOut() {
  window.localStorage.removeItem(roleStorageKey)
  window.localStorage.removeItem(emailStorageKey)
  activeRole.value = null
  activeEmail.value = ''
}

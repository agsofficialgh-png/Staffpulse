export type HrModule =
  | 'people'
  | 'hr-records'
  | 'administration'
  | 'activities'
  | 'issues'
  | 'training'
  | 'documents'
  | 'management-actions'
  | 'kpis'
  | 'deadlines'

export interface HrField {
  key: string
  label: string
  type: 'text' | 'date' | 'number' | 'textarea' | 'select'
  required?: boolean
  options?: string[]
  readOnly?: boolean
}

export interface HrModuleDefinition {
  title: string
  workbookSheet: string
  description: string
  prefix: string
  fields: HrField[]
}

export const hrModules: Record<HrModule, HrModuleDefinition> = {
  people: {
    title: 'People',
    workbookSheet: 'People',
    description: 'Maintain the staff, national service, intern, consultant, and volunteer directory.',
    prefix: 'P',
    fields: [
      { key: 'fullName', label: 'Full name', type: 'text', required: true },
      { key: 'roleTitle', label: 'Role / title', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['Staff', 'NSP', 'Intern', 'Consultant', 'Volunteer'] },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'supervisor', label: 'Supervisor', type: 'text' },
      { key: 'startDate', label: 'Start date', type: 'date' },
      { key: 'endDate', label: 'End date', type: 'text' },
      { key: 'contact', label: 'Contact', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On Leave', 'Exited'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'hr-records': {
    title: 'HR Records',
    workbookSheet: 'HR',
    description: 'Track contracts, onboarding, leave, performance, welfare, and exit actions.',
    prefix: 'HR',
    fields: [
      { key: 'person', label: 'Person', type: 'text', required: true },
      { key: 'hrArea', label: 'HR area', type: 'select', options: ['Contracts', 'Onboarding', 'Leave', 'Performance', 'Welfare', 'Exits', 'Other'] },
      { key: 'actionDocument', label: 'Action / document', type: 'text', required: true },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  administration: {
    title: 'Administration',
    workbookSheet: 'Administration',
    description: 'Track office, assets, supplies, meetings, logistics, correspondence, and admin tasks.',
    prefix: 'ADM',
    fields: [
      { key: 'area', label: 'Area', type: 'text' },
      { key: 'taskItem', label: 'Task / item', type: 'text', required: true },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'dueDate', label: 'Due date', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
      { key: 'reference', label: 'Reference / link', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  activities: {
    title: 'Activities',
    workbookSheet: 'Activities',
    description: 'Track AGS events and programs from planning through reporting.',
    prefix: 'ACT',
    fields: [
      { key: 'activity', label: 'Activity / program', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'lead', label: 'Lead', type: 'text' },
      { key: 'teamPartners', label: 'Team / partners', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In Progress', 'Completed', 'Cancelled'] },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'reportStatus', label: 'Report status', type: 'select', options: ['Pending', 'In Progress', 'Submitted'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  issues: {
    title: 'Issues',
    workbookSheet: 'Issues',
    description: 'Record concerns, assign an owner and deadline, and track resolution.',
    prefix: 'ISS',
    fields: [
      { key: 'dateRaised', label: 'Date raised', type: 'date' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'issue', label: 'Issue / concern', type: 'text', required: true },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Resolved'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { key: 'actionTaken', label: 'Action taken', type: 'textarea' },
      { key: 'resolutionDate', label: 'Resolution date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  training: {
    title: 'Training',
    workbookSheet: 'Training',
    description: 'Track staff development, training providers, budgets, and certificates.',
    prefix: 'TRN',
    fields: [
      { key: 'personTeam', label: 'Person / team', type: 'text', required: true },
      { key: 'trainingArea', label: 'Training area', type: 'text' },
      { key: 'provider', label: 'Provider', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'costBudget', label: 'Cost / budget', type: 'number' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
      { key: 'certificate', label: 'Certificate', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  documents: {
    title: 'Documents',
    workbookSheet: 'Documents',
    description: 'Track important HR/admin documents and their review or expiry dates.',
    prefix: 'DOC',
    fields: [
      { key: 'documentName', label: 'Document name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'personDepartment', label: 'Person / department', type: 'text' },
      { key: 'dateIssued', label: 'Date issued', type: 'date' },
      { key: 'reviewExpiryDate', label: 'Review / expiry date', type: 'date' },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Current', 'Review Due', 'Expired'] },
      { key: 'location', label: 'Location / link', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  'management-actions': {
    title: 'Management Actions',
    workbookSheet: 'Management Actions',
    description: 'Record instructions and decisions from management and follow them through to closure.',
    prefix: 'MAT',
    fields: [
      { key: 'dateAssigned', label: 'Date assigned', type: 'date' },
      { key: 'action', label: 'Action / decision', type: 'text', required: true },
      { key: 'assignedBy', label: 'Assigned by', type: 'text' },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'In Progress', 'Completed'] },
      { key: 'followUpDate', label: 'Follow-up date', type: 'date' },
      { key: 'outcome', label: 'Outcome / remarks', type: 'textarea' },
    ],
  },
  kpis: {
    title: 'KPIs',
    workbookSheet: 'KPIs',
    description: 'Update targets and actuals monthly or quarterly to support performance reporting.',
    prefix: 'KPI',
    fields: [
      { key: 'area', label: 'Area', type: 'text', required: true },
      { key: 'kpi', label: 'KPI', type: 'text', required: true },
      { key: 'target', label: 'Target', type: 'number' },
      { key: 'actual', label: 'Actual', type: 'number' },
      { key: 'variance', label: 'Variance (actual − target)', type: 'number', readOnly: true },
      { key: 'reportingPeriod', label: 'Reporting period', type: 'select', options: ['Monthly', 'Quarterly', 'Annual'] },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Off Track'] },
      { key: 'comments', label: 'Comments', type: 'textarea' },
    ],
  },
  deadlines: {
    title: 'Deadlines',
    workbookSheet: 'Deadlines',
    description: 'Use the central list to track important HR, administration, and activity deadlines.',
    prefix: 'DL',
    fields: [
      { key: 'activityDeadline', label: 'Activity / deadline', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'responsible', label: 'Responsible', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planned', 'In Progress', 'Completed'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
}

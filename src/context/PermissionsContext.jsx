/**
 * Permission Definitions & Default Role Maps
 * Each permission: { label, description }
 * Default Role Map: key → Set of permission keys
 */

export const allPermissions = {
  // ── Projects ──────────────────────────────────────────────────────────────
  view_all_projects:       { label: 'View All Projects',     module: 'Projects' },
  view_own_projects:       { label: 'View Own Projects',      module: 'Projects' },
  create_project:          { label: 'Create Project',          module: 'Projects' },
  edit_any_project:        { label: 'Edit Any Project',        module: 'Projects' },
  edit_own_project:        { label: 'Edit Own Project',        module: 'Projects' },
  delete_any_project:      { label: 'Delete Any Project',      module: 'Projects' },
  delete_own_project:      { label: 'Delete Own Project',      module: 'Projects' },

  // ── Tasks / Sheets ─────────────────────────────────────────────────────────
  view_task_sheet:         { label: 'View Task Sheets',        module: 'Tasks' },
  edit_task_sheet:         { label: 'Edit Task Sheets',        module: 'Tasks' },
  add_task_row:            { label: 'Add Task Row',             module: 'Tasks' },
  delete_task_row:         { label: 'Delete Task Row',          module: 'Tasks' },
  change_task_status:      { label: 'Change Task Status',       module: 'Tasks' },

  // ── SOD ───────────────────────────────────────────────────────────────────
  view_sod:                { label: 'View SOD',                 module: 'Meetings' },
  edit_sod:                { label: 'Edit SOD',                 module: 'Meetings' },
  add_sod_entry:           { label: 'Add SOD Entry',            module: 'Meetings' },
  delete_sod_entry:        { label: 'Delete SOD Entry',         module: 'Meetings' },

  // ── MOM ───────────────────────────────────────────────────────────────────
  view_mom:                { label: 'View MOM',                 module: 'Meetings' },
  edit_mom:                { label: 'Edit MOM',                 module: 'Meetings' },
  add_mom_entry:           { label: 'Add MOM Entry',            module: 'Meetings' },
  delete_mom_entry:        { label: 'Delete MOM Entry',         module: 'Meetings' },

  // ── Documents ──────────────────────────────────────────────────────────────
  view_documents:          { label: 'View Documents',           module: 'Documents' },
  upload_document:         { label: 'Upload Document',          module: 'Documents' },
  delete_any_document:     { label: 'Delete Any Document',      module: 'Documents' },
  delete_own_document:     { label: 'Delete Own Document',      module: 'Documents' },

  // ── Users ──────────────────────────────────────────────────────────────────
  view_users:              { label: 'View Users',               module: 'Users' },
  add_user:                { label: 'Add User',                 module: 'Users' },
  edit_any_user:           { label: 'Edit Any User',            module: 'Users' },
  edit_own_profile:        { label: 'Edit Own Profile',         module: 'Users' },
  delete_any_user:         { label: 'Delete Any User',          module: 'Users' },
  reset_user_password:     { label: 'Reset User Password',      module: 'Users' },

  // ── Reports / Dashboard ────────────────────────────────────────────────────
  view_analytics:          { label: 'View Analytics Dashboard', module: 'Analytics' },
  export_reports:          { label: 'Export Reports',           module: 'Analytics' },
};

/** Default permission sets for each built-in role */
export const defaultRolePermissions = {
  Administrator: new Set([
    'view_all_projects', 'view_own_projects', 'create_project',
    'edit_any_project', 'edit_own_project', 'delete_any_project', 'delete_own_project',
    'view_task_sheet', 'edit_task_sheet', 'add_task_row', 'delete_task_row', 'change_task_status',
    'view_sod', 'edit_sod', 'add_sod_entry', 'delete_sod_entry',
    'view_mom', 'edit_mom', 'add_mom_entry', 'delete_mom_entry',
    'view_documents', 'upload_document', 'delete_any_document', 'delete_own_document',
    'view_users', 'add_user', 'edit_any_user', 'edit_own_profile',
    'delete_any_user', 'reset_user_password',
    'view_analytics', 'export_reports',
  ]),
  Developer: new Set([
    'view_own_projects', 'view_all_projects',
    'edit_own_project', 'create_project',
    'view_task_sheet', 'edit_task_sheet', 'add_task_row', 'delete_task_row', 'change_task_status',
    'view_sod', 'edit_sod', 'add_sod_entry', 'delete_sod_entry',
    'view_mom', 'edit_mom', 'add_mom_entry', 'delete_mom_entry',
    'view_documents', 'upload_document', 'delete_own_document',
    'view_users', 'edit_own_profile',
    'view_analytics',
  ]),
  Member: new Set([
    'view_own_projects',
    'view_task_sheet',
    'view_sod', 'add_sod_entry',
    'view_mom', 'add_mom_entry',
    'view_documents',
    'edit_own_profile',
  ]),
  Viewer: new Set([
    'view_own_projects',
    'view_task_sheet',
    'view_sod',
    'view_mom',
    'view_documents',
  ]),
};

/** Visible UI sections for each module — groups checkboxes in the modal */
export const permissionModules = [
  { key: 'view_all_projects',        label: 'Projects',        permissions: ['view_all_projects', 'view_own_projects', 'create_project'] },
  { key: 'edit_projects',            label: 'Projects',        permissions: ['edit_any_project', 'edit_own_project'] },
  { key: 'delete_projects',          label: 'Projects',        permissions: ['delete_any_project', 'delete_own_project'] },
  { key: 'view_task_sheet',          label: 'Tasks',           permissions: ['view_task_sheet', 'edit_task_sheet', 'add_task_row', 'delete_task_row', 'change_task_status'] },
  { key: 'view_sod',                 label: 'SOD',             permissions: ['view_sod', 'edit_sod', 'add_sod_entry', 'delete_sod_entry'] },
  { key: 'view_mom',                 label: 'MOM',             permissions: ['view_mom', 'edit_mom', 'add_mom_entry', 'delete_mom_entry'] },
  { key: 'view_documents',           label: 'Documents',       permissions: ['view_documents', 'upload_document', 'delete_any_document', 'delete_own_document'] },
  { key: 'view_users',               label: 'Users',           permissions: ['view_users', 'add_user', 'edit_any_user', 'edit_own_profile', 'delete_any_user', 'reset_user_password'] },
  { key: 'view_analytics',           label: 'Analytics',       permissions: ['view_analytics', 'export_reports'] },
];

/** Group permissions by human-readable headings (used in the UI) */
export const permissionCategories = [
  {
    key: 'projects',
    label: 'Projects',
    icon: '📁',
    permissions: ['view_all_projects', 'view_own_projects', 'create_project', 'edit_any_project', 'edit_own_project', 'delete_any_project', 'delete_own_project'],
  },
  {
    key: 'tasks',
    label: 'Task Sheet',
    icon: '📄',
    permissions: ['view_task_sheet', 'edit_task_sheet', 'add_task_row', 'delete_task_row', 'change_task_status'],
  },
  {
    key: 'sod',
    label: 'SOD',
    icon: '🗓️',
    permissions: ['view_sod', 'edit_sod', 'add_sod_entry', 'delete_sod_entry'],
  },
  {
    key: 'mom',
    label: 'MOM',
    icon: '📝',
    permissions: ['view_mom', 'edit_mom', 'add_mom_entry', 'delete_mom_entry'],
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: '📓',
    permissions: ['view_documents', 'upload_document', 'delete_any_document', 'delete_own_document'],
  },
  {
    key: 'users',
    label: 'Users',
    icon: '👥',
    permissions: ['view_users', 'add_user', 'edit_any_user', 'edit_own_profile', 'delete_any_user', 'reset_user_password'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: '📈',
    permissions: ['view_analytics', 'export_reports'],
  },
];

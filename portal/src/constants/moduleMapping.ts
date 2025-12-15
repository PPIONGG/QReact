/**
 * Mapping between menu keys and module codes
 * This defines which module code is required to access each menu item
 *
 * Format:
 * - Parent menu: Checked for menu display in sidebar
 * - Child routes: Checked for actual route access via RouteGuard
 */
export const MODULE_MAPPING: Record<string, string> = {
  // Home page - accessible to all
  home: '*',

  // Sales module
  sales: 'QERPc',                        // Parent menu requires 'SV' to show
  'sales/sales-visitor': 'SV',        // Child route requires 'SV' to access

  // Purchase module
  purchase: 'QERPc',                  // Parent menu requires 'QERPc' to show
  'purchase/purchase-order': 'PO',    // Child route requires 'PO' to access

  // Basic System
  'basic-system': 'QERPc',            // Parent menu requires 'QERPc' to show
  quotation: 'QT',                    // Child route requires 'QT' to access

  // Dashboard
  dashboard: 'WBD',

  // Search - accessible to all
  search: '*',

  // Settings - accessible to all
  settings: '*',
}

/**
 * Check if user has permission to access a specific menu item
 * @param menuKey - The key of the menu item
 * @param moduleCodes - Array of module codes the user has access to
 * @param allPermission - Whether user has all permissions
 * @returns true if user has access, false otherwise
 */
export function hasMenuPermission(
  menuKey: string,
  moduleCodes: string[],
  allPermission: boolean
): boolean {
  // If user has all permissions, allow access to everything
  if (allPermission) {
    return true
  }

  // Get required module for this menu
  const requiredModule = MODULE_MAPPING[menuKey]

  // If menu is accessible to all (marked with '*'), allow access
  if (requiredModule === '*') {
    return true
  }

  // Check if user has the required module code
  return moduleCodes.includes(requiredModule)
}

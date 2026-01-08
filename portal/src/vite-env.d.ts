/// <reference types="vite/client" />

interface Company {
  companyCode: string
  companyName: string
  allPermission: boolean
  moduleCodes: string[]
}

interface Permission {
  user: string
  companys: Company[]
}

interface RemoteAppProps {
  username?: string
  accessToken?: string
  companyCode?: string
  permission?: Permission | null
}

declare module 'salesVisitor/App' {
  const App: React.ComponentType<RemoteAppProps>
  export default App
}

declare module 'purchaseOrder/App' {
  const App: React.ComponentType<RemoteAppProps>
  export default App
}

declare module 'dashboard/App' {
  const App: React.ComponentType<RemoteAppProps>
  export default App
}

declare module 'businessDataMonitoring/App' {
  const App: React.ComponentType<RemoteAppProps>
  export default App
}

// Version modules
declare module 'purchaseOrder/version' {
  export const VERSION: string
  export const APP_NAME: string
}

declare module 'dashboard/version' {
  export const VERSION: string
  export const APP_NAME: string
}

declare module 'salesVisitor/version' {
  export const VERSION: string
  export const APP_NAME: string
}

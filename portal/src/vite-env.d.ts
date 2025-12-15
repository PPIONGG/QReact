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

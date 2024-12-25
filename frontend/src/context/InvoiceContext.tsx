import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

interface Invoice {
  id: string
  seller_id: string
  buyer_id: string
  amount: number
  description: string
  status: string
  payment_status: string
  requested_at: string
}

interface InvoiceContextType {
  invoices: Invoice[]
  setInvoices: (invoices: Invoice[]) => void
  lastFetched: Record<string, number>
  setLastFetched: Dispatch<SetStateAction<Record<string, number>>>
  cacheDuration: number
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [lastFetched, setLastFetched] = useState<Record<string, number>>({})
  const cacheDuration = 5 * 60 * 1000 // 5 minutes

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      setInvoices, 
      lastFetched, 
      setLastFetched,
      cacheDuration 
    }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider')
  }
  return context
}

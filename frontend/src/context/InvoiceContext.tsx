import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'

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
  cachedData: Record<string, Invoice[]>
  setCachedData: Dispatch<SetStateAction<Record<string, Invoice[]>>>
  cacheDuration: number
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('currentInvoices')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading invoices from localStorage:', error)
      return []
    }
  })

  const [lastFetched, setLastFetched] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('lastFetched')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading lastFetched from localStorage:', error)
      return {}
    }
  })

  const [cachedData, setCachedData] = useState<Record<string, Invoice[]>>(() => {
    try {
      const stored = localStorage.getItem('cachedData')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading cachedData from localStorage:', error)
      return {}
    }
  })

  const cacheDuration = 5 * 60 * 1000 // 5 minutes

  // Persist state changes to localStorage with error handling and logging
  useEffect(() => {
    try {
      console.log('Persisting invoices to localStorage:', { count: invoices.length });
      localStorage.setItem('currentInvoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error persisting invoices to localStorage:', error);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      console.log('Persisting lastFetched to localStorage:', lastFetched);
      localStorage.setItem('lastFetched', JSON.stringify(lastFetched));
    } catch (error) {
      console.error('Error persisting lastFetched to localStorage:', error);
    }
  }, [lastFetched]);

  useEffect(() => {
    try {
      const cacheSize = Object.keys(cachedData).length;
      console.log('Persisting cachedData to localStorage:', { cacheSize });
      localStorage.setItem('cachedData', JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error persisting cachedData to localStorage:', error);
    }
  }, [cachedData]);

  return (
    <InvoiceContext.Provider value={{ 
      invoices, 
      setInvoices, 
      lastFetched, 
      setLastFetched,
      cachedData,
      setCachedData,
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

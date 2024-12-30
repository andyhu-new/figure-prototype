import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

import type { Message, Invoice, InvoiceHeader } from '../types';

interface CachedData<T> {
  data: T;
  timestamp: number;
  key: string;
}

interface InvoiceContextType {
  buyerId: string;
  setBuyerId: (id: string) => void;
  invoices: Invoice[];
  invoiceHeaders: InvoiceHeader[];
  communications: Record<string, Message[]>;
  fetchInvoices: (type: 'buyer' | 'seller' | 'platform', id: string, filters?: { 
    status?: string[]; 
    startDate?: string | undefined; 
    endDate?: string | undefined;
    buyerId?: string;
    sellerId?: string;
  }) => Promise<void>;
  fetchInvoiceHeaders: (buyerId: string) => Promise<void>;
  fetchCommunications: (invoiceId: string) => Promise<void>;
  addInvoiceHeader: (header: Omit<InvoiceHeader, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInvoiceHeader: (headerId: string, header: Partial<InvoiceHeader>) => Promise<void>;
  deleteInvoiceHeader: (headerId: string) => Promise<void>;
  setInvoiceHeaders: (headers: InvoiceHeader[]) => void;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

function getFromLocalStorage<T>(key: string): CachedData<T> | null {
  const item = localStorage.getItem(key);
  if (!item) return null;

  const cached = JSON.parse(item) as CachedData<T>;
  if (Date.now() - cached.timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }

  return cached;
}

function setToLocalStorage<T>(key: string, data: T): void {
  const cached: CachedData<T> = {
    data,
    timestamp: Date.now(),
    key,
  };
  localStorage.setItem(key, JSON.stringify(cached));
}

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const [buyerId, setBuyerId] = useState('buyer1');
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Generate 30 mock invoices
    const mockInvoices: Invoice[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date('2024-01-01');
      date.setDate(date.getDate() + Math.floor(Math.random() * 31)); // Random date in January 2024
      
      const statuses: Array<Invoice['invoice_status']> = ['requested', 'uploaded', 'rejected'];
      const paymentStatuses: Array<Invoice['payment_status']> = ['outstanding', 'past_due'];
      const sellers = [
        { id: 'seller1', name: '卖家一' },
        { id: 'seller2', name: '卖家二' },
        { id: 'seller3', name: '卖家三' }
      ];
      const seller = sellers[Math.floor(Math.random() * sellers.length)];
      
      return {
        id: String(i + 1),
        buyer_id: `buyer${Math.floor(Math.random() * 5) + 1}`,
        seller_id: seller.id,
        amount: Math.floor(Math.random() * 10000) / 100,
        invoice_status: statuses[Math.floor(Math.random() * statuses.length)],
        payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        consumption_time: date.toISOString().split('T')[0],
        bill_number: `BILL${String(i + 1).padStart(3, '0')}`,
        seller_name: seller.name,
        created_at: date.toISOString().split('T')[0],
        updated_at: date.toISOString().split('T')[0],
        messages: [],
        uploaded_invoice_url: Math.random() > 0.7 ? `https://example.com/invoice${i + 1}.pdf` : undefined,
        seller_reply: '',
        remarks: ''
      };
    });
    return mockInvoices;
  });
  const [invoiceHeaders, setInvoiceHeaders] = useState<InvoiceHeader[]>([
    {
      id: '1',
      header_text: '测试公司',
      header_type: '企业',
      invoice_type: '增值税普通发票',
      mailing_address: '北京市朝阳区xxx街道',
      mailing_email: 'test@example.com',
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }
  ]);
  const [communications, setCommunications] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        sender_id: 'buyer1',
        message: '请尽快开具发票',
        timestamp: '2024-01-15T10:00:00Z',
      }
    ]
  });

  // Initialize from localStorage
  useEffect(() => {
    const cachedInvoices = getFromLocalStorage<Invoice[]>(`invoices-${buyerId}`);
    if (cachedInvoices) setInvoices(cachedInvoices.data);

    const cachedHeaders = getFromLocalStorage<InvoiceHeader[]>(`headers-${buyerId}`);
    if (cachedHeaders) setInvoiceHeaders(cachedHeaders.data);

    const cachedComms = getFromLocalStorage<Record<string, Message[]>>('communications');
    if (cachedComms) setCommunications(cachedComms.data);
  }, [buyerId]);


  const fetchInvoices = useCallback(async (type: 'buyer' | 'seller' | 'platform', id: string, filters?: { 
    status?: string[]; 
    startDate?: string | undefined; 
    endDate?: string | undefined;
    buyerId?: string;
    sellerId?: string;
  }) => {
    try {
      // Generate mock data if no invoices exist
      let data = invoices.length > 0 ? [...invoices] : Array.from({ length: 30 }, (_, i) => {
        const date = new Date('2024-01-01');
        date.setDate(date.getDate() + Math.floor(Math.random() * 31));
        
        const statuses: Array<Invoice['invoice_status']> = ['requested', 'uploaded', 'rejected'];
        const paymentStatuses: Array<Invoice['payment_status']> = ['outstanding', 'past_due'];
        const sellers = [
          { id: 'seller1', name: '卖家一' },
          { id: 'seller2', name: '卖家二' },
          { id: 'seller3', name: '卖家三' }
        ];
        const seller = sellers[Math.floor(Math.random() * sellers.length)];
        
        return {
          id: String(i + 1),
          buyer_id: id,
          seller_id: seller.id,
          amount: Math.floor(Math.random() * 10000) / 100,
          invoice_status: statuses[Math.floor(Math.random() * statuses.length)],
          payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
          consumption_time: date.toISOString().split('T')[0],
          bill_number: `BILL${String(i + 1).padStart(3, '0')}`,
          seller_name: seller.name,
          created_at: date.toISOString().split('T')[0],
          updated_at: date.toISOString().split('T')[0],
          messages: [],
          uploaded_invoice_url: Math.random() > 0.7 ? `https://example.com/invoice${i + 1}.pdf` : undefined,
          seller_reply: '',
          remarks: ''
        };
      });
      console.log('Initial data:', { data: data.map(d => ({ id: d.id, date: d.consumption_time })) });
      
      // Apply filters
      if (filters) {
        console.log('Applying filters:', filters);
        
        // Filter by buyer ID
        if (filters.buyerId && filters.buyerId.trim() !== '') {
          data = data.filter(invoice => invoice.buyer_id === filters.buyerId);
          console.log('After buyer ID filter:', { count: data.length });
        }
        
        // Filter by seller ID/name
        if (filters.sellerId && filters.sellerId.trim() !== '') {
          data = data.filter(invoice => 
            invoice.seller_id === filters.sellerId || 
            invoice.seller_name === filters.sellerId
          );
          console.log('After seller ID filter:', { count: data.length });
        }

        if (filters.status && filters.status.length > 0) {
          data = data.filter(invoice => filters.status?.includes(invoice.invoice_status));
          console.log('After status filter:', { count: data.length });
        }
        if (filters.startDate && filters.startDate !== '') {
          data = data.filter(invoice => {
            const consumptionDate = new Date(invoice.consumption_time);
            const filterStartDate = new Date(filters.startDate as string);
            const result = !isNaN(consumptionDate.getTime()) && !isNaN(filterStartDate.getTime()) && 
                   consumptionDate >= filterStartDate;
            console.log('Date comparison:', {
              invoice: invoice.consumption_time,
              startDate: filters.startDate,
              passes: result
            });
            return result;
          });
          console.log('After start date filter:', { count: data.length });
        }
        if (filters.endDate && filters.endDate !== '') {
          data = data.filter(invoice => {
            const consumptionDate = new Date(invoice.consumption_time);
            const filterEndDate = new Date(filters.endDate as string);
            const result = !isNaN(consumptionDate.getTime()) && !isNaN(filterEndDate.getTime()) && 
                   consumptionDate <= filterEndDate;
            console.log('Date comparison:', {
              invoice: invoice.consumption_time,
              endDate: filters.endDate,
              passes: result
            });
            return result;
          });
          console.log('After end date filter:', { count: data.length });
        }
      }

      console.log('Filtered invoices:', { 
        filteredCount: data.length,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        firstDate: data[0]?.consumption_time,
        lastDate: data[data.length - 1]?.consumption_time
      });
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('获取发票数据失败，请重试');
    }
  }, []);

  const fetchInvoiceHeaders = useCallback(async (buyerId: string) => {
    const cacheKey = `headers-${buyerId}`;
    const cached = getFromLocalStorage<InvoiceHeader[]>(cacheKey);

    if (cached) {
      setInvoiceHeaders(cached.data);
      return;
    }

    try {
      // Mock API response for development
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const data = invoiceHeaders;
      setInvoiceHeaders(data);
      setToLocalStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching invoice headers:', error);
      toast.error('获取发票抬头数据失败，请重试');
    }
  }, []);

  const fetchCommunications = useCallback(async (invoiceId: string) => {
    const cacheKey = `communications-${invoiceId}`;
    const cached = getFromLocalStorage<Message[]>(cacheKey);

    if (cached) {
      setCommunications(prev => ({ ...prev, [invoiceId]: cached.data }));
      return;
    }

    try {
      // Mock API response for development
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const data = communications[invoiceId] || [];
      setCommunications(prev => ({ ...prev, [invoiceId]: data }));
      setToLocalStorage(cacheKey, data);
    } catch (error) {
      console.error('Error fetching communications:', error);
      toast.error('获取沟通记录失败，请重试');
    }
  }, []);

  const addInvoiceHeader = useCallback(async (header: Omit<InvoiceHeader, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`/api/invoice-headers/${buyerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(header),
      });
      const data = await response.json();
      setInvoiceHeaders(prev => [...prev, data]);
      localStorage.removeItem(`headers-${buyerId}`);
      toast.success('发票抬头添加成功');
    } catch (error) {
      console.error('Error adding invoice header:', error);
      toast.error('添加发票抬头失败，请重试');
    }
  }, [buyerId]);

  const updateInvoiceHeader = useCallback(async (headerId: string, header: Partial<InvoiceHeader>) => {
    try {
      const response = await fetch(`/api/invoice-headers/${headerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(header),
      });
      const data = await response.json();
      setInvoiceHeaders(prev => prev.map(h => h.id === headerId ? { ...h, ...data } : h));
      localStorage.removeItem(`headers-${buyerId}`);
      toast.success('发票抬头更新成功');
    } catch (error) {
      console.error('Error updating invoice header:', error);
      toast.error('更新发票抬头失败，请重试');
    }
  }, [buyerId]);

  const deleteInvoiceHeader = useCallback(async (headerId: string) => {
    try {
      await fetch(`/api/invoice-headers/${headerId}`, { method: 'DELETE' });
      setInvoiceHeaders(prev => prev.filter(h => h.id !== headerId));
      localStorage.removeItem(`headers-${buyerId}`);
      toast.success('发票抬头删除成功');
    } catch (error) {
      console.error('Error deleting invoice header:', error);
      toast.error('删除发票抬头失败，请重试');
    }
  }, [buyerId]);

  const clearCache = useCallback(() => {
    Object.keys(localStorage)
      .filter(key => key.startsWith('invoices-') || key.startsWith('headers-') || key.startsWith('communications-'))
      .forEach(key => localStorage.removeItem(key));
  }, []);

  return (
    <InvoiceContext.Provider
      value={{
        buyerId,
        setBuyerId,
        invoices,
        invoiceHeaders,
        communications,
        fetchInvoices,
        fetchInvoiceHeaders,
        fetchCommunications,
        addInvoiceHeader,
        updateInvoiceHeader,
        deleteInvoiceHeader,
        setInvoiceHeaders,
        clearCache,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export const useInvoiceContext = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoiceContext must be used within an InvoiceProvider');
  }
  return context;
}

export type PaymentStatus = 'outstanding' | 'past_due';

export interface Message {
  id: string;
  sender_id: string;
  message: string;
  timestamp: string;
  attachment_url?: string;
}

export interface Invoice {
  id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  invoice_status: 'requested' | 'uploaded' | 'rejected';
  payment_status: 'outstanding' | 'past_due';
  consumption_time: string;
  bill_number: string;
  seller_name: string;
  product_name?: string;
  product_id?: string;
  uploaded_invoice_url?: string;
  seller_reply?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface InvoiceHeader {
  id: string;
  header_text: string;
  header_type: '个人' | '企业' | '事业单位';
  invoice_type: '增值税普通发票' | '增值税专用发票';
  mailing_address: string;
  mailing_email: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRequest {
  header_id: string;
  invoice_ids: string[];
  buyer_id: string;
  remarks?: string;
}

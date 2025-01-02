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
  amount_with_tax: number;  // Changed from amount
  tax_amount: number;       // New field
  invoice_status: '已申请' | '已上传' | '已拒绝';
  payment_status: '未付款' | '逾期';  // Updated casing
  consumption_time: string;
  bill_number: string;
  seller_name: string;
  uploaded_invoice_url?: string;
  seller_reply?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  seller_contact?: {        // New field
    contact_person: string;
    contact_info: string;
  };
  product_name?: string;  // Product information
  product_id?: string;
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

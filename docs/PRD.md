# Invoice Portal - Product Requirements Document

## Overview
The Invoice Portal is an e-commerce platform that facilitates invoice management between buyers, sellers, and platform administrators. The system streamlines the invoice request process, tracking, and management through three dedicated portals.

## System Architecture
The application consists of:
- Frontend: React-based web application with TypeScript
- Backend: FastAPI server with in-memory database
- Deployment: Cloud-hosted with public access

## Portal Interfaces

### 1. Buyer Portal
![Buyer Portal Interface](~/screenshots/invoice_request_app_072513.png)

#### Features
- View all past purchases with their invoice and payment status
- Multi-select functionality for batch invoice requests
- Status tracking:
  * Invoice Status: requested, uploaded, rejected
  * Payment Status: outstanding, past_due
- Confirmation dialog for batch invoice requests
- Real-time status updates

### 2. Seller Portal
![Seller Portal Interface](~/screenshots/invoice_request_app_072540.png)

#### Features
- Seller ID authentication
- View pending invoice requests
- Upload invoice documents
- Track invoice status
- Manage multiple buyer requests

### 3. Platform Portal
![Platform Portal Interface](~/screenshots/invoice_request_app_072352.png)

#### Features
- Comprehensive invoice monitoring
- Filter capabilities:
  * By Buyer ID
  * By Seller ID
- Email functionality:
  * Direct communication with sellers
  * Automated email templates
  * Status tracking
![Email Dialog](~/screenshots/invoice_request_app_072410.png)

## Data Model

### Invoice Object
```typescript
interface Invoice {
  buyerId: string;
  sellerId: string;
  amount: number;
  description: string;
  invoiceStatus: 'requested' | 'uploaded' | 'rejected';
  paymentStatus: 'outstanding' | 'past_due';
  requestedAt: Date;
  uploadedAt?: Date;
  documentUrl?: string;
}
```

## Workflows

### 1. Invoice Request Process
1. Buyer selects one or multiple invoices from the same seller
2. System validates selection and shows confirmation dialog
3. Upon confirmation, invoice status changes to "requested"
4. Seller receives notification via email

### 2. Invoice Upload Process
1. Seller logs in with Seller ID
2. Views pending invoice requests
3. Uploads invoice document
4. System updates invoice status to "uploaded"

### 3. Platform Monitoring
1. Platform team can view all invoices
2. Filter by buyer or seller ID
3. Track invoice and payment status
4. Send email reminders to sellers

## Technical Implementation

### Frontend Components
- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation

### Backend Services
- FastAPI server
- RESTful API endpoints
- In-memory database for demo
- Email service integration

## Security Considerations
- Seller authentication required
- Secure file upload for invoices
- Access control per portal
- Data validation and sanitization

## Future Enhancements
1. Persistent database implementation
2. User authentication system
3. Advanced filtering and search
4. Invoice template generation
5. Payment integration
6. Analytics dashboard

## Deployment
The application is deployed and accessible at:
- Frontend: https://invoice-request-app-357vkfsr.devinapps.com
- Backend: https://app-wpzdxfiu.fly.dev

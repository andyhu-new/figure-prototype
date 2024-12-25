from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum
from datetime import datetime, timedelta
import uuid

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class InvoiceStatus(str, Enum):
    REQUESTED = "requested"
    UPLOADED = "uploaded"
    REJECTED = "rejected"

class PaymentStatus(str, Enum):
    OUTSTANDING = "outstanding"
    PAST_DUE = "past_due"

class InvoiceRequest(BaseModel):
    buyer_id: str
    seller_id: str
    amount: float
    description: str

class Invoice:
    def __init__(self, request: InvoiceRequest):
        self.id = str(uuid.uuid4())
        self.buyer_id = request.buyer_id
        self.seller_id = request.seller_id
        self.amount = request.amount
        self.description = request.description
        self.status = InvoiceStatus.REQUESTED
        self.requested_at = datetime.now()
        self.uploaded_at: Optional[datetime] = None
        self.file_url: Optional[str] = None
        self.payment_status = PaymentStatus.OUTSTANDING

    def update_payment_status(self):
        """Update payment status based on the age of the invoice"""
        if (datetime.now() - self.requested_at) > timedelta(days=14):
            self.payment_status = PaymentStatus.PAST_DUE
        else:
            self.payment_status = PaymentStatus.OUTSTANDING

# In-memory database
invoices: dict[str, Invoice] = {}

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/mock-data")
async def create_mock_data():
    # Clear existing data
    invoices.clear()
    
    # Define service descriptions for more realistic data
    service_descriptions = [
        "Office Supplies", "IT Equipment", "Office Furniture", "Maintenance",
        "Consulting Services", "Software Licenses", "Cloud Services",
        "Marketing Materials", "Training Services", "Print Services",
        "Security Services", "Cleaning Services", "Internet Services",
        "Phone Services", "Equipment Rental"
    ]
    
    # Generate 30 varied invoices
    for i in range(30):
        # Create varied buyer and seller IDs
        buyer_id = f"B{(i % 5) + 100}"  # B100 through B104
        seller_id = f"S{(i % 4) + 1:03}"  # S001 through S004
        
        # Generate varied amounts between 500 and 10000
        amount = round(500 + (9500 * ((i * 17) % 100) / 100), 2)
        
        # Get description with batch number for variety
        description = f"{service_descriptions[i % len(service_descriptions)]} - Batch {(i // len(service_descriptions)) + 1}"
        
        # Create invoice request and invoice
        request = InvoiceRequest(
            buyer_id=buyer_id,
            seller_id=seller_id,
            amount=amount,
            description=description
        )
        invoice = Invoice(request)
        
        # Set varied invoice statuses (REQUESTED, UPLOADED, REJECTED)
        status_index = i % 4
        if status_index == 0:
            invoice.status = InvoiceStatus.UPLOADED
            invoice.uploaded_at = datetime.now() - timedelta(days=i % 7)
            invoice.file_url = f"mock_invoice_{i}.pdf"
        elif status_index == 1:
            invoice.status = InvoiceStatus.REJECTED
        
        # Vary the request dates to create a mix of payment statuses
        invoice.requested_at = datetime.now() - timedelta(days=i % 20)  # 0-19 days old
        invoice.update_payment_status()
        invoices[invoice.id] = invoice
    
    return {"message": "Mock data created successfully", "count": len(invoices)}

@app.post("/api/invoices/request")
async def request_invoice(request: InvoiceRequest):
    invoice = Invoice(request)
    invoices[invoice.id] = invoice
    return {
        "id": invoice.id,
        "status": invoice.status,
        "payment_status": invoice.payment_status,
        "requested_at": invoice.requested_at
    }

@app.get("/api/invoices/seller/{seller_id}")
async def get_seller_invoices(seller_id: str):
    seller_invoices = [
        {
            "id": inv.id,
            "buyer_id": inv.buyer_id,
            "amount": inv.amount,
            "description": inv.description,
            "status": inv.status,
            "payment_status": inv.payment_status,
            "requested_at": inv.requested_at,
            "uploaded_at": inv.uploaded_at,
            "file_url": inv.file_url
        }
        for inv in invoices.values()
        if inv.seller_id == seller_id
    ]
    return seller_invoices

@app.post("/api/invoices/{invoice_id}/upload")
async def upload_invoice(invoice_id: str, file: UploadFile = File(...)):
    if invoice_id not in invoices:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice = invoices[invoice_id]
    # In a real implementation, we would save the file and generate a URL
    # For this demo, we'll just use the filename
    invoice.file_url = file.filename
    invoice.status = InvoiceStatus.UPLOADED
    invoice.uploaded_at = datetime.now()
    
    return {
        "id": invoice.id,
        "status": invoice.status,
        "uploaded_at": invoice.uploaded_at,
        "file_url": invoice.file_url
    }

@app.get("/api/invoices")
async def get_all_invoices(buyer_id: str = None, seller_id: str = None):
    filtered_invoices = invoices.values()
    
    if buyer_id:
        filtered_invoices = [inv for inv in filtered_invoices if inv.buyer_id == buyer_id]
    
    if seller_id: 
        filtered_invoices = [inv for inv in filtered_invoices if inv.seller_id == seller_id]
    
    return [
        {
            "id": inv.id,
            "buyer_id": inv.buyer_id,
            "seller_id": inv.seller_id,
            "amount": inv.amount,
            "description": inv.description,
            "status": inv.status,
            "payment_status": inv.payment_status,
            "requested_at": inv.requested_at,
            "uploaded_at": inv.uploaded_at,
            "file_url": inv.file_url
        }
        for inv in filtered_invoices
    ]

@app.get("/api/invoices/buyer/{buyer_id}")
async def get_buyer_invoices(buyer_id: str):
    buyer_invoices = [
        {
            "id": inv.id,
            "seller_id": inv.seller_id,
            "amount": inv.amount,
            "description": inv.description,
            "status": inv.status,
            "payment_status": inv.payment_status,
            "requested_at": inv.requested_at,
            "uploaded_at": inv.uploaded_at,
            "file_url": inv.file_url
        }
        for inv in invoices.values()
        if inv.buyer_id == buyer_id
    ]
    return buyer_invoices

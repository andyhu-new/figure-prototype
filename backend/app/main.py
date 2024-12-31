from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid
import io
import openpyxl
from openpyxl.workbook import Workbook

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HeaderType(str, Enum):
    INDIVIDUAL = "个人"
    ENTERPRISE = "企业"
    INSTITUTION = "事业单位"

class InvoiceType(str, Enum):
    GENERAL_VAT = "增值税普通发票"
    SPECIAL_VAT = "增值税专用发票"

class InvoiceStatus(str, Enum):
    REQUESTED = "requested"
    UPLOADED = "uploaded"
    REJECTED = "rejected"

class PaymentStatus(str, Enum):
    OUTSTANDING = "outstanding"
    PAST_DUE = "past_due"

class InvoiceHeader(BaseModel):
    id: str
    header_text: str
    header_type: HeaderType
    invoice_type: InvoiceType
    mailing_address: str
    mailing_email: str
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

class Communication(BaseModel):
    id: str
    invoice_id: str
    sender_id: str
    message: str
    timestamp: datetime = datetime.now()
    attachment_url: Optional[str] = None

class Invoice(BaseModel):
    id: str
    buyer_id: str
    seller_id: str
    seller_name: str
    bill_number: str
    amount: float
    description: str
    invoice_status: InvoiceStatus
    payment_status: PaymentStatus
    consumption_time: datetime
    requested_at: datetime = datetime.now()
    header_id: Optional[str] = None
    remarks: Optional[str] = None
    uploaded_invoice_url: Optional[str] = None
    product_name: Optional[str] = None
    product_id: Optional[str] = None

# In-memory storage
invoices: List[Invoice] = []
invoice_headers: List[InvoiceHeader] = []
communications: List[Communication] = []

# Mock data generation function
def generate_mock_data():
    # Clear existing data
    invoices.clear()
    invoice_headers.clear()
    communications.clear()

    # Generate 30 mock invoices with varied data
    buyer_ids = ["buyer1", "buyer2", "buyer3"]
    seller_ids = ["seller1", "seller2", "seller3"]
    seller_names = ["ABC Company", "XYZ Corp", "123 Industries"]
    
    product_names = ["Laptop", "Smartphone", "Tablet"]
    product_ids = ["PRD-001", "PRD-002", "PRD-003"]
    
    for i in range(30):
        invoice_id = str(uuid.uuid4())
        invoice = Invoice(
            id=invoice_id,
            buyer_id=buyer_ids[i % 3],
            seller_id=seller_ids[i % 3],
            seller_name=seller_names[i % 3],
            bill_number=f"BILL-{2024}-{i+1:04d}",
            amount=float(1000 + i * 100),
            description=f"Purchase order #{i+1}",
            invoice_status=(InvoiceStatus.REQUESTED if i % 3 == 0 
                          else InvoiceStatus.UPLOADED if i % 3 == 1 
                          else InvoiceStatus.REJECTED),
            payment_status=PaymentStatus.OUTSTANDING if i % 2 == 0 else PaymentStatus.PAST_DUE,
            consumption_time=datetime.now(),
            requested_at=datetime.now(),
            product_name=product_names[i % 3],
            product_id=product_ids[i % 3],
            remarks=None  # Removing remarks as per requirements
        )
        invoices.append(invoice)

# API Endpoints

@app.get("/api/invoice-headers/{buyer_id}")
async def get_invoice_headers(buyer_id: str):
    return [header for header in invoice_headers if header.id.startswith(f"{buyer_id}-")]

@app.post("/api/invoice-headers/{buyer_id}")
async def create_invoice_header(buyer_id: str, header: InvoiceHeader):
    header.id = f"{buyer_id}-{str(uuid.uuid4())}"
    invoice_headers.append(header)
    return header

@app.put("/api/invoice-headers/{header_id}")
async def update_invoice_header(header_id: str, header: InvoiceHeader):
    for i, existing_header in enumerate(invoice_headers):
        if existing_header.id == header_id:
            header.id = header_id
            invoice_headers[i] = header
            return header
    raise HTTPException(status_code=404, detail="Invoice header not found")

@app.delete("/api/invoice-headers/{header_id}")
async def delete_invoice_header(header_id: str):
    for i, header in enumerate(invoice_headers):
        if header.id == header_id:
            del invoice_headers[i]
            return {"message": "Invoice header deleted"}
    raise HTTPException(status_code=404, detail="Invoice header not found")

@app.get("/api/invoices/buyer/{buyer_id}")
async def get_buyer_invoices(
    buyer_id: str,
    status: Optional[List[InvoiceStatus]] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    filtered_invoices = [inv for inv in invoices if inv.buyer_id == buyer_id]
    
    if status:
        filtered_invoices = [inv for inv in filtered_invoices if inv.invoice_status in status]
    
    if start_date:
        filtered_invoices = [inv for inv in filtered_invoices if inv.consumption_time >= start_date]
    
    if end_date:
        filtered_invoices = [inv for inv in filtered_invoices if inv.consumption_time <= end_date]
    
    return filtered_invoices

@app.get("/api/invoices/seller/{seller_id}")
async def get_seller_invoices(
    seller_id: str,
    buyer_id: Optional[str] = None
):
    filtered_invoices = [inv for inv in invoices if inv.seller_id == seller_id]
    
    if buyer_id:
        filtered_invoices = [inv for inv in filtered_invoices if inv.buyer_id == buyer_id]
    
    return filtered_invoices

@app.post("/api/invoices/{invoice_id}/communication")
async def add_communication(invoice_id: str, communication: Communication):
    communication.id = str(uuid.uuid4())
    communication.invoice_id = invoice_id
    communications.append(communication)
    return communication

@app.get("/api/invoices/{invoice_id}/communication")
async def get_communication_thread(invoice_id: str):
    return [comm for comm in communications if comm.invoice_id == invoice_id]

@app.post("/api/invoices/{invoice_id}/upload")
async def upload_invoice(invoice_id: str, file: UploadFile = File(...)):
    for invoice in invoices:
        if invoice.id == invoice_id:
            # In a real implementation, we would save the file and update the URL
            invoice.uploaded_invoice_url = f"/uploads/{file.filename}"
            invoice.invoice_status = InvoiceStatus.UPLOADED
            return {"message": "Invoice uploaded successfully"}
    raise HTTPException(status_code=404, detail="Invoice not found")

@app.post("/api/invoices/batch-email")
async def send_batch_email(invoice_ids: List[str]):
    # In a real implementation, this would send actual emails
    affected_invoices = []
    for invoice_id in invoice_ids:
        for invoice in invoices:
            if invoice.id == invoice_id:
                affected_invoices.append(invoice)
                break
    
    if not affected_invoices:
        raise HTTPException(status_code=404, detail="No valid invoices found")
    
    return {
        "message": f"Email sent to sellers for {len(affected_invoices)} invoices",
        "affected_invoices": affected_invoices
    }

@app.post("/api/invoices/download-excel")
async def download_excel(invoice_ids: List[str]):
    # Create a new workbook and select the active sheet
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Invoice Information"

    # Define headers
    headers = [
        "Invoice ID", "Bill Number", "Buyer ID", "Seller ID", "Seller Name",
        "Product Name", "Product ID", "Amount", "Invoice Status", "Payment Status",
        "Consumption Time", "Description"
    ]
    sheet.append(headers)

    # Add data rows
    for invoice_id in invoice_ids:
        invoice = next((inv for inv in invoices if inv.id == invoice_id), None)
        if invoice:
            row = [
                invoice.id,
                invoice.bill_number,
                invoice.buyer_id,
                invoice.seller_id,
                invoice.seller_name,
                invoice.product_name or "-",
                invoice.product_id or "-",
                invoice.amount,
                invoice.invoice_status.value,
                invoice.payment_status.value,
                invoice.consumption_time.strftime("%Y-%m-%d %H:%M:%S"),
                invoice.description
            ]
            sheet.append(row)

    # Create a BytesIO object to store the Excel file
    excel_file = io.BytesIO()
    workbook.save(excel_file)
    excel_file.seek(0)

    # Return the Excel file as a streaming response
    return StreamingResponse(
        iter([excel_file.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=invoice_information.xlsx"
        }
    )

# Generate initial mock data
generate_mock_data()

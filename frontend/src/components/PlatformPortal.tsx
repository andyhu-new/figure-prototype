import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Mail } from "lucide-react"

function PlatformPortal() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [buyerFilter, setBuyerFilter] = useState('')
  const [sellerFilter, setSellerFilter] = useState('')
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  interface Invoice {
    id: string;
    buyer_id: string;
    seller_id: string;
    amount: number;
    description: string;
    status: string;
    requested_at: string;
    uploaded_at?: string;
    file_url?: string;
  }

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const openEmailDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEmailDialog(true)
  }

  const handleSendEmail = () => {
    console.log('Sending email for invoice:', selectedInvoice)
    setShowEmailDialog(false)
    setSelectedInvoice(null)
  }

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/invoices`
      const params = new URLSearchParams()
      
      if (buyerFilter) params.append('buyer_id', buyerFilter)
      if (sellerFilter) params.append('seller_id', sellerFilter)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
    setLoading(false)
  }

  const clearFilters = () => {
    setBuyerFilter('')
    setSellerFilter('')
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Filter by Buyer ID"
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Filter by Seller ID"
              value={sellerFilter}
              onChange={(e) => setSellerFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={fetchInvoices} disabled={loading}>
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested At</TableHead>
              <TableHead>Uploaded At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.buyer_id}</TableCell>
                <TableCell>{invoice.seller_id}</TableCell>
                <TableCell>${invoice.amount}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>{new Date(invoice.requested_at).toLocaleString()}</TableCell>
                <TableCell>
                  {invoice.uploaded_at ? (
                    <div className="flex items-center gap-2">
                      <span>{new Date(invoice.uploaded_at).toLocaleString()}</span>
                      {invoice.file_url && (
                        <a
                          href={invoice.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FileText size={16} />
                        </a>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEmailDialog(invoice)}
                    className="flex items-center gap-2"
                  >
                    <Mail size={16} />
                    Email Seller
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Invoice Request Email</DialogTitle>
              <DialogDescription>
                Preview the email that will be sent to the seller
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">To:</p>
                  <p className="text-sm text-gray-500">{selectedInvoice.seller_id}@example.com</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Subject:</p>
                  <p className="text-sm text-gray-500">Invoice Request for Order #{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Message:</p>
                  <div className="rounded-md bg-gray-50 p-4 text-sm">
                    <p>Dear Seller,</p>
                    <br />
                    <p>This is a request for an invoice for the following order:</p>
                    <br />
                    <p>Order ID: {selectedInvoice.id}</p>
                    <p>Amount: ${selectedInvoice.amount}</p>
                    <p>Description: {selectedInvoice.description}</p>
                    <p>Requested by: {selectedInvoice.buyer_id}</p>
                    <br />
                    <p>Please upload the invoice through the seller portal.</p>
                    <br />
                    <p>Best regards,</p>
                    <p>Platform Team</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail}>
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default PlatformPortal

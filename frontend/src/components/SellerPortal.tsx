import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload } from "lucide-react"

function SellerPortal() {
  const [sellerId, setSellerId] = useState('')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/seller/${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
    setLoading(false)
  }

  const uploadInvoice = async (invoiceId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoiceId}/upload`, {
        method: 'POST',
        body: formData
      })
      if (response.ok) {
        fetchInvoices()
      }
    } catch (error) {
      console.error('Error uploading invoice:', error)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invoice Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div>
            <Label htmlFor="sellerId">Seller ID</Label>
            <Input
              id="sellerId"
              name="sellerId"
              placeholder="Enter seller ID"
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
            />
          </div>
          <Button onClick={fetchInvoices} disabled={loading || !sellerId}>
            {loading ? 'Loading...' : 'Load Invoices'}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice: any) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.buyer_id}</TableCell>
                <TableCell>${invoice.amount}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  {invoice.status === 'requested' && (
                    <div className="flex items-center">
                      <input
                        type="file"
                        id={`file-${invoice.id}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) uploadInvoice(invoice.id, file)
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`file-${invoice.id}`)?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!sellerId && (
          <div className="text-center py-4 text-gray-500">
            Please enter a Seller ID above to view pending invoice requests
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SellerPortal

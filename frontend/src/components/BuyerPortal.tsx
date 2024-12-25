import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function BuyerPortal() {
  const [buyerId] = useState('B100')
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleSelectInvoice = (id: string, seller_id: string, checked: boolean) => {
    if (checked) {
      if (!selectedSeller) {
        setSelectedSeller(seller_id)
        setSelectedInvoices([id])
      } else if (selectedSeller === seller_id) {
        setSelectedInvoices(prev => [...prev, id])
      }
    } else {
      setSelectedInvoices(prev => prev.filter(invoiceId => invoiceId !== id))
      if (selectedInvoices.length === 1) {
        setSelectedSeller(null)
      }
    }
  }

  const handleIssueSelected = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmIssue = () => {
    console.log('Issuing invoices:', selectedInvoices)
    setShowConfirmDialog(false)
    setSelectedInvoices([])
    setSelectedSeller(null)
  }

  const fetchInvoices = async () => {
    setLoading(true)
    console.log('Fetching invoices for buyer:', buyerId)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/buyer/${buyerId}`)
      console.log('Fetch response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched invoices:', data)
        setInvoices(data)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Seller ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Invoice Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Requested At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedInvoices.includes(invoice.id)}
                      onCheckedChange={(checked) => 
                        handleSelectInvoice(invoice.id, invoice.seller_id, checked === true)
                      }
                      disabled={selectedSeller !== null && selectedSeller !== invoice.seller_id}
                    />
                  </TableCell>
                  <TableCell>{invoice.seller_id}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>{invoice.payment_status}</TableCell>
                  <TableCell>{new Date(invoice.requested_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4">
            <div className="flex gap-4">
              <Button onClick={fetchInvoices} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button 
                onClick={handleIssueSelected} 
                disabled={selectedInvoices.length === 0}
                variant="default"
              >
                Issue Selected ({selectedInvoices.length})
              </Button>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Invoice Issuance</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to issue {selectedInvoices.length} invoice(s) for seller {selectedSeller}?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmIssue}>
                    Confirm Issue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BuyerPortal

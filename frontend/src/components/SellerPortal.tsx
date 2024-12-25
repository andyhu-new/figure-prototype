import { useState, useEffect } from 'react'
import { useInvoices } from '../context/InvoiceContext'
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
  const { invoices, setInvoices, lastFetched, setLastFetched, cachedData, setCachedData, cacheDuration } = useInvoices()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchInvoices = async (forceRefresh = false) => {
    if (!sellerId?.trim()) {
      setError('Please enter a valid Seller ID')
      return
    }

    const lastFetchTime = lastFetched[sellerId] || 0
    const now = Date.now()
    const hasValidCache = lastFetchTime && (now - lastFetchTime) <= cacheDuration
    const hasCachedData = cachedData[sellerId] && cachedData[sellerId].length > 0
    
    console.log('Cache check:', {
      sellerId,
      lastFetchTime: new Date(lastFetchTime).toISOString(),
      now: new Date(now).toISOString(),
      hasValidCache,
      hasCachedData,
      forceRefresh,
      cacheDuration
    })

    // Use cached data if available, valid, and not forcing refresh
    if (hasValidCache && hasCachedData && !forceRefresh) {
      console.log('Cache hit - Using cached data for seller:', sellerId)
      setInvoices(cachedData[sellerId])
      setLoading(false)
      return
    }

    console.log('Cache miss - Fetching fresh data for seller:', sellerId)
    setLoading(true)
    try {
      console.log('Fetching fresh data for seller:', sellerId)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/seller/${sellerId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
        setCachedData((prev) => ({ ...prev, [sellerId]: data }))
        setLastFetched((prev) => ({ ...prev, [sellerId]: now }))
        setError(null)
      } else {
        const errorData = await response.json()
        setError(`Failed to fetch invoices: ${errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      setError('Failed to fetch invoices. Please try again.')
    }
    setLoading(false)
  }

  const handleRefresh = () => {
    fetchInvoices(true)
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
        setError(null)
      } else {
        const errorData = await response.json()
        setError(`Failed to upload invoice: ${errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error uploading invoice:', error)
      setError('Failed to upload invoice. Please try again.')
    }
  }

  useEffect(() => {
    if (sellerId?.trim()) {
      fetchInvoices()
    }
  }, [sellerId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invoice Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
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
          <Button onClick={handleRefresh} disabled={loading || !sellerId}>
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

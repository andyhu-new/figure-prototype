import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useInvoiceContext } from '../context/InvoiceContext';
import type { Invoice, PaymentStatus } from '../types';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function SellerPortal() {
  const { invoices, fetchInvoices } = useInvoiceContext();
  const [searchBuyerId, setSearchBuyerId] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');

  const fetchSellerInvoices = async () => {
    await fetchInvoices('seller', 'seller1', {
      buyerId: searchBuyerId,
      startDate,
      endDate,
      status: paymentStatus !== 'all' ? [paymentStatus] : undefined,
    });
  };

  const handleSearch = () => {
    fetchSellerInvoices();
  };

  const handleUploadOrReply = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowUploadDialog(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedInvoice) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoice_id', selectedInvoice.id);

    try {
      const response = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchSellerInvoices();
        setShowUploadDialog(false);
        setSelectedInvoice(null);
      }
    } catch (error) {
      console.error('Error uploading invoice:', error);
    }
  };

  const handleDownloadExcel = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download-excel`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-info-${invoice.id}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  };

  const handleReply = async () => {
    if (!selectedInvoice || !replyMessage.trim()) return;

    try {
      const response = await fetch('/api/invoices/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: selectedInvoice.id,
          message: replyMessage,
          sender: 'seller1', // Replace with actual seller ID
        }),
      });

      if (response.ok) {
        await fetchSellerInvoices();
        setShowUploadDialog(false);
        setSelectedInvoice(null);
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  useEffect(() => {
    fetchSellerInvoices();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">卖家门户</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Search by buyer ID */}
        <div className="mb-6">
          <label htmlFor="buyerId" className="block text-sm font-medium text-gray-700 mb-2">
            按买家ID搜索
          </label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                id="buyerId"
                value={searchBuyerId}
                onChange={(e) => setSearchBuyerId(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="输入买家ID"
              />
              <button
                onClick={handleSearch}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                搜索
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  支付状态
                </label>
                <Select
                  value={paymentStatus}
                  onValueChange={setPaymentStatus}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="选择支付状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="outstanding">未支付</SelectItem>
                    <SelectItem value="past_due">已逾期</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买家ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买家名称</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品名称</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">含税金额</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">税额</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消费时间</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发票状态</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付状态</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发票下载</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户开票信息</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoice_status === 'requested' && (
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
                    )}
                    {invoice.buyer_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.buyer_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.product_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.product_id || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{invoice.amount_with_tax}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(invoice.consumption_time), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoice_status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.payment_status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.uploaded_invoice_url && (
                      <a
                        href={invoice.uploaded_invoice_url}
                        className="text-indigo-600 hover:text-indigo-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        下载
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleUploadOrReply(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      上传或回复
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleDownloadExcel(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      下载Excel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload/Reply Dialog */}
      {showUploadDialog && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">上传发票或回复买家</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">消息记录</h3>
              <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                {selectedInvoice.messages?.map((message) => (
                  <div key={message.id} className="mb-2">
                    <p className="text-sm text-gray-600">
                      {message.sender_id} - {format(new Date(message.timestamp), 'yyyy-MM-dd HH:mm')}
                    </p>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传发票
              </label>
              <input
                type="file"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                回复消息
              </label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="输入回复内容"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowUploadDialog(false);
                  setSelectedInvoice(null);
                  setReplyMessage('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                取消
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                发送回复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

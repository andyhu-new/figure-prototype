import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useInvoiceContext } from '../context/InvoiceContext';
import type { Invoice } from '../types';

export function PlatformPortal() {
  const { invoices, fetchInvoices } = useInvoiceContext();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchBuyerId, setSearchBuyerId] = useState('');
  const [searchSellerId, setSearchSellerId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');

  const fetchPlatformInvoices = async () => {
    await fetchInvoices('platform', 'platform', {
      buyerId: searchBuyerId.trim(),
      sellerId: searchSellerId.trim(),
      status: selectedStatuses
    });
  };

  // Communication handling is now done through the dialog component

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      }
      return [...prev, invoiceId];
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      }
      return [...prev, status];
    });
  };

  const handleShowDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleSendBatchEmail = async () => {
    if (selectedInvoices.length === 0) return;

    try {
      const response = await fetch('/api/invoices/batch-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_ids: selectedInvoices,
          template: emailTemplate,
        }),
      });

      if (response.ok) {
        setShowEmailDialog(false);
        setEmailTemplate('');
        setSelectedInvoices([]);
      }
    } catch (error) {
      console.error('Error sending batch email:', error);
    }
  };

  useEffect(() => {
    fetchPlatformInvoices();
  }, [searchBuyerId, searchSellerId, selectedStatuses, fetchInvoices]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">平台门户</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              买家ID
            </label>
            <input
              type="text"
              value={searchBuyerId}
              onChange={(e) => setSearchBuyerId(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
              placeholder="输入买家ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              卖家ID
            </label>
            <input
              type="text"
              value={searchSellerId}
              onChange={(e) => setSearchSellerId(e.target.value)}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2"
              placeholder="输入卖家ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              发票状态
            </label>
            <div className="space-x-4">
              {['requested', 'uploaded', 'rejected'].map(status => (
                <label key={status} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {status === 'requested' ? '待开具' :
                     status === 'uploaded' ? '已开具' :
                     '已拒绝'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedInvoices.length === invoices.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">全选</span>
          </div>
          <button
            onClick={() => setShowEmailDialog(true)}
            disabled={selectedInvoices.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            导出Excel
          </button>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账单编号</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">买家ID</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖家名称</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">含税金额</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">税额</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发票状态</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付状态</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消费时间</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.includes(invoice.id)}
                      onChange={() => handleInvoiceSelect(invoice.id)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.bill_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.buyer_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.seller_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">¥{invoice.amount_with_tax}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoice_status === 'requested' ? '待开具' :
                     invoice.invoice_status === 'uploaded' ? '已开具' :
                     '已拒绝'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.payment_status === 'Outstanding' ? '未支付' : '已逾期'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(invoice.consumption_time), 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      onClick={() => handleShowDetails(invoice)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communication Thread Dialog */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">发票详情</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                关闭
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">基本信息</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">账单编号</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.bill_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">金额</dt>
                  <dd className="mt-1 text-sm text-gray-900">¥{selectedInvoice.amount_with_tax}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">买家ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.buyer_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">卖家名称</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedInvoice.seller_name}</dd>
                </div>
              </dl>
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">沟通记录</h3>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {selectedInvoice?.messages?.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-600">
                        {message.sender_id} - {format(new Date(message.timestamp), 'yyyy-MM-dd HH:mm')}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{message.message}</p>
                    {message.attachment_url && (
                      <a
                        href={message.attachment_url}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看附件
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Template Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">发送批量邮件</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮件内容模板
              </label>
              <textarea
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入邮件内容..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEmailDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                取消
              </button>
              <button
                onClick={handleSendBatchEmail}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

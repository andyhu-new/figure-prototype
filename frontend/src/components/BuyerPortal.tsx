import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import type { Invoice, InvoiceHeader } from '../types';
import { toast } from 'react-hot-toast';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useInvoiceContext } from '../context/InvoiceContext';

type TabType = 'invoice' | 'header';

// Form schema for invoice header
const headerFormSchema = z.object({
  header_text: z.string().min(1, "发票抬头不能为空"),
  header_type: z.enum(["个人", "企业", "事业单位"]),
  invoice_type: z.enum(["增值税普通发票", "增值税专用发票"]),
  mailing_address: z.string().min(1, "邮寄地址不能为空"),
  mailing_email: z.string().email("请输入有效的邮箱地址"),
  remarks: z.string().optional(),
});

// These types are now defined in types.ts

export function BuyerPortal() {
  const {
    buyerId,
    invoices,
    invoiceHeaders,
    fetchInvoices,
    fetchInvoiceHeaders,
    addInvoiceHeader,
    setInvoiceHeaders,
  } = useInvoiceContext();

  // Initialize form and state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<InvoiceHeader | null>(null);
  const [showContactDialog, setShowContactDialog] = useState<{ contact_person: string; contact_info: string } | null>(null);
  // Initialize form and state
  const form = useForm<z.infer<typeof headerFormSchema>>({
    resolver: zodResolver(headerFormSchema),
    defaultValues: {
      header_text: "",
      header_type: "个人",
      invoice_type: "增值税普通发票",
      mailing_address: "",
      mailing_email: "",
      remarks: "",
    },
  });

  const [activeTab, setActiveTab] = useState<TabType>('invoice');
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(() => new Date('2024-01-01'));
  const [endDate, setEndDate] = useState<Date | null>(() => new Date('2024-01-15'));
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>('');

  const handleDateChange = (date: string | null, setDate: (date: Date | null) => void) => {
    console.log('handleDateChange input:', date);
    if (!date) {
      setDate(null);
      return;
    }
    try {
      // Parse the date string in YYYY-MM-DD format
      const [year, month, day] = date.split('-').map(Number);
      const newDate = new Date(year, month - 1, day); // month is 0-based in Date constructor
      console.log('Parsed date:', newDate.toISOString());
      if (!isNaN(newDate.getTime())) {
        setDate(newDate);
      } else {
        console.error('Invalid date:', date);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  // Form methods are now defined in the render function

  // Fetch filtered invoices
  const fetchFilteredInvoices = async () => {
    if (buyerId) {
      await fetchInvoices('buyer', buyerId, {
        status: selectedStatus,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        sellerId: selectedSeller || undefined
      });
    }
  };

  // Form submission handler
  const onSubmit = async (data: z.infer<typeof headerFormSchema>) => {
    try {
      const headerData = {
        ...data,
        id: crypto.randomUUID(),
      };
      await addInvoiceHeader(headerData);
      form.reset();
      toast.success('发票抬头保存成功');
    } catch (error) {
      console.error('Error creating header:', error);
      toast.error('保存失败，请重试');
    }
  };

  // Header validation is now handled by the form schema

  // Fetch invoices with filters
  useEffect(() => {
    console.log('Filter changed:', {
      selectedStatus,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString()
    });
    fetchFilteredInvoices();
    fetchInvoiceHeaders(buyerId);
  }, [buyerId, selectedStatus, selectedSeller, startDate, endDate, fetchInvoices, fetchInvoiceHeaders]);

  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch with buyerId:', buyerId);
    fetchFilteredInvoices();
    fetchInvoiceHeaders(buyerId);
  }, [buyerId, fetchInvoices, fetchInvoiceHeaders]);

  // Debug: Log invoices whenever they change
  useEffect(() => {
    console.log('Current invoices:', invoices);
  }, [invoices]);

  return (
    <div className="container mx-auto p-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <Button
            variant={activeTab === 'invoice' ? 'default' : 'outline'}
            onClick={() => setActiveTab('invoice')}
            className="mr-8"
          >
            发票管理
          </Button>
          <Button
            variant={activeTab === 'header' ? 'default' : 'outline'}
            onClick={() => setActiveTab('header')}
          >
            发票抬头
          </Button>
        </nav>
      </div>

      {/* Invoice Management Tab */}
      {activeTab === 'invoice' && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">卖家</label>
              <Select
                value={selectedSeller || 'all'}
                onValueChange={(value) => setSelectedSeller(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择卖家" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {Array.from(new Set(invoices.map(inv => inv.seller_id))).map((sellerId) => (
                    <SelectItem key={sellerId} value={sellerId}>
                      {invoices.find(inv => inv.seller_id === sellerId)?.seller_name || sellerId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">发票状态</label>
              <Select
                value={selectedStatus[0] || 'all'}
                onValueChange={(value) => setSelectedStatus(value === 'all' ? [] : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择发票状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="requested">已申请</SelectItem>
                  <SelectItem value="uploaded">已上传</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">起始日期</label>
              <Input
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(e.target.value, setStartDate)}
                min="2024-01-01"
                max="2024-12-31"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">结束日期</label>
              <Input
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDateChange(e.target.value, setEndDate)}
                min="2024-01-01"
                max="2024-12-31"
              />
            </div>
          </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">账单编号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖家名称</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">含税金额</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">税额</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发票状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支付状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">消费时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">选择</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">卖家联系方式</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...invoices].sort((a, b) => {
                      if (a.invoice_status === 'requested' && b.invoice_status !== 'requested') return -1;
                      if (a.invoice_status !== 'requested' && b.invoice_status === 'requested') return 1;
                      return 0;
                    }).map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{invoice.bill_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{invoice.seller_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">¥{invoice.amount_with_tax}</td>
                        <td className="px-6 py-4 whitespace-nowrap">¥{invoice.tax_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{invoice.invoice_status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{invoice.payment_status}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{format(new Date(invoice.consumption_time), "yyyy-MM-dd")}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {invoice.uploaded_invoice_url && (
                            <a
                              href={invoice.uploaded_invoice_url}
                              className="text-indigo-600 hover:text-indigo-900"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              下载发票
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.some(inv => inv.id === invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices([...selectedInvoices, invoice]);
                              } else {
                                setSelectedInvoices(selectedInvoices.filter(inv => inv.id !== invoice.id));
                              }
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {invoice.seller_contact && (
                            <button
                              onClick={() => setShowContactDialog(invoice.seller_contact || null)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              查看联系方式
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Contact Dialog */}
              {showContactDialog && (
                <Dialog open={!!showContactDialog} onOpenChange={() => setShowContactDialog(null)}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>卖家联系方式</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-2">
                      <p><strong>联系人:</strong> {showContactDialog.contact_person}</p>
                      <p><strong>联系方式:</strong> {showContactDialog.contact_info}</p>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setShowContactDialog(null)}>关闭</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {selectedInvoices.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (invoiceHeaders.length === 0) {
                        setActiveTab("header");
                      } else {
                        setShowConfirmDialog(true);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    申请发票
                  </button>
                </div>
              )}
            </div>
          </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>确认发票申请</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {invoiceHeaders.length === 0 ? (
              <div>
                <p className="text-sm text-gray-500">请先添加发票抬头信息</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="mb-1">选择发票抬头</Label>
                  <Select
                    value={selectedHeader?.id || ""}
                    onValueChange={(value: string) => {
                      const header = invoiceHeaders.find(h => h.id === value);
                      setSelectedHeader(header ?? null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择发票抬头" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceHeaders.map((header) => (
                        <SelectItem key={header.id} value={header.id}>
                          {header.header_text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedHeader && (
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>抬头类型:</strong> {selectedHeader?.header_type}</p>
                    <p><strong>发票类型:</strong> {selectedHeader?.invoice_type}</p>
                    <p><strong>邮寄地址:</strong> {selectedHeader?.mailing_address}</p>
                    <p><strong>邮寄邮箱:</strong> {selectedHeader?.mailing_email}</p>
                  </div>
                )}

                <div>
                  <p className="font-medium text-sm text-gray-700">已选择的发票:</p>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {selectedInvoices.map((invoice) => (
                      <li key={invoice.id}>
                        {invoice.seller_name} - ¥{invoice.amount_with_tax}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4">
                  <Label>备注</Label>
                  <Input
                    value={form.getValues("remarks") || ""}
                    onChange={(e) => form.setValue("remarks", e.target.value)}
                    placeholder="请输入备注信息（选填）"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              取消
            </Button>
            {invoiceHeaders.length > 0 && selectedHeader && (
              <Button
                onClick={async () => {
                  if (!selectedHeader) {
                    toast.error('请选择发票抬头');
                    return;
                  }

                  try {
                    const requestData = {
                      header_id: selectedHeader.id,
                      invoice_ids: selectedInvoices.map(inv => inv.id),
                      buyer_id: buyerId,
                      remarks: form.getValues("remarks") || "",
                    };

                    const response = await fetch('/api/invoice-requests', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(requestData),
                    });

                    if (response.ok) {
                      toast.success('发票申请已提交');
                      setSelectedInvoices([]);
                      setSelectedHeader(null);
                      setShowConfirmDialog(false);
                      form.setValue("remarks", "");
                      // Refresh invoices list
                      fetchInvoices('buyer', buyerId);
                    } else {
                      toast.error('提交失败，请重试');
                    }
                  } catch (error) {
                    console.error('Error submitting invoice request:', error);
                    toast.error('提交失败，请重试');
                  }
                }}
              >
                确认申请
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeTab === 'header' && (
        <div className="mt-4">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">已保存的发票抬头</h3>
              <div className="space-y-4">
                {invoiceHeaders.map((header) => (
                  <div
                    key={header.id}
                    className="border p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{header.header_text}</p>
                      <p className="text-sm text-gray-500">
                        {header.header_type} | {header.invoice_type}
                      </p>
                      <p className="text-sm text-gray-500">{header.mailing_email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/invoice-headers/${header.id}`, {
                            method: 'DELETE',
                          });
                          if (response.ok) {
                            setInvoiceHeaders(invoiceHeaders.filter(h => h.id !== header.id));
                          }
                        } catch (error) {
                          console.error('Error deleting header:', error);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">添加新发票抬头</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="header_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>发票抬头</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="header_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>抬头类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择抬头类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="个人">个人</SelectItem>
                            <SelectItem value="企业">企业</SelectItem>
                            <SelectItem value="事业单位">事业单位</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="invoice_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>发票类型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择发票类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="增值税普通发票">增值税普通发票</SelectItem>
                            <SelectItem value="增值税专用发票">增值税专用发票</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mailing_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮寄地址</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mailing_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮寄邮箱</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">保存发票抬头</Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

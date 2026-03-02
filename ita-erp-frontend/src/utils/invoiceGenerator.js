// utils/invoiceGenerator.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoice = (paymentData, isUpdate = false) => {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Safely parse numbers - ensure they are numbers
  const totalAmount = Number(paymentData.totalAmount) || 0;
  const paidAmount = Number(paymentData.paidAmount) || 0;
  const remaining = totalAmount - paidAmount;
  
  // Format numbers WITHOUT any extra characters - just the number
  const totalStr = totalAmount.toFixed(2);
  const paidStr = paidAmount.toFixed(2);
  const remainingStr = remaining.toFixed(2);
  
  // For display with ₹ symbol (will be added separately)
  const totalDisplay = totalStr;
  const paidDisplay = paidStr;
  const remainingDisplay = remainingStr;
  
  // ================= HEADER =================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Indian Traders Academy", 14, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("www.indiantradersacademy.com •", 14, 27);

  // ================= BILL TO SECTION =================
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 45);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${paymentData.clientName || 'N/A'}`, 14, 53);
  doc.text(`Phone: ${paymentData.clientPhone || 'N/A'}`, 14, 60);
  doc.text(`Address: ${paymentData.address || '-'}`, 14, 67);
  
  doc.text(`Date: ${new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA')}`, 140, 53);

  // ================= MAIN TABLE =================
  autoTable(doc, {
    startY: 80,
    head: [['Description', 'Qty.', 'Unit Price', 'Amount']],
    body: [[
      paymentData.companyName || '-',
      '1',
      totalDisplay,
      totalDisplay
    ]],
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'bold',
      lineColor: [200, 200, 200],
      lineWidth: 0.5
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 14, right: 14 },
    theme: 'plain'
  });

  let finalY = doc.lastAutoTable.finalY + 10;

  // ================= TERMS AND CONDITIONS =================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions:", 14, finalY);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  
  const terms = [
    "- Payment is due within 15 days from the date of the invoice.",
    "- Late payments may incur additional charges.",
    "- All sales are final. No refunds or returns accepted in any case.",
    "- Services are provided as described at the time of purchase."
  ];
  
  terms.forEach((term, i) => {
    doc.text(term, 18, finalY + 6 + (i * 4));
  });

  finalY += 25;

  // ================= SUMMARY TABLE =================
  autoTable(doc, {
    startY: finalY,
    body: [
      ['Subtotal', totalDisplay],
      ['Tax (0%)', '0.00'],
      ['Total', totalDisplay],
      ['Total Paid', paidDisplay],
      ['Remaining', remainingDisplay]
    ],
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 120, right: 14 },
    theme: 'plain'
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // ================= PART PAYMENT HISTORY =================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Part Payment History:", 14, finalY);
  
  finalY += 5;
  
  // Payment history table
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Date', 'Amount', 'Notes']],
    body: [[
      new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA'),
      paidDisplay,
      paymentData.notes || 'Basic plus advance offline'
    ]],
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'bold',
      lineColor: [200, 200, 200],
      lineWidth: 0.5
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 80 }
    },
    margin: { left: 14, right: 14 },
    theme: 'plain'
  });

  finalY = doc.lastAutoTable.finalY + 15;

  // ================= PAYMENT METHOD =================
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Method:", 14, finalY);
  
  finalY += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // Payment methods as checklist - WITHOUT any special characters
  const methods = [
    { label: 'Cash', selected: paymentData.paymentMode === 'cash' },
    { label: 'Bank Transfer', selected: paymentData.paymentMode === 'bank' },
    { label: 'Debit', selected: paymentData.paymentMode === 'card' },
    { label: 'Digital Wallet', selected: paymentData.paymentMode === 'upi' }
  ];
  
  methods.forEach((method, index) => {
    const x = 18 + (index % 2) * 60;
    const y = finalY + Math.floor(index / 2) * 7;
    // Use simple X for selected, empty for not selected - NO special characters
    const checkMark = method.selected ? 'X' : ' ';
    doc.text(`[${checkMark}] ${method.label}`, x, y);
  });

  finalY += 20;

  // ================= DATE AND SIGNATURE =================
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA')}`, 14, finalY);
  
  doc.setDrawColor(0, 0, 0);
  doc.line(120, finalY - 2, 190, finalY - 2);
  doc.text("Authorized Signature", 130, finalY + 5);

  return doc;
};

export const sendWhatsAppWithInvoice = (paymentData, doc) => {
  const total = Number(paymentData.totalAmount) || 0;
  const paid = Number(paymentData.paidAmount) || 0;
  const remaining = total - paid;
  
  // Simple WhatsApp message without special characters
  const message = `INVOICE FROM INDIAN TRADERS ACADEMY\n\n` +
    `Bill To:\n` +
    `Name: ${paymentData.clientName}\n` +
    `Phone: ${paymentData.clientPhone || 'N/A'}\n` +
    `Address: ${paymentData.address || '-'}\n` +
    `Date: ${new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA')}\n\n` +
    `Description: ${paymentData.companyName || '-'}\n` +
    `Qty: 1\n` +
    `Unit Price: ${total.toFixed(2)}\n` +
    `Amount: ${total.toFixed(2)}\n\n` +
    `Terms and Conditions:\n` +
    `- Payment is due within 15 days from the date of the invoice.\n` +
    `- Late payments may incur additional charges.\n` +
    `- All sales are final. No refunds or returns accepted in any case.\n` +
    `- Services are provided as described at the time of purchase.\n\n` +
    `Subtotal: ${total.toFixed(2)}\n` +
    `Tax (0%): 0.00\n` +
    `Total: ${total.toFixed(2)}\n` +
    `Total Paid: ${paid.toFixed(2)}\n` +
    `Remaining: ${remaining.toFixed(2)}\n\n` +
    `Part Payment History:\n` +
    `Date: ${new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA')}\n` +
    `Amount: ${paid.toFixed(2)}\n` +
    `Notes: ${paymentData.notes || 'Basic plus advance offline'}\n\n` +
    `Payment Method:\n` +
    `- [${paymentData.paymentMode === 'cash' ? 'X' : ' '}] Cash\n` +
    `- [${paymentData.paymentMode === 'bank' ? 'X' : ' '}] Bank Transfer\n` +
    `- [${paymentData.paymentMode === 'card' ? 'X' : ' '}] Debit\n` +
    `- [${paymentData.paymentMode === 'upi' ? 'X' : ' '}] Digital Wallet\n\n` +
    `Date: ${new Date(paymentData.collectionDate || new Date()).toLocaleDateString('en-CA')}\n` +
    `Authorized Signature`;

  // Save PDF
  const fileName = `Invoice_${paymentData.clientName?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  // Open WhatsApp
  window.open(`https://wa.me/${paymentData.clientPhone}?text=${encodeURIComponent(message)}`, "_blank");
};
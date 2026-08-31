import { APP_BRAND } from "@constants/app.constants";

import type { FeePayment, FeeRecordWithPayments } from "../types/fee.types";

import { formatCurrency, formatDate } from "./format";

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildReceiptHtml(record: FeeRecordWithPayments, payment: FeePayment): string {
    const studentName = escapeHtml(
        `${record.student.user.firstName} ${record.student.user.lastName}`,
    );
    const admissionNumber = escapeHtml(record.student.admissionNumber);
    const recordedBy = payment.recordedBy
        ? escapeHtml(`${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`)
        : "-";
    const note = payment.note ? escapeHtml(payment.note) : "-";
    const balance = Math.max(record.totalAmount - record.amountPaid, 0);

    const rows: Array<[string, string]> = [
        ["Receipt No.", escapeHtml(payment.id)],
        ["Payment date", formatDate(payment.paidOn)],
        ["Student", studentName],
        ["Admission No.", admissionNumber],
        ["Grade", `Grade ${record.feeStructure.gradeLevel}`],
        ["Recorded by", recordedBy],
        ["Note", note],
    ];

    const detailRows = rows
        .map(
            ([label, value]) =>
                `<tr><td class="label">${label}</td><td class="value">${value}</td></tr>`,
        )
        .join("");

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Fee Receipt - ${admissionNumber}</title>
<style>
    * { box-sizing: border-box; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1a1a1a;
        margin: 0;
        padding: 32px;
    }
    .receipt { max-width: 640px; margin: 0 auto; border: 1px solid #e2e2e2; border-radius: 12px; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
    .brand-name { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .brand-sub { font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #666; margin-top: 4px; }
    .doc-title { text-align: right; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #444; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; font-size: 14px; vertical-align: top; }
    td.label { color: #666; width: 40%; }
    td.value { font-weight: 500; text-align: right; }
    .amount-box { margin-top: 24px; background: #f6f6f6; border-radius: 10px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
    .amount-box .label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #555; }
    .amount-box .amount { font-size: 26px; font-weight: 700; }
    .summary { margin-top: 24px; border-top: 1px dashed #ccc; padding-top: 16px; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #888; }
    @media print { body { padding: 0; } .receipt { border: none; } }
</style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div>
                <div class="brand-name">${escapeHtml(APP_BRAND.NAME)}</div>
                <div class="brand-sub">${escapeHtml(APP_BRAND.SHORT_NAME)}</div>
            </div>
            <div class="doc-title">Fee Payment<br />Receipt</div>
        </div>

        <div class="amount-box">
            <span class="label">Amount paid</span>
            <span class="amount">${formatCurrency(payment.amount)}</span>
        </div>

        <table style="margin-top: 24px;">${detailRows}</table>

        <table class="summary">
            <tr><td class="label">Total fee</td><td class="value">${formatCurrency(record.totalAmount)}</td></tr>
            <tr><td class="label">Paid to date</td><td class="value">${formatCurrency(record.amountPaid)}</td></tr>
            <tr><td class="label">Balance due</td><td class="value">${formatCurrency(balance)}</td></tr>
        </table>

        <div class="footer">
            This is a computer-generated receipt. ${escapeHtml(APP_BRAND.COPYRIGHT)}
        </div>
    </div>
</body>
</html>`;
}

export function printFeeReceipt(record: FeeRecordWithPayments, payment: FeePayment): void {
    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
        return;
    }

    printWindow.document.write(buildReceiptHtml(record, payment));
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
        printWindow.print();
    };
}

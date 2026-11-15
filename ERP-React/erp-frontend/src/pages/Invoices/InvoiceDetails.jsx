import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import InvoiceService from "../../services/invoiceService";

import "./Invoice.css";

const InvoiceDetails = () => {

    const { id } = useParams();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadInvoice();

    }, [id]);

    const loadInvoice = async () => {

        try {

            const data =
                await InvoiceService.getById(id);

            setInvoice(data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to load invoice"
            );

        } finally {

            setLoading(false);
        }
    };

    const printInvoice = () => {

        window.print();
    };

    if (loading) {

        return (
            <div className="invoice-loading">
                Loading invoice...
            </div>
        );
    }

    if (!invoice) {

        return (
            <div className="invoice-empty">
                Invoice not found
            </div>
        );
    }

    return (

        <div className="invoice-details-page">

            <div className="invoice-detail-actions">

                <Link
                    to="/invoices"
                    className="back-btn"
                >
                    ← Back
                </Link>

                <Link
                    to={`/invoices/edit/${invoice.invoiceId}`}
                    className="edit-invoice-btn"
                >
                    Edit
                </Link>

                <button
                    className="print-invoice-btn"
                    onClick={printInvoice}
                >
                    Print Invoice
                </button>

            </div>

            <div
                className="printable-invoice"
                id="printableInvoice"
            >

                <div className="invoice-print-header">

                    <div>

                        <h1>
                            INVOICE
                        </h1>

                        <p>
                            {invoice.invoiceNumber}
                        </p>

                    </div>

                    <div className="invoice-company">

                        <h2>
                            Your Company
                        </h2>

                        <p>
                            ERP Business Solutions
                        </p>

                        <p>
                            India
                        </p>

                    </div>

                </div>

                <div className="invoice-info-grid">

                    <div>

                        <h4>
                            Bill To
                        </h4>

                        <strong>
                            {invoice.customerName}
                        </strong>

                    </div>

                    <div>

                        <p>
                            <strong>
                                Invoice Date:
                            </strong>{" "}
                            {new Date(
                                invoice.invoiceDate
                            ).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>
                                Due Date:
                            </strong>{" "}
                            {new Date(
                                invoice.dueDate
                            ).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>{" "}
                            {invoice.status}
                        </p>

                    </div>

                </div>

                <table className="invoice-detail-table">

                    <thead>

                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
                            <th>Tax</th>
                            <th>Total</th>
                        </tr>

                    </thead>

                    <tbody>

                        {invoice.invoiceItems?.map(
                            (item, index) => (

                                <tr key={item.invoiceItemId}>

                                    <td>
                                        {index + 1}
                                    </td>

                                    <td>
                                        {item.productName}
                                    </td>

                                    <td>
                                        {item.quantity}
                                    </td>

                                    <td>
                                        ₹
                                        {Number(
                                            item.unitPrice
                                        ).toFixed(2)}
                                    </td>

                                    <td>
                                        {item.discount}%
                                    </td>

                                    <td>
                                        {item.tax}%
                                    </td>

                                    <td>
                                        ₹
                                        {Number(
                                            item.total
                                        ).toFixed(2)}
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

                <div className="invoice-total-section">

                    <div className="invoice-total-box">

                        <div>

                            <span>
                                Sub Total
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    invoice.subTotal
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Discount
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    invoice.discount
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Tax
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    invoice.tax
                                ).toFixed(2)}
                            </strong>

                        </div>

                        <div className="invoice-final-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    invoice.totalAmount
                                ).toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </div>

                {invoice.notes && (

                    <div className="invoice-notes-display">

                        <h4>
                            Notes
                        </h4>

                        <p>
                            {invoice.notes}
                        </p>

                    </div>

                )}

                <div className="invoice-footer">

                    <p>
                        Thank you for your business.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default InvoiceDetails;
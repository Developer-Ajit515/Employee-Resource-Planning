import React from "react";
import { Link } from "react-router-dom";

const StripeCancel = () => {
    return (
        <div className="payment-result-page">

            <div className="payment-result-card">

                <div className="payment-result-icon">
                    !
                </div>

                <h2>
                    Payment Cancelled
                </h2>

                <p>
                    The Stripe payment was cancelled.
                </p>

                <div className="payment-result-actions">

                    <Link
                        to="/payments"
                        className="btn btn-primary"
                    >
                        Back to Payments
                    </Link>

                    <Link
                        to="/invoices"
                        className="btn btn-secondary"
                    >
                        Back to Invoices
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default StripeCancel;
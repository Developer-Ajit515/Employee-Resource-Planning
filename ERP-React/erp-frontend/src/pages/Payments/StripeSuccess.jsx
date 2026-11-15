import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./StripeSuccess.css";


const StripeSuccess = () => {
    const [searchParams] = useSearchParams();

    const sessionId =
        searchParams.get("session_id");

    return (
        <div className="payment-result-page">

            <div className="payment-result-card">

                <div className="payment-result-icon">
                    ✓
                </div>

                <h2>
                    Payment Successful
                </h2>

                <p>
                    Your payment has been submitted
                    successfully.
                </p>

                {sessionId && (
                    <p className="payment-session">
                        Session ID:
                        <br />
                        {sessionId}
                    </p>
                )}

                <div className="payment-result-actions">

                    <Link
                        to="/payments"
                        className="btn btn-primary"
                    >
                        Go to Payments
                    </Link>

                    <Link
                        to="/invoices"
                        className="btn btn-secondary"
                    >
                        Go to Invoices
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default StripeSuccess;
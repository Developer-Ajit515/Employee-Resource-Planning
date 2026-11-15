import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    createSupplier,
    getSupplier,
    updateSupplier
} from "../../services/supplierService";

import "./Supplier.css";


const initialForm = {
    supplierCode: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    paymentTerms: "",
    bankName: "",
    bankAccountNumber: "",
    ifscCode: "",
    isActive: true
};

    

const SupplierForm = ({
    modalMode = false,
    supplierId = null,
    onSaved,
    onCancel
}) => {
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const id = supplierId ?? routeId ?? null;
    const isEdit = Boolean(id);

    // Keep your existing initialForm, form state,
    // handleChange and the rest of your form logic.


    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    
    
useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadSupplier = async () => {
        try {
            const response = await getSupplier(id);
            const data = response?.data ?? response;

            if (!cancelled) {
                setForm((prev) => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (error) {
            console.error("Load supplier error:", error);
            window.alert("Unable to load supplier.");
        }
    };

    loadSupplier();

    return () => {
        cancelled = true;
    };
}, [id]);


    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : value
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.companyName.trim()) {
            alert("Company name is required.");
            return;
        }

        try {

            setLoading(true);

if (isEdit) {
    await updateSupplier(id, form);
} else {
    await createSupplier(form);
}

if (modalMode) {
    onSaved?.();
} else {
    navigate("/suppliers");
}


        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to save supplier."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className={`supplier-form-page ${modalMode ? "supplier-form-modal-content" : ""}`}>
    <div className="supplier-form-header">
        <div>
            <span className="supplier-form-eyebrow">
                SUPPLIER MANAGEMENT
            </span>
            <h2 id={modalMode ? "supplier-modal-title" : undefined}>
                {isEdit ? "Edit Supplier" : "Add Supplier"}
            </h2>
            <p>
                {isEdit
                    ? "Update supplier information and payment details."
                    : "Enter supplier, contact, address and banking details."}
            </p>
        </div>
    </div>

            <form
                className="supplier-form"
                onSubmit={handleSubmit}
            >

                <div className="form-section">

                    <h3>Basic Information</h3>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Supplier Code
                            </label>

                            <input
                                name="supplierCode"
                                value={form.supplierCode}
                                onChange={handleChange}
                                placeholder="SUP-001"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Company Name *
                            </label>

                            <input
                                name="companyName"
                                value={form.companyName}
                                onChange={handleChange}
                                placeholder="ABC Traders"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Contact Person
                            </label>

                            <input
                                name="contactPerson"
                                value={form.contactPerson}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                GST Number
                            </label>

                            <input
                                name="gstNumber"
                                value={form.gstNumber}
                                onChange={handleChange}
                                placeholder="22AAAAA0000A1Z5"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="supplier@example.com"
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+91 9876543210"
                            />

                        </div>

                    </div>

                </div>

                <div className="form-section">

                    <h3>Address</h3>

                    <div className="form-grid">

                        <div className="form-group full">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows="3"
                            />

                        </div>

                        <div className="form-group">

                            <label>City</label>

                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>State</label>

                            <input
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Country</label>

                            <input
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>Postal Code</label>

                            <input
                                name="postalCode"
                                value={form.postalCode}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

                <div className="form-section">

                    <h3>Payment & Banking</h3>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Payment Terms
                            </label>

                            <select
                                name="paymentTerms"
                                value={form.paymentTerms}
                                onChange={handleChange}
                            >

                                <option value="">
                                    Select
                                </option>

                                <option value="Immediate">
                                    Immediate
                                </option>

                                <option value="15 Days">
                                    15 Days
                                </option>

                                <option value="30 Days">
                                    30 Days
                                </option>

                                <option value="45 Days">
                                    45 Days
                                </option>

                                <option value="60 Days">
                                    60 Days
                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label>
                                Bank Name
                            </label>

                            <input
                                name="bankName"
                                value={form.bankName}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Account Number
                            </label>

                            <input
                                name="bankAccountNumber"
                                value={form.bankAccountNumber}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                IFSC Code
                            </label>

                            <input
                                name="ifscCode"
                                value={form.ifscCode}
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>

                <div className="supplier-form-footer">

                    <label className="active-checkbox">

                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                        />

                        Active Supplier

                    </label>

                    <div>

                        <button
                            type="button"
                            className="btn-cancel"
                           onClick={() => {
    if (modalMode) {
        onCancel?.();
    } else {
        navigate("/suppliers");
    }
}}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Update Supplier"
                                    : "Save Supplier"}
                        </button>

                    </div>

                </div>

            </form>

        </div>
    );
};

export default SupplierForm;
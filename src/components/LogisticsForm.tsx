import React, { useState } from 'react';
import { 
  ClipboardList, 
  MapPin, 
  Package, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Compass
} from 'lucide-react';

interface LogisticsFormProps {
  spreadsheetUrl: string;
  onSubmissionSuccess: (data: any) => void;
}

export const LogisticsForm: React.FC<LogisticsFormProps> = ({ spreadsheetUrl, onSubmissionSuccess }) => {
  // Get today's date formatted as YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState = {
    // Order Info
    orderId: '',
    orderDate: getTodayDateString(),
    customerName: '',
    phone: '',
    altPhone: '',

    // Shipping Address
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',

    // Product Details
    productSku: '',
    quantity: '1',
    weight: '',
    length: '',
    width: '',
    height: '',
    declaredValue: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    
    // Order Info validations
    if (!formData.orderId.trim()) tempErrors.orderId = 'Order ID/Number is required';
    if (!formData.orderDate) tempErrors.orderDate = 'Order Date is required';
    if (!formData.customerName.trim()) tempErrors.customerName = 'Customer Name is required';
    
    // Phone validation
    const phoneRegex = /^[0-9+() -]{10,15}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = 'Enter a valid phone number (10-15 digits)';
    }

    if (formData.altPhone.trim() && !phoneRegex.test(formData.altPhone)) {
      tempErrors.altPhone = 'Enter a valid alternate phone number';
    }

    // Address validations
    if (!formData.address1.trim()) tempErrors.address1 = 'Address Line 1 is required';
    if (!formData.city.trim()) tempErrors.city = 'City is required';
    if (!formData.state.trim()) tempErrors.state = 'State is required';
    
    // Pincode validation (standard Indian 6-digit or general 5-10 digit zip)
    const pinRegex = /^[0-9]{5,10}$/;
    if (!formData.pincode.trim()) {
      tempErrors.pincode = 'Pincode/ZIP is required';
    } else if (!pinRegex.test(formData.pincode.trim())) {
      tempErrors.pincode = 'Enter a valid pincode (5-10 digits)';
    }

    // Product validations
    if (!formData.productSku.trim()) tempErrors.productSku = 'Product SKU/Name is required';
    
    const qtyNum = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(qtyNum) || qtyNum <= 0) {
      tempErrors.quantity = 'Quantity must be at least 1';
    }

    const weightNum = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weightNum) || weightNum <= 0) {
      tempErrors.weight = 'Weight must be greater than 0 kg';
    }

    // Dimensions validation
    const l = parseFloat(formData.length);
    const w = parseFloat(formData.width);
    const h = parseFloat(formData.height);
    if (!formData.length || isNaN(l) || l <= 0) tempErrors.length = 'Req.';
    if (!formData.width || isNaN(w) || w <= 0) tempErrors.width = 'Req.';
    if (!formData.height || isNaN(h) || h <= 0) tempErrors.height = 'Req.';

    const valueNum = parseFloat(formData.declaredValue);
    if (!formData.declaredValue || isNaN(valueNum) || valueNum < 0) {
      tempErrors.declaredValue = 'Value must be 0 or more';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Prepare payload structure
    const payload = {
      timestamp: new Date().toISOString(),
      orderId: formData.orderId,
      orderDate: formData.orderDate,
      customerName: formData.customerName,
      phone: formData.phone,
      altPhone: formData.altPhone || 'N/A',
      addressLine1: formData.address1,
      addressLine2: formData.address2 || 'N/A',
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      landmark: formData.landmark || 'N/A',
      productNameSku: formData.productSku,
      quantity: parseInt(formData.quantity),
      weightKg: parseFloat(formData.weight),
      dimensions: `${formData.length}x${formData.width}x${formData.height}`,
      packageValue: parseFloat(formData.declaredValue)
    };

    try {
      if (!spreadsheetUrl) {
        // Simulation Mode (no Spreadsheet URL)
        // Simulate a slight network delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        onSubmissionSuccess(payload);
        setSubmitStatus('success');
      } else {
        // Send request to Apps Script Web App
        // Google Apps Script requires no-cors to bypass CORS preflight redirects, which returns status 0 (opaque response).
        await fetch(spreadsheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        // Since we use no-cors, we assume success if no Network Error/Cors-reject occurs.
        onSubmissionSuccess(payload);
        setSubmitStatus('success');
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Network error occurred. Please verify your connection.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setSubmitStatus('idle');
    setErrors({});
  };

  if (submitStatus === 'success') {
    return (
      <div className="premium-card status-screen" style={{ maxWidth: '650px', margin: '2rem auto' }}>
        <div className="circle-icon-bg success-bg">
          <CheckCircle size={44} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Shipment Registered</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            The order data has been successfully processed and passed to the logistics database.
          </p>
        </div>

        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          padding: '1.25rem',
          textAlign: 'left',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
            <span style={{ fontWeight: 600 }}>{formData.orderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
            <span style={{ fontWeight: 600 }}>{formData.customerName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Product/SKU:</span>
            <span style={{ fontWeight: 600 }}>{formData.productSku}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Destination Pincode:</span>
            <span style={{ fontWeight: 600 }}>{formData.pincode}</span>
          </div>
        </div>

        <button onClick={resetForm} className="btn btn-primary" style={{ width: '100%' }}>
          <RefreshCw size={18} />
          <span>Register Another Shipment</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Simulation Banner if Spreadsheet is not configured */}
      {!spreadsheetUrl && (
        <div style={{
          background: 'var(--secondary-accent-glow)',
          border: '1px solid rgba(205, 160, 82, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}>
          <Compass className="animate-pulse" style={{ color: 'var(--secondary-accent)', flexShrink: 0, marginTop: '2px' }} size={20} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--secondary-accent)' }}>Simulation Mode Enabled</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              No Google Sheet endpoint has been configured. Submissions will be simulated and logged in the Admin Panel history dashboard. Admin can set the link anytime.
            </p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          color: 'var(--danger)'
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem' }}>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="premium-card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Register New Shipment</span>
        </h2>

        {/* SECTION 1: ORDER INFO */}
        <div className="form-section">
          <h3 className="form-section-title">
            <ClipboardList size={18} />
            <span>Order Info</span>
          </h3>
          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Order ID / Order Number *</label>
              <input 
                type="text" 
                name="orderId" 
                value={formData.orderId}
                onChange={handleChange}
                placeholder="e.g. AEX-492942" 
                className={`form-input ${errors.orderId ? 'error' : ''}`}
              />
              {errors.orderId && <span className="error-message"><AlertCircle size={12} /> {errors.orderId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Order Date *</label>
              <input 
                type="date" 
                name="orderDate" 
                value={formData.orderDate}
                onChange={handleChange}
                className={`form-input ${errors.orderDate ? 'error' : ''}`}
              />
              {errors.orderDate && <span className="error-message"><AlertCircle size={12} /> {errors.orderDate}</span>}
            </div>
          </div>

          <div className="grid-cols-1" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input 
                type="text" 
                name="customerName" 
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Full Name" 
                className={`form-input ${errors.customerName ? 'error' : ''}`}
              />
              {errors.customerName && <span className="error-message"><AlertCircle size={12} /> {errors.customerName}</span>}
            </div>
          </div>

          <div className="grid-cols-2" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number" 
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="error-message"><AlertCircle size={12} /> {errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone (Optional)</label>
              <input 
                type="tel" 
                name="altPhone" 
                value={formData.altPhone}
                onChange={handleChange}
                placeholder="Secondary/Landline number" 
                className={`form-input ${errors.altPhone ? 'error' : ''}`}
              />
              {errors.altPhone && <span className="error-message"><AlertCircle size={12} /> {errors.altPhone}</span>}
            </div>
          </div>
        </div>

        {/* SECTION 2: SHIPPING ADDRESS */}
        <div className="form-section">
          <h3 className="form-section-title">
            <MapPin size={18} />
            <span>Shipping Address</span>
          </h3>
          
          <div className="grid-cols-1">
            <div className="form-group">
              <label className="form-label">Address Line 1 *</label>
              <input 
                type="text" 
                name="address1" 
                value={formData.address1}
                onChange={handleChange}
                placeholder="House/Office No, Building name, Street" 
                className={`form-input ${errors.address1 ? 'error' : ''}`}
              />
              {errors.address1 && <span className="error-message"><AlertCircle size={12} /> {errors.address1}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Address Line 2 (Optional)</label>
              <input 
                type="text" 
                name="address2" 
                value={formData.address2}
                onChange={handleChange}
                placeholder="Locality, Sector, Area" 
                className="form-input"
              />
            </div>
          </div>

          <div className="grid-cols-3" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city}
                onChange={handleChange}
                placeholder="City" 
                className={`form-input ${errors.city ? 'error' : ''}`}
              />
              {errors.city && <span className="error-message"><AlertCircle size={12} /> {errors.city}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state}
                onChange={handleChange}
                placeholder="State" 
                className={`form-input ${errors.state ? 'error' : ''}`}
              />
              {errors.state && <span className="error-message"><AlertCircle size={12} /> {errors.state}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input 
                type="text" 
                name="pincode" 
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode" 
                className={`form-input ${errors.pincode ? 'error' : ''}`}
              />
              {errors.pincode && <span className="error-message"><AlertCircle size={12} /> {errors.pincode}</span>}
            </div>
          </div>

          <div className="grid-cols-1" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Landmark (Optional)</label>
              <input 
                type="text" 
                name="landmark" 
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Metro Station / Behind Axis Bank" 
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PRODUCT/PACKAGE DETAILS */}
        <div className="form-section">
          <h3 className="form-section-title">
            <Package size={18} />
            <span>Product & Package Details</span>
          </h3>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label">Product Name / SKU *</label>
              <input 
                type="text" 
                name="productSku" 
                value={formData.productSku}
                onChange={handleChange}
                placeholder="Product Name or Stock Code" 
                className={`form-input ${errors.productSku ? 'error' : ''}`}
              />
              {errors.productSku && <span className="error-message"><AlertCircle size={12} /> {errors.productSku}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input 
                type="number" 
                name="quantity" 
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={`form-input ${errors.quantity ? 'error' : ''}`}
              />
              {errors.quantity && <span className="error-message"><AlertCircle size={12} /> {errors.quantity}</span>}
            </div>
          </div>

          <div className="grid-cols-2" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Weight (kg) *</label>
              <input 
                type="number" 
                name="weight" 
                step="0.01"
                min="0.01"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 1.25" 
                className={`form-input ${errors.weight ? 'error' : ''}`}
              />
              {errors.weight && <span className="error-message"><AlertCircle size={12} /> {errors.weight}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions (L x W x H) (cm) *</label>
              <div className="dimensions-grid">
                <div className="dimension-sub">
                  <input 
                    type="number" 
                    name="length" 
                    placeholder="L" 
                    value={formData.length}
                    onChange={handleChange}
                    className={`form-input ${errors.length ? 'error' : ''}`}
                  />
                  <span className="dimension-label">L</span>
                </div>
                <div className="dimension-sub">
                  <input 
                    type="number" 
                    name="width" 
                    placeholder="W" 
                    value={formData.width}
                    onChange={handleChange}
                    className={`form-input ${errors.width ? 'error' : ''}`}
                  />
                  <span className="dimension-label">W</span>
                </div>
                <div className="dimension-sub">
                  <input 
                    type="number" 
                    name="height" 
                    placeholder="H" 
                    value={formData.height}
                    onChange={handleChange}
                    className={`form-input ${errors.height ? 'error' : ''}`}
                  />
                  <span className="dimension-label">H</span>
                </div>
              </div>
              {(errors.length || errors.width || errors.height) && (
                <span className="error-message">
                  <AlertCircle size={12} /> Dimensions must be valid positive values.
                </span>
              )}
            </div>
          </div>

          <div className="grid-cols-1" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Package Value / Declared Value (INR/AED) *</label>
              <input 
                type="number" 
                name="declaredValue" 
                min="0"
                value={formData.declaredValue}
                onChange={handleChange}
                placeholder="Total package value" 
                className={`form-input ${errors.declaredValue ? 'error' : ''}`}
              />
              {errors.declaredValue && <span className="error-message"><AlertCircle size={12} /> {errors.declaredValue}</span>}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              <span>Transmitting Order Data...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit Shipment to Database</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

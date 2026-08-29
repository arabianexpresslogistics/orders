import React, { useState } from 'react';
import { addOrder, type OrderData } from '../api';
import { 
  ClipboardList, 
  MapPin, 
  Package, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

interface OrderFormProps {
  onSuccess: () => void;
  onOpenSpreadsheet?: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onSuccess, onOpenSpreadsheet }) => {
  // Get today's date formatted as YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState = {
    orderId: '',
    orderDate: getTodayDateString(),
    customerName: '',
    phone: '',
    altPhone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    productSku: '',
    quantity: '1',
    weight: '0.5',
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

    // Validate exact client-side required fields: 
    // Order ID, Customer Name, Phone Number, Address Line 1, City, State, Pincode, Product Name, Quantity
    if (!formData.orderId.trim()) tempErrors.orderId = 'Order ID is required';
    if (!formData.customerName.trim()) tempErrors.customerName = 'Customer Name is required';
    
    const phoneRegex = /^[0-9+() -]{10,15}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone Number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = 'Enter a valid phone number';
    }

    if (!formData.address1.trim()) tempErrors.address1 = 'Address Line 1 is required';
    if (!formData.city.trim()) tempErrors.city = 'City is required';
    if (!formData.state.trim()) tempErrors.state = 'State is required';

    const pinRegex = /^[0-9]{5,10}$/;
    if (!formData.pincode.trim()) {
      tempErrors.pincode = 'Pincode is required';
    } else if (!pinRegex.test(formData.pincode.trim())) {
      tempErrors.pincode = 'Enter a valid Pincode';
    }

    if (!formData.productSku.trim()) tempErrors.productSku = 'Product Name is required';
    
    const qtyNum = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(qtyNum) || qtyNum <= 0) {
      tempErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Build the exact OrderData payload to match headers exactly:
    const orderPayload: OrderData = {
      "Order ID / Order Number": formData.orderId,
      "Order Date": formData.orderDate,
      "Customer Name": formData.customerName,
      "Phone Number": formData.phone,
      "Alternate Phone": formData.altPhone || 'N/A',
      "Address Line 1": formData.address1,
      "Address Line 2": formData.address2 || 'N/A',
      "City": formData.city,
      "State": formData.state,
      "Pincode": formData.pincode,
      "Landmark": formData.landmark || 'N/A',
      "Product Name / SKU": formData.productSku,
      "Quantity": parseInt(formData.quantity) || 1,
      "Weight (kg)": parseFloat(formData.weight) || 0,
      "Length (cm)": parseFloat(formData.length) || 0,
      "Width (cm)": parseFloat(formData.width) || 0,
      "Height (cm)": parseFloat(formData.height) || 0,
      "Package Value / Declared Value": parseFloat(formData.declaredValue) || 0
    };

    try {
      const response = await addOrder(orderPayload);
      if (response.success) {
        setSubmitStatus('success');
        setFormData(initialFormState);
        onSuccess(); // Trigger parent reload
        setTimeout(() => setSubmitStatus('idle'), 4000);
      } else {
        setErrorMessage(response.error || 'Server rejected the order registration.');
        setSubmitStatus('error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network transmission error. Verify script connection and credentials.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Toast Alert Status */}
      {submitStatus === 'success' && (
        <div style={{
          background: 'var(--success-glow)',
          border: '1px solid rgba(25, 135, 84, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          color: 'var(--success)',
          fontWeight: 600
        }}>
          <CheckCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem' }}>Order registered successfully in Google Sheets database!</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          color: 'var(--danger)',
          fontWeight: 600
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem' }}>Error: {errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-accent)', fontWeight: 800 }}>
            Order Entry Form
          </h2>
          {onOpenSpreadsheet && (
            <button
              type="button"
              onClick={onOpenSpreadsheet}
              className="btn btn-secondary desktop-only-btn"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', gap: '0.4rem', borderColor: 'rgba(10, 58, 32, 0.2)' }}
            >
              <FileSpreadsheet size={16} style={{ color: 'var(--primary-accent)' }} />
              <span>Enter to Spreadsheet</span>
              <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* SECTION 1: ORDER INFO */}
        <div className="form-section">
          <h3 className="form-section-title">
            <ClipboardList size={18} />
            <span>Order Info</span>
          </h3>
          <div className="grid-cols-2 responsive-field-grid">
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

            <div className="form-group date-field-group">
              <label className="form-label">Order Date *</label>
              <div className="date-input-container">
                <input 
                  type="date" 
                  name="orderDate" 
                  value={formData.orderDate}
                  onChange={handleChange}
                  className="form-input date-input-field"
                  required
                />
              </div>
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
                placeholder="Customer Contact No." 
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="error-message"><AlertCircle size={12} /> {errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone</label>
              <input 
                type="tel" 
                name="altPhone" 
                value={formData.altPhone}
                onChange={handleChange}
                placeholder="e.g. COD back-up contact" 
                className="form-input"
              />
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
                placeholder="House/Office No, Building, Street" 
                className={`form-input ${errors.address1 ? 'error' : ''}`}
              />
              {errors.address1 && <span className="error-message"><AlertCircle size={12} /> {errors.address1}</span>}
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Address Line 2</label>
              <input 
                type="text" 
                name="address2" 
                value={formData.address2}
                onChange={handleChange}
                placeholder="Locality, Area, Sector" 
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
                placeholder="ZIP / Pincode" 
                className={`form-input ${errors.pincode ? 'error' : ''}`}
              />
              {errors.pincode && <span className="error-message"><AlertCircle size={12} /> {errors.pincode}</span>}
            </div>
          </div>

          <div className="grid-cols-1" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Landmark</label>
              <input 
                type="text" 
                name="landmark" 
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near Post Office / Landmark for delivery" 
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PRODUCT & PACKAGE DETAILS */}
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
                placeholder="SKU Code or Product Description" 
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
              <label className="form-label">Weight (kg)</label>
              <input 
                type="number" 
                name="weight" 
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 0.50" 
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dimensions (L x W x H) (cm)</label>
              <div className="dimensions-grid">
                <div className="dimension-sub">
                  <input 
                    type="number" 
                    name="length" 
                    placeholder="L" 
                    value={formData.length}
                    onChange={handleChange}
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
                  />
                  <span className="dimension-label">H</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-cols-1" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Package Value / Declared Value</label>
              <input 
                type="number" 
                name="declaredValue" 
                min="0"
                value={formData.declaredValue}
                onChange={handleChange}
                placeholder="Declared value for courier insurance / COD" 
                className="form-input"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem', fontSize: '1.05rem', padding: '0.85rem' }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span>Submitting Order...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>Submit Order</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

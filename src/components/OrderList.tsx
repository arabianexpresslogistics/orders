import React, { useState, useEffect } from 'react';
import { fetchOrders, type OrderData } from '../api';
import { Search, RefreshCw, AlertCircle, Inbox, PlusCircle, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface OrderListProps {
  refreshTrigger: number;
  onOpenSpreadsheet?: () => void;
  onNewOrder?: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({ refreshTrigger, onOpenSpreadsheet, onNewOrder }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrders();
      if (data.success && data.orders) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to retrieve order records.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection failed. Verify script URL and internet access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [refreshTrigger]);

  // Real-time filtering by Customer Name or Order ID
  const filteredOrders = orders.filter(order => {
    const custName = (order["Customer Name"] || '').toLowerCase();
    const orderIdVal = (
      order["Order ID / Order Number"] || 
      (order as any)["Order ID"] || 
      ''
    ).toString().toLowerCase();
    const query = searchQuery.toLowerCase();
    return custName.includes(query) || orderIdVal.includes(query);
  });

  // Sort orders: most recent "Order Date" first
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a["Order Date"] || 0).getTime();
    const dateB = new Date(b["Order Date"] || 0).getTime();
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });

  return (
    <div className="premium-card">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-accent)', fontWeight: 800 }}>
          Order Database Records
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onOpenSpreadsheet && (
            <button 
              onClick={onOpenSpreadsheet} 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem', borderColor: 'rgba(10, 58, 32, 0.25)' }}
            >
              <FileSpreadsheet size={15} style={{ color: 'var(--primary-accent)' }} />
              <span>Enter to Spreadsheet</span>
              <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          {onNewOrder && (
            <button 
              onClick={onNewOrder} 
              className="btn btn-primary" 
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem' }}
            >
              <PlusCircle size={15} />
              <span>New Order</span>
            </button>
          )}
          <button 
            onClick={loadOrders} 
            disabled={loading}
            className="btn btn-secondary" 
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          className="form-input" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search records by Customer Name or Order ID..."
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 1rem auto', color: 'var(--primary-accent)' }} />
          <p style={{ fontWeight: 500 }}>Retrieving Google Sheet rows...</p>
        </div>
      ) : error ? (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid rgba(220, 53, 69, 0.2)',
          color: 'var(--danger)',
          padding: '1.25rem',
          borderRadius: '10px',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : sortedOrders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          color: 'var(--text-muted)'
        }}>
          <Inbox size={40} style={{ margin: '0 auto 1rem auto', strokeWidth: 1.5 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No orders found</p>
          <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {orders.length === 0 
              ? 'The linked Google Sheet database has no registered entries yet.' 
              : 'No orders match your filter criteria.'}
          </p>
        </div>
      ) : (
        /* Responsive Table Container */
        <div className="table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>City, State</th>
                <th>Product SKU</th>
                <th>Qty</th>
                <th>Weight</th>
                <th>Declared Value</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order, idx) => {
                // Handle variations in key returned by GAS
                const orderIdVal = order["Order ID / Order Number"] || (order as any)["Order ID"] || 'N/A';
                const dateVal = order["Order Date"] || 'N/A';
                const nameVal = order["Customer Name"] || 'N/A';
                const phoneVal = order["Phone Number"] || (order as any)["Phone"] || 'N/A';
                const cityVal = order["City"] || '';
                const stateVal = order["State"] || '';
                const prodVal = order["Product Name / SKU"] || (order as any)["Product SKU"] || (order as any)["Product Name"] || 'N/A';
                const qtyVal = order["Quantity"] || 1;
                const weightVal = order["Weight (kg)"] || (order as any)["Weight"] || '0';
                const valueVal = order["Package Value / Declared Value"] || (order as any)["Package Value"] || '0';

                return (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-secondary)' }}>{dateVal}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-accent)' }}>{orderIdVal}</td>
                    <td style={{ fontWeight: 600 }}>{nameVal}</td>
                    <td>{phoneVal}</td>
                    <td>{cityVal}{cityVal && stateVal ? ', ' : ''}{stateVal}</td>
                    <td style={{ fontFamily: 'monospace' }}>{prodVal}</td>
                    <td>{qtyVal}</td>
                    <td>{weightVal} kg</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{valueVal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

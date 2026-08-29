import { useState } from 'react';
import { isLoggedIn, logout } from './api';
import { LoginForm } from './components/LoginForm';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { LogOut, ClipboardList, Database, FileSpreadsheet, ExternalLink, X, Settings, Menu } from 'lucide-react';
import logoImg from './assets/logo.png';

function App() {
  // Authentication Guard State
  const [isAuth, setIsAuth] = useState<boolean>(() => isLoggedIn());
  
  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  
  // Mobile Navigation Drawer State
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Triggers reload of OrderList when a new order is registered
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Google Sheet Direct Spreadsheet URL (defaults to env or localStorage)
  const [sheetDirectUrl, setSheetDirectUrl] = useState<string>(() => {
    return localStorage.getItem('spreadsheetDirectUrl') || import.meta.env.VITE_SPREADSHEET_URL || '';
  });
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(sheetDirectUrl);

  const handleLoginSuccess = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
  };

  // Dedicated "Enter to Spreadsheet" handler
  const handleOpenSpreadsheet = () => {
    if (sheetDirectUrl && sheetDirectUrl.trim()) {
      window.open(sheetDirectUrl.trim(), '_blank', 'noopener,noreferrer');
    } else {
      setIsUrlModalOpen(true);
    }
  };

  const handleSaveSheetUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (cleanUrl) {
      setSheetDirectUrl(cleanUrl);
      localStorage.setItem('spreadsheetDirectUrl', cleanUrl);
      setIsUrlModalOpen(false);
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 1. Protected Route: Redirect to Login Page if not authenticated
  if (!isAuth) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Admin Dashboard Layout (Once authenticated)
  return (
    <div className="app-container">
      {/* Sticky Header with logo, navigation, and dedicated "Enter to Spreadsheet" button */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0.75rem 1.5rem'
      }}>
        <div className="header-inner" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          width: '100%'
        }}>
          {/* Brand */}
          <div className="brand-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <img 
              src={logoImg} 
              alt="Arabian Express Logo" 
              className="brand-logo-img"
              style={{ 
                height: '42px', 
                width: 'auto',
                filter: 'drop-shadow(0 2px 4px rgba(10, 58, 32, 0.05))'
              }} 
            />
            <span className="brand-title-text" style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--primary-accent)'
            }}>
              ARABIAN EXPRESS
              <span style={{ color: 'var(--secondary-accent)', marginLeft: '4px' }}>LOGISTICS</span>
            </span>
          </div>

          {/* Navigation Controls */}
          <div style={{ flexShrink: 0 }}>
            {/* Desktop Navigation Cluster */}
            <div className="desktop-nav">
              <button 
                onClick={() => setActiveTab('form')}
                className={`btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <ClipboardList size={15} />
                <span>Register Order</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('list')}
                className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem' }}
              >
                <Database size={15} />
                <span>View Orders</span>
              </button>

              {/* SEPARATE BUTTON: Enter to Spreadsheet */}
              <button 
                onClick={handleOpenSpreadsheet}
                className="btn btn-secondary"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem', 
                  gap: '0.45rem', 
                  borderColor: 'rgba(10, 58, 32, 0.25)',
                  color: 'var(--primary-accent)',
                  fontWeight: 700
                }}
                title="Open Google Spreadsheet directly in a new tab"
              >
                <FileSpreadsheet size={16} />
                <span>Enter to Spreadsheet</span>
                <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
              
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.85rem', 
                  gap: '0.4rem', 
                  color: 'var(--danger)', 
                  borderColor: 'rgba(220, 53, 69, 0.15)' 
                }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Hamburger Toggle (Phone Screen) */}
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="mobile-menu-btn"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Pane */}
      <main className="content-wrap">
        {activeTab === 'form' ? (
          <OrderForm 
            onSuccess={() => setRefreshTrigger(prev => prev + 1)} 
            onOpenSpreadsheet={handleOpenSpreadsheet}
          />
        ) : (
          <OrderList 
            refreshTrigger={refreshTrigger} 
            onOpenSpreadsheet={handleOpenSpreadsheet} 
            onNewOrder={() => setActiveTab('form')}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'rgba(10, 58, 32, 0.03)',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        marginTop: '3rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <p>&copy; {new Date().getFullYear()} Arabian Express Logistics. All rights reserved.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
              Secure SSL Encrypted Sheet Integration Node.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--success)'
              }} />
              <span style={{ fontSize: '0.78rem' }}>Connected to Google Sheet Backend</span>
            </span>

            <button
              onClick={() => {
                setUrlInput(sheetDirectUrl);
                setIsUrlModalOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Configure direct spreadsheet link"
            >
              <Settings size={13} />
              <span>Spreadsheet Link Settings</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Drawer Navigation (Phone Screens) */}
      {isMobileDrawerOpen && (
        <div 
          className="mobile-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="mobile-drawer-panel"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img 
                  src={logoImg} 
                  alt="Arabian Express Logo" 
                  style={{ height: '36px', width: 'auto' }} 
                />
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--primary-accent)'
                }}>
                  NAVIGATION
                </span>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex'
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Navigation Options */}
            <div className="mobile-nav-items">
              <button 
                onClick={() => {
                  setActiveTab('form');
                  setIsMobileDrawerOpen(false);
                }}
                className={`btn mobile-nav-btn ${activeTab === 'form' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ClipboardList size={18} />
                <span>Register Order</span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab('list');
                  setIsMobileDrawerOpen(false);
                }}
                className={`btn mobile-nav-btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Database size={18} />
                <span>View Orders</span>
              </button>

              <button 
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleOpenSpreadsheet();
                }}
                className="btn btn-secondary mobile-nav-btn"
                style={{ borderColor: 'rgba(10, 58, 32, 0.25)', color: 'var(--primary-accent)', fontWeight: 700 }}
              >
                <FileSpreadsheet size={18} />
                <span>Enter to Spreadsheet</span>
                <ExternalLink size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>

              <button 
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setUrlInput(sheetDirectUrl);
                  setIsUrlModalOpen(true);
                }}
                className="btn btn-secondary mobile-nav-btn"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Settings size={18} />
                <span>Sheet Link Settings</span>
              </button>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />

              <button 
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary mobile-nav-btn"
                style={{ color: 'var(--danger)', borderColor: 'rgba(220, 53, 69, 0.2)' }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>

            {/* Drawer Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Arabian Express Logistics Portal
            </div>
          </div>
        </div>
      )}

      {/* Configure Google Spreadsheet Direct Link Modal */}
      {isUrlModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 58, 32, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="premium-card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setIsUrlModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-accent-glow)', color: 'var(--primary-accent)', padding: '0.6rem', borderRadius: '10px' }}>
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-accent)' }}>Enter to Spreadsheet</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Set your direct Google Spreadsheet web link
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSheetUrl}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Google Sheet URL</label>
                <input 
                  type="url"
                  className="form-input"
                  placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  required
                  autoFocus
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Paste the URL from your browser address bar when viewing your Google Sheet.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsUrlModalOpen(false)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', gap: '0.4rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Save &amp; Enter Spreadsheet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

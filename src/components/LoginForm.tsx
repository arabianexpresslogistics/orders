import React, { useState } from 'react';
import { login } from '../api';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(username.trim(), password);
      if (response.success) {
        onLoginSuccess();
      } else {
        setError(response.error || 'Invalid credentials. Please verify your administrative access.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection failure. Check backend service status and URL settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      padding: '1.5rem',
      backgroundImage: 
        'radial-gradient(circle at 10% 20%, rgba(205, 160, 82, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(10, 58, 32, 0.04) 0%, transparent 40%)',
    }}>
      <div className="premium-card" style={{
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px -15px rgba(10, 58, 32, 0.15)',
        border: '1px solid rgba(10, 58, 32, 0.08)'
      }}>
        {/* Logo container */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img 
            src={logoImg} 
            alt="Arabian Express Logo" 
            style={{ 
              width: '160px', 
              height: 'auto',
              filter: 'drop-shadow(0 4px 10px rgba(10, 58, 32, 0.1))'
            }} 
          />
        </div>

        {/* Branding Title */}
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--primary-accent)',
          letterSpacing: '-0.02em',
          marginBottom: '0.25rem'
        }}>
          ARABIAN EXPRESS
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '2rem'
        }}>
          Orders Database Administrative Panel
        </p>

        {/* Errors Alert */}
        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            border: '1px solid rgba(220, 53, 69, 0.2)',
            color: 'var(--danger)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 500
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} style={{ color: 'var(--primary-accent)' }} />
              <span>Username</span>
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Admin Username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} style={{ color: 'var(--primary-accent)' }} />
              <span>Password</span>
            </label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          Secure cryptographic handshake via Google Cloud infrastructure.
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { odooService } from '../services/odooApi';
import Header from './Header';

interface FormState {
  name: string;          // Always has a value (default: '')
  phone: string;         // Always has a value (default: '')
  loading: boolean;
  error: string | null;
  success: string | null;
}

export default function OdooForm() {
  // Initialize with default values - this fixes the controlled input warning
  const [state, setState] = useState<FormState>({
    name: '',              // Empty string, not undefined
    phone: '',             // Empty string, not undefined
    loading: false,
    error: null,
    success: null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null, success: null }));

    try {
      if (!state.name.trim() || !state.phone.trim()) {
        throw new Error('Name and phone are required');
      }

      const contactId = await odooService.createContact({
        name: state.name,
        phone: state.phone,
      });

      setState((prev) => ({
        ...prev,
        loading: false,
        success: `✓ Contact created! ID: ${contactId}`,
        name: '',    // Reset to empty string
        phone: '',   // Reset to empty string
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, success: null }));
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create contact';
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={styles.container}>
      <Header title="📝 React + Odoo Contact Form" />

      {state.success && (
        <div style={styles.successMessage}>
          {state.success}
        </div>
      )}

      {state.error && (
        <div style={styles.errorMessage}>
          ❌ {state.error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Name: <span style={styles.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={state.name}  // Always has a value (never undefined)
            onChange={handleInputChange}
            disabled={state.loading}
            placeholder="Enter contact name"
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.label}>
            Phone: <span style={styles.required}>*</span>
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={state.phone}   // Always has a value (never undefined)
            onChange={handleInputChange}
            disabled={state.loading}
            placeholder="Enter phone number"
            required
            style={styles.input}
          />
        </div>

        <button
          type="submit"
          disabled={state.loading}
          style={{
            ...styles.button,
            opacity: state.loading ? 0.6 : 1,
            cursor: state.loading ? 'not-allowed' : 'pointer',
          }}
        >
          {state.loading ? '⏳ Submitting...' : '📤 Submit to Odoo'}
        </button>
      </form>

      <div style={styles.info}>
        <p style={styles.infoText}>
          ✓ Database: <strong>{import.meta.env.VITE_ODOO_DATABASE}</strong>
        </p>
        <p style={styles.infoText}>
          ✓ Odoo: <strong>http://localhost:8069</strong>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
  },
  form: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    marginTop: '20px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: '12px',
    background: '#0078ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  } as React.CSSProperties,
  successMessage: {
    background: '#d1e7dd',
    color: '#0f5132',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '15px',
    border: '1px solid #badbcc',
  },
  errorMessage: {
    background: '#f8d7da',
    color: '#842029',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '15px',
    border: '1px solid #f5c2c7',
  },
  info: {
    background: '#e7f3ff',
    padding: '15px',
    borderRadius: '4px',
    marginTop: '20px',
    border: '1px solid #b3d9ff',
  },
  infoText: {
    margin: '5px 0',
    fontSize: '14px',
    color: '#0c5460',
  },
};
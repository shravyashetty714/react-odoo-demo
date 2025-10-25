import axios from 'axios';

interface CreateContactParams {
  name: string;
  phone: string;
}



interface OdooResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data: {
      name: string;
      debug: string;
    };
  };
}

class OdooService {
  private odooUrl: string;
  private database: string;
  private username: string;
  private password: string;

  constructor() {
    // In development, use empty string (Vite proxy will handle it)
    // In production, use full URL
    this.odooUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_ODOO_URL || 'http://localhost:8069');
    this.database = import.meta.env.VITE_ODOO_DATABASE || 'dbbrazen';
    this.username = import.meta.env.VITE_ODOO_USERNAME || 'admin';
    this.password = import.meta.env.VITE_ODOO_PASSWORD || 'admin';

    console.log('🔧 Odoo Service initialized:');
    console.log('  Mode:', import.meta.env.DEV ? 'Development' : 'Production');
    console.log('  URL:', this.odooUrl || 'Using proxy');
    console.log('  Database:', this.database);
  }

  /**
   * Authenticate with Odoo
   */
  async authenticate(): Promise<boolean> {
    try {
      const url = `${this.odooUrl}/web/session/authenticate`;
      console.log('🔐 Authenticating...', url);

      const response = await axios.post<OdooResponse>(url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.database,
          login: this.username,
          password: this.password,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth response:', response.data);

      if (response.data.result?.uid) {
        console.log('✓ Authenticated! User:', response.data.result.name);
        return true;
      } else {
        const errorMsg = response.data.error?.message || 'Unknown error';
        console.error('❌ Auth failed:', errorMsg);
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
      return false;
    }
  }

  /**
   * Create a contact (res.partner) in Odoo
   */
  async createContact(data: CreateContactParams): Promise<number | null> {
    try {
      // Authenticate first
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        throw new Error('Failed to authenticate with Odoo');
      }

      console.log('📝 Creating contact:', data);

      const url = `${this.odooUrl}/web/dataset/call_kw/res.partner/create`;
      const response = await axios.post<OdooResponse>(url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'res.partner',
          method: 'create',
          args: [
            {
              name: data.name,
              phone: data.phone,
            },
          ],
          kwargs: {},
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Create response:', response.data);

      if (response.data.result) {
        console.log(`✓ Contact created! ID: ${response.data.result}`);
        return response.data.result;
      } else {
        const errorMsg = response.data.error?.data?.debug || 'Failed to create contact';
        console.error('❌ Create failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error creating contact:', errorMsg);
      throw error;
    }
  }

  /**
   * Fetch all contacts from Odoo
   */
  async fetchContacts(): Promise<any[]> {
    try {
      const isAuthenticated = await this.authenticate();
      if (!isAuthenticated) {
        throw new Error('Failed to authenticate with Odoo');
      }

      const url = `${this.odooUrl}/web/dataset/call_kw/res.partner/search_read`;
      const response = await axios.post<OdooResponse>(url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'res.partner',
          method: 'search_read',
          args: [[]],
          kwargs: {
            fields: ['id', 'name', 'email', 'phone'],
            limit: 10,
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (Array.isArray(response.data.result)) {
        console.log(`✓ Fetched ${response.data.result.length} contacts`);
        return response.data.result;
      } else {
        console.error('❌ Fetch failed:', response.data.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      return [];
    }
  }
}

export const odooService = new OdooService();
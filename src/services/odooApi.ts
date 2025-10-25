import axios from 'axios';

interface CreateContactParams {
  name: string;
  phone: string;
}

interface OdooResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

class OdooService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    console.log('🔧 Odoo Service initialized:');
    console.log('  Mode:', import.meta.env.DEV ? 'Development' : 'Production');
    console.log('  Backend URL:', this.backendUrl);
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Authenticating via backend...');
      const response = await axios.post(`${this.backendUrl}/api/authenticate`, {});
      
      if (response.data.result?.uid) {
        console.log('✓ Authenticated:', response.data.result.name);
        return true;
      } else {
        console.error('❌ Auth failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return false;
    }
  }

  async createContact(data: CreateContactParams): Promise<number | null> {
    try {
      console.log('📝 Creating contact:', data);
      
      const response = await axios.post<OdooResponse>(
        `${this.backendUrl}/api/create-contact`,
        data
      );

      if (response.data.result) {
        console.log(`✓ Contact created! ID: ${response.data.result}`);
        return response.data.result;
      } else {
        console.error('❌ Create failed:', response.data.error);
        throw new Error('Failed to create contact');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error creating contact:', errorMsg);
      throw error;
    }
  }

  async fetchContacts(): Promise<any[]> {
    try {
      console.log('📋 Fetching contacts...');
      
      const response = await axios.get<OdooResponse>(
        `${this.backendUrl}/api/contacts`
      );

      if (Array.isArray(response.data.result)) {
        console.log(`✓ Fetched ${response.data.result.length} contacts`);
        return response.data.result;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching contacts:', error);
      return [];
    }
  }
}

export const odooService = new OdooService();
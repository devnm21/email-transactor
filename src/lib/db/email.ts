import { db } from './index';

export interface Email {
  id: string;
  source: string;
  external_thread_id: string;
  date: string;
  properties: Record<string, Record<string, string>>;
  provider_id: string;
  external_message_id: string;
  is_priority: boolean;
  draft_body: string;
  attachments: string[];
  body_html: string;
  status: 'pending' | 'processed' | 'failed';
}

// Simple Email Service with basic CRUD operations
export class EmailService {
  static async getAll(): Promise<Email[]> {
    try {
      return await db.emails.toArray();
    } catch (error) {
      console.error('Error getting all emails:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Email | undefined> {
    try {
      return await db.emails.get(id);
    } catch (error) {
      console.error(`Error getting email with id ${id}:`, error);
      throw error;
    }
  }

  static async bulkAdd(emails: Email[]): Promise<string[]> {
    try {
      const ids = await db.emails.bulkAdd(emails);
      console.log('Added emails:', ids);
      return emails;
    } catch (error) {
      console.error('Error adding emails:', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Email>): Promise<void> {
    try {
      await db.emails.update(id, updates);
    } catch (error) {
      console.error(`Error updating email with id ${id}:`, error);
      throw error;
    }
  }

  static async deleteAll(): Promise<void> {
    try {
      await db.emails.clear();
    } catch (error) {
      console.error('Error deleting all emails:', error);
      throw error;
    }
  }
}

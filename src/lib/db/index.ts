import Dexie, { type EntityTable } from 'dexie';
import { Email } from './email';
import { Transaction } from './transaction';

// Define the database class with proper TypeScript types
class EmailDatabase extends Dexie {
  emails!: EntityTable<Email, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;

  constructor() {
    super('EmailInsightz');

    this.version(1).stores({
      emails:
        'id, source, external_thread_id, date, provider_id, external_message_id, is_priority',
      transactions:
        'id, receiptId, emailId, name, description, company, amount, date, status, type, labels',
    });
  }
}

export const db = new EmailDatabase();

// Export types for use in other files
export type { Email, Transaction };

import { db } from '.';

export type TransactionStatus = 'pending' | 'complete' | 'failed';
export type TransactionType = 'income' | 'expense';
export type TransactionLabel =
  | 'shopping'
  | 'services'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'other';

export interface Transaction {
  id?: string;
  receiptId?: string;
  name?: string;
  description?: string;
  company?: string;
  amount?: number;
  date?: Date;
  status: TransactionStatus;
  type?: TransactionType;
  labels?: TransactionLabel[];
  emailId: string; // Reference to the associated email
  createdAt: Date;
}

class TransactionService {
  static async add(transaction: Transaction): Promise<Transaction> {
    await db.transactions.add(transaction);
    return transaction;
  }

  static async getAll(): Promise<Transaction[]> {
    return await db.transactions.toArray();
  }
  static async update(transaction: Transaction): Promise<void> {
    await db.transactions.update(transaction.id, {
      ...transaction,
    });
  }
  static async deleteAll(): Promise<void> {
    try {
      await db.transactions.clear();
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      throw error;
    }
  }
  static async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  }
}

export { TransactionService };

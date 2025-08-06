'use client';

import { useEffect, useState } from 'react';
import { Box, Text, VStack, Progress } from '@chakra-ui/react';
import {
  Stat,
  StatLabel,
  StatNumber as StatValueText,
  StatGroup,
} from '@chakra-ui/stat';
import { Fade } from '@chakra-ui/transition';
import { TransactionList } from './components/transaction-list';
import { Transaction } from './components/transaction';
import { ProcessButton } from './components/process-button';
import { Email, EmailService } from '../../db/email';
import { TransactionService } from '../../db/transaction';
import ProgressBar from '../../../components/ui/progress';
import { transformRawEmailObject } from '../../db/utils';

interface EmailData {
  id: string;
  date: string;
  properties: Record<string, any>;
  raw_email: string;
}

interface ProcessingMetrics {
  totalEmails: number;
  processedEmails: number;
  foundTransactions: number;
}

// API call to process a single email
const processEmail = async (
  transaction: Transaction,
  email: Email
): Promise<Transaction | null> => {
  try {
    const response = await fetch('/api/process-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction, email }),
    });

    if (!response.ok) {
      throw new Error('Failed to process email');
    }

    const { transaction: processedTransaction } = await response.json();
    return processedTransaction;
  } catch (error) {
    console.error('Error processing email:', email.id, error);
    return null;
  }
};

export const Home = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<ProcessingMetrics>({
    totalEmails: 0,
    processedEmails: 0,
    foundTransactions: 0,
  });

  useEffect(() => {
    const fetchEmails = async () => {
      const emails = await EmailService.getAll();
      setEmails(emails);
    };
    const fetchTransactions = async () => {
      const transactions = await TransactionService.getAll();
      setTransactions(transactions);
    };

    fetchTransactions();
    fetchEmails();
  }, []);

  console.log('transactions --->', transactions);

  const processEmails = async (emailData: Email[]) => {
    for (const email of emailData.slice(0, 2)) {
      console.log(email);
      const transaction = await TransactionService.add({
        id: crypto.randomUUID(),
        status: 'pending',
        createdAt: new Date(),
        emailId: email.id,
        date: new Date(email.date),
      });
      setTransactions((prev) => [transaction, ...prev]);

      const processedTransaction = await processEmail(transaction, email);
      if (processedTransaction) {
        await TransactionService.update(processedTransaction);
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === processedTransaction.id ? processedTransaction : t
          )
        );
      } else {
        // delete the transaction
        await TransactionService.delete(transaction.id || '');
        setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
      }

      console.log(processedTransaction);
      if (processedTransaction) {
        await EmailService.update(email.id, {
          status: 'processed',
        });
        await TransactionService.update(processedTransaction);
        setMetrics((current) => ({
          ...current,
          processedEmails: current.processedEmails + 1,
          foundTransactions: current.foundTransactions + 1,
        }));
      } else {
        setMetrics((current) => ({
          ...current,
          processedEmails: current.processedEmails + 1,
        }));
      }
    }
  };

  const loadEmails = async () => {
    const response = await fetch('/worktrial.json');
    if (!response.ok) throw new Error('Failed to fetch email data');
    const emailData: Email[] = await response.json();
    return emailData;
  };

  const dbCleanUp = async () => {
    await EmailService.deleteAll();
    await TransactionService.deleteAll();
  };

  const queueEmails = async () => {
    try {
      setIsProcessing(true);
      setTransactions([]);

      // Fetch email data
      const emailData = await loadEmails();
      await dbCleanUp();

      const emails = await EmailService.bulkAdd(
        emailData.map((email) => transformRawEmailObject(email))
      );
      setEmails(emails);

      // Initialize metrics
      setMetrics({
        totalEmails: emailData.length,
        processedEmails: 0,
        foundTransactions: 0,
      });

      // Process emails one by one
      // const processedTransactions: Transaction[] = [];
      await processEmails(emails.slice(0, 2));
    } catch (error) {
      console.error('Error processing emails:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const sortedTransactions =
    transactions?.sort(
      (a, b) =>
        new Date(a.createdAt || new Date()).getTime() -
        new Date(b.createdAt || new Date()).getTime()
    ) || [];

  console.log('metrics --->', metrics);

  return (
    <VStack gap={8} w="full" py={8}>
      <Box w="full" maxW="container.md">
        <VStack gap={6} align="stretch">
          <ProcessButton onProcess={queueEmails} w="full">
            Start Processing
          </ProcessButton>
          {isProcessing && (
            <ProgressBar
              value={(metrics.processedEmails / metrics.totalEmails) * 100 || 0}
            />
          )}

          {isProcessing && (
            <Box>
              <StatGroup>
                <Stat>
                  <StatLabel>Total Emails</StatLabel>
                  <StatValueText>{metrics.totalEmails}</StatValueText>
                </Stat>

                <Stat>
                  <StatLabel>Processing</StatLabel>
                  <StatValueText>
                    {metrics.processedEmails + 1}/{metrics.totalEmails}
                  </StatValueText>
                </Stat>

                <Stat>
                  <StatLabel>Transactions Found</StatLabel>
                  <StatValueText>{metrics.foundTransactions}</StatValueText>
                </Stat>
              </StatGroup>
            </Box>
          )}
        </VStack>
      </Box>

      {sortedTransactions.length > 0 && (
        <Fade in>
          <TransactionList transactions={sortedTransactions} />
        </Fade>
      )}
    </VStack>
  );
};

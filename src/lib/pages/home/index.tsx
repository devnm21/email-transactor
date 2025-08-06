'use client';

import { useState } from 'react';
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
  progress: number;
}

// API call to process a single email
const processEmail = async (email: EmailData): Promise<Transaction | null> => {
  try {
    const response = await fetch('/api/process-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to process email');
    }

    const { transaction } = await response.json();
    return transaction;
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
    progress: 0,
  });

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      setTransactions([]);

      // Fetch email data
      const response = await fetch('/worktrial.json');
      if (!response.ok) throw new Error('Failed to fetch email data');

      const emailData: EmailData[] = await response.json();
      setEmails(emailData);

      // Initialize metrics
      setMetrics({
        totalEmails: emailData.length,
        processedEmails: 0,
        foundTransactions: 0,
        progress: 0,
      });

      // Process emails one by one
      const processedTransactions: Transaction[] = [];

      for (const email of emailData.slice(1, 2)) {
        console.log(email);
        const transaction = await processEmail(email);
        console.log(transaction);
        if (transaction) {
          processedTransactions.push(transaction);
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

      // Update final state
      setTransactions(processedTransactions);
    } catch (error) {
      console.error('Error processing emails:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <VStack gap={8} w="full" py={8}>
      <Box w="full" maxW="container.md">
        <VStack gap={6} align="stretch">
          <ProcessButton onProcess={processEmails} w="full">
            Start Processing
          </ProcessButton>

          {isProcessing && (
            <Box>
              <StatGroup>
                <Stat>
                  <StatLabel>Total Emails</StatLabel>
                  <StatValueText>{metrics.totalEmails}</StatValueText>
                </Stat>

                <Stat>
                  <StatLabel>Processed</StatLabel>
                  <StatValueText>{metrics.processedEmails}</StatValueText>
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

      {!isProcessing && transactions.length > 0 && (
        <Fade in>
          <TransactionList transactions={transactions} />
        </Fade>
      )}
    </VStack>
  );
};

import {
  Box,
  Badge,
  Text,
  Flex,
  Stack,
  Icon,
  Dialog,
  Portal,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { useColorModeValue } from '../../../../components/ui/color-mode';
import { useState } from 'react';
import { EmailService } from '../../../db/email';

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
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransactionCardProps {
  transaction: Transaction;
}

const statusColors = {
  pending: 'yellow',
  complete: 'green',
  failed: 'red',
};

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {
  // Add styles for email content

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailDescription, setEmailDescription] = useState<string>('');
  const [emailContent, setEmailContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const incomeColor = useColorModeValue('green.500', 'green.300');
  const expenseColor = useColorModeValue('red.500', 'red.300');
  const amountColor =
    transaction.type === 'income' ? incomeColor : expenseColor;

  const handleTransactionClick = async () => {
    if (!transaction.emailId) return;

    setIsLoading(true);
    try {
      const email = await EmailService.getById(transaction.emailId);
      if (email?.body_html) {
        setEmailContent(email.body_html);
        setEmailSubject(email.subject);
        setEmailDescription(email.description);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box
        p={5}
        minW="600px"
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        boxShadow="sm"
        transition="all 0.2s"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }}
        onClick={handleTransactionClick}
      >
        <Flex justify="space-between" align="start" mb={3}>
          <Stack gap={1}>
            <Text fontWeight="bold" fontSize="lg">
              {transaction.company}
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              {emailDescription}
            </Text>
          </Stack>
          <Flex align="center" gap={2}>
            <Icon
              as={
                transaction.type === 'income' ? FiArrowUpRight : FiArrowDownLeft
              }
              color={amountColor}
            />
            <Text fontWeight="bold" fontSize="lg" color={amountColor}>
              ${Math.abs(transaction.amount || 0).toFixed(2)}
            </Text>
          </Flex>
        </Flex>

        <Text color={textColor} fontSize="sm" mb={3}>
          {transaction.description}
        </Text>

        <Flex justify="space-between" align="center" mb={3}>
          <Text color={textColor} fontSize="sm">
            {transaction.date
              ? format(transaction.date, 'MMM dd, yyyy')
              : 'Unknown date'}
          </Text>
          <Badge colorScheme={statusColors[transaction.status]}>
            {transaction.status.charAt(0).toUpperCase() +
              transaction.status.slice(1)}
          </Badge>
        </Flex>

        <Flex gap={2} flexWrap="wrap">
          {transaction.labels?.map((label) => (
            <Badge
              key={label}
              colorScheme="purple"
              variant="subtle"
              px={2}
              py={1}
              borderRadius="full"
            >
              {label}
            </Badge>
          ))}
        </Flex>
      </Box>

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(e) => setIsDialogOpen(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="4xl" maxH="90vh" overflow="hidden">
              <Dialog.Header>
                <Dialog.Title>{emailSubject}</Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body overflow="auto" maxH="70vh">
                {isLoading ? (
                  <Text>Loading email content...</Text>
                ) : (
                  <Box
                    dangerouslySetInnerHTML={{ __html: emailContent }}
                    className="email-content"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                    }}
                  />
                )}
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Close</Button>
                </Dialog.ActionTrigger>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

import { Box, Badge, Text, Flex, Stack, Icon } from '@chakra-ui/react';
import { FiArrowUpRight, FiArrowDownLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { useColorModeValue } from '../../../../components/ui/color-mode';

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
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const incomeColor = useColorModeValue('green.500', 'green.300');
  const expenseColor = useColorModeValue('red.500', 'red.300');
  const amountColor =
    transaction.type === 'income' ? incomeColor : expenseColor;

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md',
      }}
    >
      <Flex justify="space-between" align="start" mb={3}>
        <Stack gap={1}>
          <Text fontWeight="bold" fontSize="lg">
            {transaction.name}
          </Text>
          <Text color={textColor} fontSize="sm">
            {transaction.company}
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
            ${Math.abs(transaction.amount).toFixed(2)}
          </Text>
        </Flex>
      </Flex>

      <Text color={textColor} fontSize="sm" mb={3}>
        {transaction.description}
      </Text>

      <Flex justify="space-between" align="center" mb={3}>
        <Text color={textColor} fontSize="sm">
          {format(transaction.date, 'MMM dd, yyyy')}
        </Text>
        <Badge colorScheme={statusColors[transaction.status]}>
          {transaction.status.charAt(0).toUpperCase() +
            transaction.status.slice(1)}
        </Badge>
      </Flex>

      <Flex gap={2} flexWrap="wrap">
        {transaction.labels.map((label) => (
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
  );
};

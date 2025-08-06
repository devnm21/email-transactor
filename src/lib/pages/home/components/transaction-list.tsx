import {
  Box,
  SimpleGrid,
  Container,
  Skeleton,
  HStack,
  SkeletonCircle,
  Stack,
} from '@chakra-ui/react';
import { Transaction, TransactionCard } from './transaction';

interface TransactionListProps {
  transactions: Transaction[];
}

const SkeletonTransaction = () => {
  return (
    <HStack gap="5" p={4} borderRadius="md">
      <Skeleton height="192px" width="600px" />
    </HStack>
  );
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  return (
    <Box w="full" minH="100vh" py={8} px={4}>
      <Container maxW="7xl">
        <SimpleGrid w="full" gap={4}>
          {transactions.map((transaction, index) =>
            transaction.status === 'pending' ? (
              <SkeletonTransaction
                key={`${transaction.emailId}-${index}-pending`}
              />
            ) : (
              <TransactionCard
                key={`${transaction.emailId}-${index}`}
                transaction={transaction}
              />
            )
          )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

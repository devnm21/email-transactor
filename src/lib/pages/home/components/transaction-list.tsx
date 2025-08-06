import { Box, SimpleGrid, Container } from '@chakra-ui/react';
import { Transaction, TransactionCard } from './transaction';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
  return (
    <Box w="full" minH="100vh" py={8} px={4}>
      <Container maxW="7xl">
        <SimpleGrid w="full" gap={4}>
          {transactions.map((transaction, index) => (
            <TransactionCard
              key={`${transaction.emailId}-${index}`}
              transaction={transaction}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

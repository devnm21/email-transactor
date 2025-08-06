import { For, Progress as ProgressChakra, Stack } from '@chakra-ui/react';

export const ProgressBar = ({ value }: { value: number }) => {
  return (
    <Stack gap="4">
      <ProgressChakra.Root key={'progress'} size={'sm'} value={value}>
        <ProgressChakra.Track>
          <ProgressChakra.Range />
        </ProgressChakra.Track>
      </ProgressChakra.Root>
    </Stack>
  );
};

export default ProgressBar;

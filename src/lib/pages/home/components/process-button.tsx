'use client';

import { useState } from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

interface ProcessButtonProps extends Omit<ButtonProps, 'onClick'> {
  onProcess: () => Promise<void>;
}

export const ProcessButton: React.FC<ProcessButtonProps> = ({
  onProcess,
  children,
  ...props
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      await onProcess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      colorScheme="blue"
      loading={isProcessing}
      loadingText="Processing..."
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
};

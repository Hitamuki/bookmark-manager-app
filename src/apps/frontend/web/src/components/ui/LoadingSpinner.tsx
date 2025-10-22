'use client';

import { Spinner } from '@heroui/react';

type LoadingProps = {
  text?: string;
  variant?: 'gradient' | 'dots';
};
export const LoadingSpinner = ({ text = 'Loading...', variant = 'gradient' }: LoadingProps) => {
  // スピナー
  return (
    <div className="flex justify-center">
      <Spinner color="default" variant={variant} label={text} />
    </div>
  );
};

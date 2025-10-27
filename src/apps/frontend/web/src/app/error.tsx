'use client';

import { Button } from '@heroui/react';
import { House, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CustomError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // TODO: エラーデザイン検討
  return (
    <div>
      <Button color="primary" startContent={<RefreshCcw />} onPress={() => reset()}>
        Try again
      </Button>
      <Button color="primary" startContent={<House />} as={Link} href="/">
        Back to top
      </Button>
    </div>
  );
}

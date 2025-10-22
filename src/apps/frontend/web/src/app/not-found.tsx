import { Button } from '@heroui/react';
import { Frown, House } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <Frown className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">404 - Page not found</h1>
        <div className="mt-6">
          <Button color="primary" startContent={<House />} as={Link} href="/">
            Back to top
          </Button>
        </div>
      </div>
    </div>
  );
}

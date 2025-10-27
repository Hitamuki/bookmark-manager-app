'use client';

if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  require('../msw/setup');
}

export default function MswProvider({ children }: { children: React.ReactNode }) {
  return children;
}

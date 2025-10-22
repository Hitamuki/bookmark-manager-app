'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import type React from 'react';

type SamplesLayoutProps = {
  children: React.ReactNode;
};

export const SamplesLayout = ({ children }: SamplesLayoutProps) => {
  return (
    <div className="space-y-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Samples</BreadcrumbItem>
      </Breadcrumbs>
      {children}
    </div>
  );
};

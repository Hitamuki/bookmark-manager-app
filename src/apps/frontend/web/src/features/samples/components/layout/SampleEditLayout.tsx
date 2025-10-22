'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import type React from 'react';

type SampleEditLayoutProps = {
  children: React.ReactNode;
};

export const SampleEditLayout = ({ children }: SampleEditLayoutProps) => {
  return (
    <div className="space-y-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/samples">Samples</BreadcrumbItem>
        <BreadcrumbItem>Edit</BreadcrumbItem>
      </Breadcrumbs>
      {children}
    </div>
  );
};

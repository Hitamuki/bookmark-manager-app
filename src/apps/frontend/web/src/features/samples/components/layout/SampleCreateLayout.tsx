'use client';

import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import type React from 'react';

type SampleCreateLayoutProps = {
  children: React.ReactNode;
};

export const SampleCreateLayout = ({ children }: SampleCreateLayoutProps) => {
  return (
    <div className="space-y-4">
      <Breadcrumbs>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/samples">Samples</BreadcrumbItem>
        <BreadcrumbItem>Create</BreadcrumbItem>
      </Breadcrumbs>
      {children}
    </div>
  );
};

'use client';

import { Card } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

export const ErrorDisplay = ({ message, statusCode }: { message?: string; statusCode?: number }) => {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          {message ? (
            <>
              <p className="text-lg font-semibold text-red-600">{statusCode}</p>
              <p className="text-lg font-semibold text-red-600">{message}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-red-600">データの読み込み中にエラーが発生しました。</p>
              <p className="text-sm text-gray-500">時間をおいて再度お試しください。</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

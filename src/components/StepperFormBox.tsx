import { FC, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface StepperFormBoxProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const StepperFormBox: FC<StepperFormBoxProps> = ({ children, title, description }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent className="p-8 grid gap-10">
          {(title || description) && (
            <div className="space-y-2">
              {title && <h2 className="text-lg font-semibold font-pixel">{title}</h2>}
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

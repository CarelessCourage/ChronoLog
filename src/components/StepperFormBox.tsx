import { FC, ReactNode, RefObject } from 'react';
import { Card, CardContent } from '@/components/ui/card.tsx';

interface StepperFormBoxProps {
  children: ReactNode;
  title?: string;
  description?: string;
  titleRef?: RefObject<HTMLHeadingElement>;
  descriptionRef?: RefObject<HTMLParagraphElement>;
  containerRef?: RefObject<HTMLDivElement>;
}

export const StepperFormBox: FC<StepperFormBoxProps> = ({ children, title, description, titleRef, descriptionRef, containerRef }) => {
  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent className="p-8 grid gap-10">
          {(title || description) && (
            <div className="space-y-2">
              {title && <h2 ref={titleRef} className="text-lg font-semibold font-pixel">{title}</h2>}
              {description && <p ref={descriptionRef} className="text-sm text-gray-600">{description}</p>}
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

import {FC, ReactNode} from 'react';
import {Card, CardContent} from "@/components/ui/card.tsx";

interface StepperFormBoxProps {
    children: ReactNode;
}

export const StepperFormBox: FC<StepperFormBoxProps> = ({children}) => {
    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardContent className="p-8">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
};
import { FC, useState } from 'react';
import { useStepper } from '@/components/StepperProvider';
import { StepperFormBox } from '@/components/StepperFormBox';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

const FAILED_ATTEMPTS = [
    "❌ We did not hear from you, please try again louder.",
    "❌ Please try again in a strong Norwegian accent.",
];

export const VoiceRecognition: FC = () => {
    const { nextStep } = useStepper();
    const [isRecording, setIsRecording] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showTryAnotherMethod, setShowTryAnotherMethod] = useState(false);

    const handlePointerDown = () => {
        setIsRecording(true);
    };

    const handlePointerUp = () => {
        if (isRecording) {
            setIsRecording(false);

            // Check if this attempt should fail
            if (attemptCount < FAILED_ATTEMPTS.length) {
                setErrorMessage(FAILED_ATTEMPTS[attemptCount]);
                setAttemptCount(attemptCount + 1);
            } else {
                // All failed attempts exhausted, show try another method
                setShowTryAnotherMethod(true);
                setErrorMessage(null);
            }
        }
    };

    const handlePointerLeave = () => {
        if (isRecording) {
            setIsRecording(false);

            // Check if this attempt should fail
            if (attemptCount < FAILED_ATTEMPTS.length) {
                setErrorMessage(FAILED_ATTEMPTS[attemptCount]);
                setAttemptCount(attemptCount + 1);
            } else {
                // All failed attempts exhausted, show try another method
                setShowTryAnotherMethod(true);
                setErrorMessage(null);
            }
        }
    };

    const handleContinue = () => {
        nextStep();
    };

    // Show "Try another method" screen after all attempts fail
    if (showTryAnotherMethod) {
        return (
            <StepperFormBox>
                <div className="space-y-8 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                            <Icon icon="mdi:alert-circle" className="text-yellow-600" width="60" height="60" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 tracking-wider font-pixel">
                            WRONG ACCENT DETECTED
                        </h2>

                        <p className="text-sm text-gray-600 max-w-md">
                            Sorry! Your accent was not convincing, please try another method.
                        </p>

                        <Button
                            onClick={handleContinue}
                            className="win98-button bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg mt-6"
                        >
                            Try Another Method
                            <Icon icon="mdi:arrow-right" className="ml-2" width="20" height="20" />
                        </Button>
                    </div>
                </div>
            </StepperFormBox>
        );
    }

    return (
        <StepperFormBox>
            <div className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-wider font-pixel">
                        VOICE VERIFICATION
                    </h2>
                    <p className="text-sm text-gray-600">
                        For security purposes, please record yourself speaking the passphrase:
                    </p>

                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 win98-inset rounded-lg border-2 border-blue-200">
                        <p className="text-center text-3xl font-bold text-gray-900 tracking-widest">
                            "I AM SAFETY"
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {/* Recording visualization */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Pulsing circles when recording */}
                        {isRecording && (
                            <>
                                <div className="absolute w-32 h-32 rounded-full bg-red-400 opacity-20 animate-ping"></div>
                                <div className="absolute w-24 h-24 rounded-full bg-red-500 opacity-30 animate-pulse"></div>
                            </>
                        )}

                        {/* Microphone icon */}
                        <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center ${
                            isRecording ? 'bg-red-500' : 'bg-gray-400'
                        } transition-colors duration-300`}>
                            <Icon
                                icon="mdi:microphone"
                                className="text-white"
                                width="40"
                                height="40"
                            />
                        </div>
                    </div>


                    {/* Status text */}
                    <div className="text-center space-y-2">
                        {isRecording && (
                            <p className="text-sm font-medium text-red-600 animate-pulse">
                                🔴 Recording in progress... Release to stop
                            </p>
                        )}
                        {!isRecording && (
                            <p className="text-sm text-gray-500">
                                Hold down the button while speaking
                            </p>
                        )}
                    </div>

                    {/* Control buttons */}
                    <div className="flex flex-col items-center gap-4 w-full">
                        <Button
                            onPointerDown={handlePointerDown}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerLeave}
                            className={`win98-button px-8 py-6 text-lg select-none ${
                                isRecording 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                        >
                            <Icon icon="mdi:microphone" className="mr-2" width="24" height="24" />
                            {isRecording ? 'Recording...' : 'Hold to Record'}
                        </Button>

                        {/* Error message below button with fixed height */}
                        <div className="min-h-[80px] w-full max-w-md flex items-start justify-center">
                            {errorMessage && (
                                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg win98-inset w-full">
                                    <p className="text-sm font-medium text-red-700">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StepperFormBox>
    );
};
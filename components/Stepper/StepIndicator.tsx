import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
    step: number;
    currentStep: number;
    label: string;
}

const StepIndicator = ({ step, currentStep, label }: StepIndicatorProps) => {
    const isCompleted = currentStep > step || currentStep === 2;
    const isActive = currentStep === step;

    return (
        <div className="flex flex-col items-center">
            <div
                className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted ? "bg-black text-white" :
                        isActive ? "bg-black shadow-lg border-2 border-black text-white" :
                            "bg-gray-100 text-gray-400"
                )}
            >
                {isCompleted ? (
                    <Check className="w-5 h-5" />
                ) : (
                    <span className="text-sm font-medium">{step + 1}</span>
                )}
            </div>
            <span className={cn(
                "mt-2 text-sm font-medium transition-colors duration-300",
                isActive ? "text-black" :
                    isCompleted ? "text-black" :
                        "text-gray-400"
            )}>
                {label}
            </span>
        </div>
    );
};

export default StepIndicator;
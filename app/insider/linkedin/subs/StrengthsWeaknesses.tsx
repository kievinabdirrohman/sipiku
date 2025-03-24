
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

interface StrengthsWeaknessesProps {
    strengths: string[];
    weaknesses: string[];
    className?: string;
}

const StrengthsWeaknesses: React.FC<StrengthsWeaknessesProps> = React.memo(({
    strengths,
    weaknesses,
    className,
}) => {
    // Parse strengths and weaknesses into arrays, assuming they are comma-separated
    const strengthsList = useMemo(() =>
        strengths.length === 1 ?
            strengths[0].split('. ').filter(s => s.trim().length > 0) :
            strengths,
        [strengths]
    );

    const weaknessesList = useMemo(() =>
        weaknesses.length === 1 ?
            weaknesses[0].split('. ').filter(w => w.trim().length > 0) :
            weaknesses,
        [weaknesses]
    );

    return (
        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
            <div className="flex flex-col space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h3 className="font-medium text-base md:text-lg flex items-center">
                    <Check size={18} className="mr-2 text-green-500" />
                    Strengths
                </h3>
                <ul className="space-y-2">
                    {strengthsList.map((strength, index) => (
                        <li key={index} className="flex items-start">
                            <span className="bg-green-50 text-green-800 text-xs px-2 py-1 rounded-full mr-2 mt-1">
                                +
                            </span>
                            <span className="text-sm">{strength}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <h3 className="font-medium text-base md:text-lg flex items-center">
                    <AlertCircle size={18} className="mr-2 text-amber-500" />
                    Areas for Improvement
                </h3>
                <ul className="space-y-2">
                    {weaknessesList.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                            <span className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded-full mr-2 mt-1">
                                !
                            </span>
                            <span className="text-sm">{weakness}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

StrengthsWeaknesses.displayName = 'StrengthsWeaknesses';

export default StrengthsWeaknesses;
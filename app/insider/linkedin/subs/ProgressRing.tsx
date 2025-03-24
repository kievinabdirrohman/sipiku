
import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
    label?: string;
    showValue?: boolean;
    color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = React.memo(({
    value,
    max = 5,
    size = 80,
    strokeWidth = 5,
    className,
    label,
    showValue = true,
    color = 'stroke-linkedin-blue',
}) => {
    const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
    const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);
    const progress = value / max;
    const strokeDashoffset = useMemo(() =>
        circumference - progress * circumference,
        [circumference, progress]
    );

    return (
        <div className={cn('flex flex-col items-center', className)}>
            <div className="relative flex items-center justify-center">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    <circle
                        className="stroke-muted transition-all duration-300"
                        strokeWidth={strokeWidth}
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                    <circle
                        className={cn("transition-all duration-1000", color)}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx={size / 2}
                        cy={size / 2}
                    />
                </svg>
                {showValue && (
                    <div className="absolute font-medium text-foreground flex flex-col items-center justify-center">
                        <span className="text-lg">{value}</span>
                        {max !== 1 && <span className="text-xs text-muted-foreground">/{max}</span>}
                    </div>
                )}
            </div>
            {label && <span className="mt-2 text-sm text-muted-foreground">{label}</span>}
        </div>
    );
});

ProgressRing.displayName = 'ProgressRing';

export default ProgressRing;

import React from 'react';
import { cn } from '@/lib/utils';

interface AnalysisCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    elevation?: 'none' | 'low' | 'medium' | 'high';
    interactive?: boolean;
}

const AnalysisCard: React.FC<AnalysisCardProps> = React.memo(({
    title,
    children,
    className,
    elevation = 'medium',
    interactive = false,
}) => {
    const elevationClasses = {
        none: '',
        low: 'shadow-sm',
        medium: 'shadow-md',
        high: 'shadow-lg',
    };

    return (
        <div
            className={cn(
                'bg-white/80 backdrop-blur-sm rounded-xl border border-border p-5',
                elevationClasses[elevation],
                interactive && 'card-hover',
                'animate-scale-in',
                className
            )}
        >
            <h3 className="font-medium text-base md:text-lg mb-3">{title}</h3>
            <div className="text-sm text-muted-foreground">{children}</div>
        </div>
    );
});

AnalysisCard.displayName = 'AnalysisCard';

export default AnalysisCard;
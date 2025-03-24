
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
    size?: 'sm' | 'md' | 'lg';
}

const SectionHeading: React.FC<SectionHeadingProps> = React.memo(({
    title,
    subtitle,
    className,
    align = 'left',
    size = 'md',
}) => {
    const alignmentClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    const sizeClasses = {
        sm: 'text-lg md:text-xl',
        md: 'text-xl md:text-2xl',
        lg: 'text-2xl md:text-3xl',
    };

    return (
        <div className={cn('mb-6 animate-fade-in', alignmentClasses[align], className)}>
            <h2 className={cn('font-semibold tracking-tight text-black', sizeClasses[size])}>
                {title}
            </h2>
            {subtitle && (
                <p className="mt-1 text-muted-foreground text-balance">
                    {subtitle}
                </p>
            )}
        </div>
    );
});

SectionHeading.displayName = 'SectionHeading';

export default SectionHeading;
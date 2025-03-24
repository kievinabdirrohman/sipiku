
import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getActionPlanArray } from './data';
import { useLinkedinData } from './hook';
import { CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const ActionPlan: React.FC<{ className?: string }> = React.memo(({ className }) => {
    const { data: linkedinData, isLoading } = useLinkedinData();
    const [completedTasks, setCompletedTasks] = useState<number[]>([]);

    const actionPlan = useMemo(() => {
        if (!linkedinData) return [];
        return getActionPlanArray(JSON.parse(linkedinData[0].result));
    }, [linkedinData]);

    const toggleTask = useCallback((index: number) => {
        setCompletedTasks(prev =>
            prev.includes(index)
                ? prev.filter(taskIndex => taskIndex !== index)
                : [...prev, index]
        );
    }, []);

    const calculateProgress = useCallback(() => {
        if (actionPlan.length === 0) return 0;
        return Math.round((completedTasks.length / actionPlan.length) * 100);
    }, [completedTasks.length, actionPlan.length]);

    const progress = useMemo(() => calculateProgress(), [calculateProgress]);

    if (isLoading) {
        return <ActionPlanSkeleton className={className} />;
    }

    if (!linkedinData || actionPlan.length === 0) {
        return null;
    }

    return (
        <div className={cn('rounded-2xl bg-white/90 backdrop-blur-sm border border-border p-6 shadow-soft animate-fade-in', className)}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold tracking-tight text-black text-xl">
                    7-Day Action Plan
                </h2>
                <div className="flex items-center">
                    <div className="bg-muted h-2 w-24 rounded-full overflow-hidden">
                        <div
                            className="bg-black h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="ml-2 text-sm font-medium">{progress}%</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
                Follow this step-by-step plan to improve your LinkedIn profile over the next week.
            </p>

            <Separator className="mb-6" />

            <ul className="space-y-4">
                {actionPlan.map((item, index) => {
                    const isCompleted = completedTasks.includes(index);

                    return (
                        <li
                            key={index}
                            className={cn(
                                'flex items-start p-3 rounded-lg transition-all duration-300 animate-fade-in',
                                isCompleted ? 'bg-linkedin-light' : 'hover:bg-secondary',
                                'cursor-pointer'
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={() => toggleTask(index)}
                        >
                            <div className="mr-3 mt-0.5">
                                <CheckCircle2
                                    className={cn(
                                        'w-5 h-5 transition-colors duration-300',
                                        isCompleted ? 'text-linkedin-blue' : 'text-muted-foreground/40'
                                    )}
                                />
                            </div>
                            <div>
                                <h4 className={cn(
                                    'font-medium text-sm transition-colors duration-300',
                                    isCompleted && 'text-linkedin-blue'
                                )}>
                                    {item.day}
                                </h4>
                                <p className={cn(
                                    'text-sm transition-colors duration-300',
                                    isCompleted ? 'text-linkedin-dark/80' : 'text-muted-foreground'
                                )}>
                                    {item.task}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
});

const ActionPlanSkeleton = ({ className }: { className?: string }) => (
    <div className={cn('rounded-2xl bg-white/90 backdrop-blur-sm border border-border p-6 shadow-soft', className)}>
        <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-28" />
        </div>

        <Skeleton className="h-4 w-full mb-6" />

        <Separator className="mb-6" />

        <ul className="space-y-4">
            {[...Array(7)].map((_, index) => (
                <li key={index} className="flex items-start p-3">
                    <Skeleton className="h-5 w-5 mr-3 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

ActionPlan.displayName = 'ActionPlan';

export default ActionPlan;

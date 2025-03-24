
import React, { useMemo } from 'react';
import { getEvaluationScores } from './data';
import { useLinkedinData } from './hook';
import SectionHeading from './SectionHeading';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';
import ProgressRing from './ProgressRing';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileOverview: React.FC = React.memo(() => {
    const { data: linkedinData, isLoading, error } = useLinkedinData();

    const result = JSON.parse(linkedinData![0].result);

    const scores = useMemo(() => {
        if (!linkedinData) return null;
        return getEvaluationScores(result);
    }, [linkedinData]);

    if (isLoading) {
        return <ProfileOverviewSkeleton />;
    }

    if (error || !linkedinData) {
        return (
            <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border p-6 shadow-soft animate-fade-in">
                <SectionHeading
                    title="Profile Analysis Overview"
                    subtitle="Unable to load profile data"
                />
                <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="text-red-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 text-sm">
                        There was a problem loading your LinkedIn profile data. Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border p-6 shadow-soft animate-fade-in">
            <SectionHeading
                title="Profile Analysis Overview"
                subtitle="Current state of your LinkedIn profile and key improvement areas"
            />

            <p className="text-foreground/90 mb-6 text-balance">
                {result.overallSummary.overallRecommendation}
            </p>

            {result.warnings && (
                <div className="p-4 bg-amber-50 rounded-lg mb-6 flex items-start gap-3 animate-fade-in">
                    <AlertTriangle className="text-amber-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 text-sm">{result.warnings}</p>
                </div>
            )}

            <Separator className="my-6" />

            {scores && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 justify-items-center mb-6">
                    <ProgressRing
                        value={scores.title.attractiveness}
                        max={5}
                        label="Title Attract."
                        color="stroke-blue-500"
                    />
                    <ProgressRing
                        value={scores.title.informativeness}
                        max={5}
                        label="Title Info"
                        color="stroke-indigo-500"
                    />
                    <ProgressRing
                        value={scores.title.seoOptimization}
                        max={5}
                        label="SEO"
                        color="stroke-purple-500"
                    />
                    <ProgressRing
                        value={scores.summary.engagement}
                        max={5}
                        label="Engagement"
                        color="stroke-sky-500"
                    />
                    <ProgressRing
                        value={scores.summary.readability}
                        max={5}
                        label="Readability"
                        color="stroke-cyan-500"
                    />
                </div>
            )}

            <Separator className="my-6" />

            <div className="mt-6">
                <h3 className="font-medium mb-3">Target Goal Recommendation</h3>
                <p className="text-sm text-muted-foreground">
                    {result.overallRecommendationForTargetGoal}
                </p>
            </div>
        </div>
    );
});

const ProfileOverviewSkeleton = () => (
    <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-border p-6 shadow-soft">
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-full mb-6" />

        <Skeleton className="h-20 w-full mb-6" />

        <Separator className="my-6" />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 justify-items-center mb-6">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-24 rounded-full" />
            ))}
        </div>

        <Separator className="my-6" />

        <Skeleton className="h-6 w-1/3 mb-3" />
        <Skeleton className="h-20 w-full" />
    </div>
);

ProfileOverview.displayName = 'ProfileOverview';

export default ProfileOverview;
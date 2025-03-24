
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ProfileOverview from './ProfileOverview';
import AnalysisCard from './AnalysisCard';
import ActionPlan from './ActionPlan';
import StrengthsWeaknesses from './StrengthsWeaknesses';
import SectionHeading from './SectionHeading';
import { getKeywordsList, getActionPlanArray } from './data';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MessageSquare,
    Users,
    Star,
    Search,
    Briefcase,
    Image,
    Lightbulb,
    UserPlus,
    BarChart,
    CheckCircle,
    Heart,
    Link as LinkIcon,
} from 'lucide-react';
import { useLinkedinData } from './hook';
import { Skeleton } from '@/components/ui/skeleton';

// Memoize the components that don't change often
const MemoizedHeaderSection = React.memo(() => (
    <header className="w-full bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-border shadow-sm">
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                        Li
                    </div>
                    <h1 className="text-xl font-semibold">LinkedIn Profile Analyzer</h1>
                </div>
            </div>
        </div>
    </header>
));

MemoizedHeaderSection.displayName = 'MemoizedHeaderSection';

const MemoizedFooterSection = React.memo(() => (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-border mt-16">
        <div className="container max-w-7xl mx-auto px-4 py-8 sm:px-6">
            <div className="text-center text-sm text-muted-foreground">
                <p>LinkedIn Profile Analyzer - Designed to help you improve your professional presence</p>
            </div>
        </div>
    </footer>
));

MemoizedFooterSection.displayName = 'MemoizedFooterSection';

// Loading skeleton component for tab content
const TabContentSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64 w-full" />
    </div>
);

// Memoize individual tab contents to prevent unnecessary re-renders
const OverviewTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    const result = JSON.parse(data![0].result);

    const strengths = useMemo(() => [result.overallSummary.strengths], [data]);
    const weaknesses = useMemo(() => [result.overallSummary.weaknesses], [data]);
    const keywords = useMemo(() => getKeywordsList(result), [data]);

    return (
        <TabsContent value="overview" className="mt-0 space-y-8">
            <ProfileOverview />

            <div className="mt-8">
                <SectionHeading
                    title="Profile Strengths & Weaknesses"
                    subtitle="Analysis of what's working well and what needs improvement"
                />
                <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} />
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionPlan />

                <div className="space-y-6">
                    <AnalysisCard
                        title="Top Keywords for Your Industry"
                        className="h-auto"
                    >
                        <div className="flex flex-wrap gap-2 mt-2">
                            {keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-black"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </AnalysisCard>

                    <AnalysisCard
                        title="Recommended Title Improvements"
                        className="h-auto"
                    >
                        <p>{result.recruiterAppeal.titleEvaluation.recommendations}</p>
                    </AnalysisCard>
                </div>
            </div>
        </TabsContent>
    );
});

OverviewTabContent.displayName = 'OverviewTabContent';

const RecruiterTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    const result = JSON.parse(data![0].result);

    return (
        <TabsContent value="recruiter" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <SectionHeading
                    title="Recruiter Appeal"
                    subtitle="How your profile appears to recruiters and hiring managers"
                />
            </div>

            <AnalysisCard title="Experience Quantification" elevation="low" interactive>
                <div className="flex">
                    <Briefcase className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.recruiterAppeal.experienceQuantification}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Grammar & Professionalism" elevation="low" interactive>
                <div className="flex">
                    <CheckCircle className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.recruiterAppeal.grammarAndProfessionalism}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Keyword Usage" elevation="low" interactive>
                <div className="flex">
                    <Search className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.recruiterAppeal.keywordAnalysis.keywordUsage}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Keyword Recommendations" elevation="low" interactive>
                <div className="flex">
                    <Lightbulb className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.recruiterAppeal.keywordAnalysis.keywordRecommendations}</p>
                </div>
            </AnalysisCard>

            <div className="lg:col-span-2">
                <AnalysisCard title="Summary Evaluation & Recommendations" elevation="low" interactive>
                    <div className="flex">
                        <Star className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <p className="mb-2">{result.recruiterAppeal.summaryEvaluation.valueProposition}</p>
                            <p>{result.recruiterAppeal.summaryEvaluation.recommendations}</p>
                        </div>
                    </div>
                </AnalysisCard>
            </div>
        </TabsContent>
    );
});

RecruiterTabContent.displayName = 'RecruiterTabContent';

const BrandingTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    const result = JSON.parse(data![0].result);

    return (
        <TabsContent value="branding" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <SectionHeading
                    title="Personal Branding"
                    subtitle="How to establish and maintain a strong professional brand"
                />
            </div>

            <AnalysisCard title="Brand Consistency" elevation="low" interactive>
                <div className="flex">
                    <BarChart className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.personalBranding.brandConsistency}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Profile Picture Evaluation" elevation="low" interactive>
                <div className="flex">
                    <Image className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.personalBranding.profilePictureEvaluation}</p>
                </div>
            </AnalysisCard>

            <div className="lg:col-span-2">
                <AnalysisCard title="Content Strategy" elevation="low" interactive>
                    <div className="flex">
                        <Lightbulb className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                        <p>{result.personalBranding.contentStrategy}</p>
                    </div>
                </AnalysisCard>
            </div>

            <div className="lg:col-span-2">
                <AnalysisCard title="Engagement Tips" elevation="low" interactive>
                    <div className="flex">
                        <Heart className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                        <p>{result.personalBranding.engagementTips}</p>
                    </div>
                </AnalysisCard>
            </div>
        </TabsContent>
    );
});

BrandingTabContent.displayName = 'BrandingTabContent';

const NetworkingTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    const result = JSON.parse(data![0].result);

    return (
        <TabsContent value="networking" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <SectionHeading
                    title="Networking & Connections"
                    subtitle="How to build and maintain a valuable professional network"
                />
            </div>

            <AnalysisCard title="Outreach Message Tips" elevation="low" interactive>
                <div className="flex">
                    <MessageSquare className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.networkingAndConnections.outreachMessageTips}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Relationship Building" elevation="low" interactive>
                <div className="flex">
                    <UserPlus className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.networkingAndConnections.relationshipBuilding}</p>
                </div>
            </AnalysisCard>

            <div className="lg:col-span-2">
                <AnalysisCard title="Finding Relevant Connections" elevation="low" interactive>
                    <div className="flex">
                        <Users className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                        <p>{result.networkingAndConnections.relevantConnections}</p>
                    </div>
                </AnalysisCard>
            </div>
        </TabsContent>
    );
});

NetworkingTabContent.displayName = 'NetworkingTabContent';

const VisibilityTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    const result = JSON.parse(data![0].result);

    return (
        <TabsContent value="visibility" className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <SectionHeading
                    title="Search Visibility"
                    subtitle="How to make your profile more discoverable to recruiters and connections"
                />
            </div>

            <AnalysisCard title="LinkedIn SEO Optimization" elevation="low" interactive>
                <div className="flex">
                    <Search className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.searchVisibility.seoLinkedIn}</p>
                </div>
            </AnalysisCard>

            <AnalysisCard title="Skills Optimization" elevation="low" interactive>
                <div className="flex">
                    <Star className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                    <p>{result.searchVisibility.skillsOptimization}</p>
                </div>
            </AnalysisCard>

            <div className="lg:col-span-2">
                <AnalysisCard title="Recommendation Strategy" elevation="low" interactive>
                    <div className="flex">
                        <LinkIcon className="w-5 h-5 text-blue-bg-black mr-3 mt-1 flex-shrink-0" />
                        <p>{result.searchVisibility.recommendationStrategy}</p>
                    </div>
                </AnalysisCard>
            </div>
        </TabsContent>
    );
});

VisibilityTabContent.displayName = 'VisibilityTabContent';

const ActionTabContent = React.memo(() => {
    const { data, isLoading, error } = useLinkedinData();

    if (isLoading) return <TabContentSkeleton />;
    if (error || !data) return <div className="p-4 text-red-500">Failed to load LinkedIn profile data</div>;

    return (
        <TabsContent value="action" className="mt-0">
            <SectionHeading
                title="7-Day Action Plan"
                subtitle="Follow this step-by-step plan to transform your LinkedIn profile"
                align="left"
                size="lg"
            />
            <div className="max-w-full mx-auto">
                <ActionPlan className="mt-6" />
            </div>
        </TabsContent>
    );
});

ActionTabContent.displayName = 'ActionTabContent';

// Create a Memoized TabsList Component
const TabsListSection = React.memo(({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (value: string) => void }) => (
    <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm border border-border h-12 md:flex md:justify-around">
            <TabsTrigger
                value="overview"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("overview")}
            >
                Overview
            </TabsTrigger>
            <TabsTrigger
                value="recruiter"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("recruiter")}
            >
                Recruiter Appeal
            </TabsTrigger>
            <TabsTrigger
                value="branding"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("branding")}
            >
                Personal Branding
            </TabsTrigger>
            <TabsTrigger
                value="networking"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("networking")}
            >
                Networking
            </TabsTrigger>
            <TabsTrigger
                value="visibility"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("visibility")}
            >
                Visibility
            </TabsTrigger>
            <TabsTrigger
                value="action"
                className="h-10 data-[state=active]:bg-black data-[state=active]:text-white w-full"
                onClick={() => setActiveTab("action")}
            >
                Action Plan
            </TabsTrigger>
        </TabsList>
    </div>
));

TabsListSection.displayName = 'TabsListSection';

// Main Index Component with optimizations
const Analysis = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoaded, setIsLoaded] = useState(false);
    const { isLoading } = useLinkedinData();

    // Memoize tab change handler
    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
    }, []);

    useEffect(() => {
        // Simulate loading delay for animation purposes
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`min-h-screen bg-background transition-opacity duration-700 ${isLoaded && !isLoading ? 'opacity-100' : 'opacity-0'}`}>
            <main className="container max-w-sm md:max-w-full mx-auto px-4 py-8 sm:px-6">
                <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
                    <TabsListSection activeTab={activeTab} setActiveTab={setActiveTab} />

                    {/* Use suspense boundaries for tab content */}
                    {activeTab === "overview" && <OverviewTabContent />}
                    {activeTab === "recruiter" && <RecruiterTabContent />}
                    {activeTab === "branding" && <BrandingTabContent />}
                    {activeTab === "networking" && <NetworkingTabContent />}
                    {activeTab === "visibility" && <VisibilityTabContent />}
                    {activeTab === "action" && <ActionTabContent />}
                </Tabs>
            </main>
        </div>
    );
};

export default Analysis;
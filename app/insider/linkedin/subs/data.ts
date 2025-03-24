
export interface LinkedInAnalysis {
    error: string;
    networkingAndConnections: {
        outreachMessageTips: string;
        relationshipBuilding: string;
        relevantConnections: string;
    };
    overallRecommendationForTargetGoal: string;
    overallSummary: {
        overallRecommendation: string;
        strengths: string;
        weaknesses: string;
    };
    personalBranding: {
        brandConsistency: string;
        contentStrategy: string;
        engagementTips: string;
        profilePictureEvaluation: string;
    };
    recruiterAppeal: {
        experienceQuantification: string;
        grammarAndProfessionalism: string;
        keywordAnalysis: {
            keywordRecommendations: string;
            keywordUsage: string;
            relevantKeywords: string;
        };
        summaryEvaluation: {
            engagement: string;
            readability: string;
            recommendations: string;
            valueProposition: string;
        };
        titleEvaluation: {
            attractiveness: string;
            informativeness: string;
            recommendations: string;
            seoOptimization: string;
        };
    };
    searchVisibility: {
        recommendationStrategy: string;
        seoLinkedIn: string;
        skillsOptimization: string;
    };
    stepByStepActionPlan: {
        day1: string;
        day2: string;
        day3: string;
        day4: string;
        day5: string;
        day6: string;
        day7: string;
    };
    warnings: string;
}

// Helper functions that work with the data structure
export const getKeywordsList = (data: LinkedInAnalysis) =>
    data.recruiterAppeal.keywordAnalysis.relevantKeywords.split(", ");

export const getActionPlanArray = (data: LinkedInAnalysis) => {
    const plan = data.stepByStepActionPlan;
    return [
        { day: "Day 1", task: plan.day1 },
        { day: "Day 2", task: plan.day2 },
        { day: "Day 3", task: plan.day3 },
        { day: "Day 4", task: plan.day4 },
        { day: "Day 5", task: plan.day5 },
        { day: "Day 6", task: plan.day6 },
        { day: "Day 7", task: plan.day7 },
    ];
};

export const getEvaluationScores = (data: LinkedInAnalysis) => {
    const { titleEvaluation, summaryEvaluation } = data.recruiterAppeal;

    return {
        title: {
            attractiveness: parseInt(titleEvaluation.attractiveness),
            informativeness: parseInt(titleEvaluation.informativeness),
            seoOptimization: parseInt(titleEvaluation.seoOptimization),
        },
        summary: {
            engagement: parseInt(summaryEvaluation.engagement),
            readability: parseInt(summaryEvaluation.readability),
        }
    };
};
"use client"

import Resume from "@/components/pages/resume";
import DetailedAnalysis from "@/components/Result/Analysis/DetailedAnalysis";
import ExperienceAnalysis from "@/components/Result/Analysis/ExperienceAnalysis";
import Recommendations from "@/components/Result/Analysis/Recommendations";
import ScoringBreakdown from "@/components/Result/Analysis/ScoringBreakdown";
import SkillAnalysis from "@/components/Result/Analysis/SkillAnalysis";
import TopSection from "@/components/Result/Analysis/TopSection";
import { HRDQuestions } from "@/components/Result/Interview/HRDQuestions";
import { RedFlags } from "@/components/Result/Interview/RedFlags";
import { TabNavigation } from "@/components/Result/Interview/TabNavigation";
import { TechnicalQuestions } from "@/components/Result/Interview/TechnicalQuestions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/helper";
import { createClient } from "@/utils/supabase/client";
import { Separator } from "@radix-ui/react-separator";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { InfoIcon, Download, ArrowBigLeft } from "lucide-react";
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";

export default function ResultCandidate() {
    const supabase = createClient();

    const { data } = useQuery({
        queryKey: ['candidateHistory'],
        queryFn: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('job_analysis')
                .select('role, result')
                .eq('email', user)
                .eq('role', 'candidate');

            return data
        }
    })

    const [updatedCV, setUpdatedCV] = useState<any>();
    const [analysis, setAnalysis] = useState<any>();
    const [interview, setInterview] = useState<any>();
    const [activeTab, setActiveTab] = useState("hrd")

    const router = useRouter()

    const renderContent = () => {
        switch (activeTab) {
            case "hrd":
                return <HRDQuestions data={interview.hrd_interview_questions ?? []} />
            case "technical":
                return <TechnicalQuestions data={interview.technical_interview_questions ?? []} />
            case "redFlags":
                return <RedFlags data={interview.potential_red_flags ?? []} />
            default:
                return null
        }
    }

    useEffect(() => {
        if (data) {
            const result = JSON.parse(data[0].result);
            setAnalysis(JSON.parse(result.candidate));
            setUpdatedCV(JSON.parse(result.revision));
            setInterview(JSON.parse(result.interview));
        }
    }, [data])

    return (
        <>
            {analysis && <div className="p-4">
                <h1 className="text-xl md:text-3xl font-bold mb-12 underline decoration-double">CV Analysis</h1>
                <div className="grid gap-8 md:grid-cols-2">
                    <TopSection data={analysis.assessment_summary} />
                    <ScoringBreakdown data={analysis.scoring_breakdown} />
                </div>
                <DetailedAnalysis data={analysis.detailed_analysis} />
                <SkillAnalysis data={analysis.skill_analysis} />
                <ExperienceAnalysis data={analysis.experience_analysis} />
                <Recommendations recommendation={analysis.recommendations} warning={analysis.warnings} error={analysis.error} />
                <Separator className="my-10" />
                <h1 className="text-xl md:text-3xl font-bold mb-12 underline decoration-double">Mock Interview</h1>
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <div className="mt-8">{renderContent()}</div>
                <Separator className="my-10" />
                <h1 className="text-xl md:text-3xl font-bold mt-12 mb-8 underline decoration-double">Download the revised CV</h1>
                <p className="text-base font-medium mb-4">Your CV has been optimized by AI to highlight your skills and experience. Download now to see the improvements.</p>
                <Alert variant="warning" className="flex-col items-start mb-8">
                    <div className="flex items-center gap-x-2 mb-2">
                        <InfoIcon className="h-4 w-4" />
                        <AlertDescription>
                            Please Review Carefully: The recommendations and improvements provided by AI need to be carefully reviewed by you before use. AI can make mistakes or misinterpret information in your CV.
                        </AlertDescription>
                    </div>
                </Alert>
                <PDFDownloadLink className="px-8 bg-black text-white py-2 rounded-md flex flex-row w-fit" document={<Resume data={updatedCV ?? []} />} fileName="cv_yourname_position.pdf">
                    <Download />
                    <span className="ml-2">Download CV</span>
                </PDFDownloadLink>
                <Button variant='outline' className="text-sm mt-10" onClick={() => router.push('/insider')}><ArrowBigLeft /> Back</Button>
            </div>}
        </>
    )
}
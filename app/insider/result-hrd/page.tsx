"use client"

import Resume from "@/components/pages/resume";
import DetailedAnalysis from "@/components/Result/Analysis/DetailedAnalysis";
import ExperienceAnalysis from "@/components/Result/Analysis/ExperienceAnalysis";
import Recommendations from "@/components/Result/Analysis/Recommendations";
import ScoringBreakdown from "@/components/Result/Analysis/ScoringBreakdown";
import SkillAnalysis from "@/components/Result/Analysis/SkillAnalysis";
import TopSection from "@/components/Result/Analysis/TopSection";
import { CandidateSummary } from "@/components/Result/HR/candidate-summary";
import { CultureFitAssessment } from "@/components/Result/HR/culture-fit-assessment";
import { EducationMatch } from "@/components/Result/HR/education-match";
import { ExperienceMatch } from "@/components/Result/HR/experience-match";
import { NotesForRecruiter } from "@/components/Result/HR/notes-for-recruiter";
import { SkillMatch } from "@/components/Result/HR/skill-match";
import { Warnings } from "@/components/Result/HR/warnings";
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

export default function ResultHRD() {
    const supabase = createClient();

    const { data } = useQuery({
        queryKey: ['hrdHistory'],
        queryFn: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('job_analysis')
                .select('role, result')
                .eq('email', user)
                .eq('role', 'hrd');

            return data
        }
    })
    const [dataHR, setDataHR] = useState<any>();

    const router = useRouter()

    useEffect(() => {
        if (data) {
            const result = JSON.parse(data[0].result);
            setDataHR(JSON.parse(result));
        }
    }, [data])

    return (
        <>
            {dataHR && <div className="container mx-auto px-4 py-8 space-y-8">
                <CandidateSummary data={dataHR.candidate_summary} />
                <ScoringBreakdown data={dataHR.scoring_breakdown} />
                <SkillMatch data={dataHR.skill_match} />
                <ExperienceMatch data={dataHR.experience_match} />
                <EducationMatch data={dataHR.education_match} />
                <CultureFitAssessment data={dataHR.culture_fit_assessment} />
                <RedFlags data={dataHR.red_flags} />
                <NotesForRecruiter notes={dataHR.notes_for_recruiter} />
                <Warnings warnings={dataHR.warnings} />
                <Button variant='outline' className="text-sm mt-16" onClick={() => router.push('/insider')}><ArrowBigLeft /> Back</Button>
            </div>}
        </>
    )
}
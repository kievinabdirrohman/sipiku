import { CandidateSummary } from "./candidate-summary"
import { ScoringBreakdown } from "./scoring-breakdown"
import { SkillMatch } from "./skill-match"
import { ExperienceMatch } from "./experience-match"
import { EducationMatch } from "./education-match"
import { CultureFitAssessment } from "./culture-fit-assessment"
import { RedFlags } from "./red-flags"
import { NotesForRecruiter } from "./notes-for-recruiter"
import { Warnings } from "./warnings"

export function CandidateAssessment(candidateData: any) {

    return (
        <div className="space-y-8">
            <CandidateSummary data={candidateData.candidate_summary} />
            <ScoringBreakdown data={candidateData.scoring_breakdown} />
            <SkillMatch data={candidateData.skill_match} />
            <ExperienceMatch data={candidateData.experience_match} />
            <EducationMatch data={candidateData.education_match} />
            <CultureFitAssessment data={candidateData.culture_fit_assessment} />
            <RedFlags data={candidateData.red_flags} />
            <NotesForRecruiter notes={candidateData.notes_for_recruiter} />
            <Warnings warnings={candidateData.warnings} error={candidateData.error} />
        </div>
    )
}


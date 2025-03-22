import { z } from 'zod';

import { isValidJobPosterMimeType } from './helper';
import { SchemaType } from '@google/generative-ai';

export const jobPosterSchema = z.object({
    job_poster: z
        .instanceof(File)
        .refine((file) => isValidJobPosterMimeType(file.type))
        .refine((file) => file.size <= 1 * 1024 * 1024),
});

export const textSchema = z.object({
    job_text: z.string().min(100)
});

export const cvSchema = z.object({
    recaptcha_token: z.string(),
    role: z.enum(["candidate", "hrd"], {
        required_error: "Role is required",
    }),
    file: z
        .instanceof(File, { message: "You must select a file" })
        .refine((file) => file.type === "application/pdf", {
            message: "File must be a PDF",
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "File size must be a maximum of 1 MB",
        }),
});

export const jobSchema = z.object({
    recaptcha_token: z.string(),
    role: z.enum(["candidate", "hrd"], {
        required_error: "Role is required",
    }),
    cv: z.string().min(100, {
        message: "CV must be at least 100 characters long",
    }),
    job_type: z.enum(["file", "text"], {
        required_error: "Job type is required",
    }),
});

export const candidateSchema = z.object({
    recaptcha_token: z.string(),
    role: z.enum(["candidate", "hrd"]),
    cv: z.string().min(100),
    job_type: z.enum(["file", "text"]),
    job_poster: z.string().min(100),
});

export const linkedinAccountSchema = z.object({
    recaptcha_token: z.string(),
    email: z.string().email({
        message: "Invalid email address",
    }),
    password: z.string().min(3, {
        message: "Password must be at least 3 characters long",
    }),
});

export const photoSchema = z.object({
    file: z
        .instanceof(File, { message: "You must select a file" })
        .refine((file) => file.type === "application/pdf", {
            message: "File must be a PDF",
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "File size must be a maximum of 1 MB",
        }),
    photo: z.instanceof(File).refine((file) => file.size <= 1000000, "Max image size is 1MB").refine(
        (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
        "Only .jpg, .png, .webp formats are supported"
    ),
    recaptcha_token: z.string(),
    gender: z.enum(['male', 'female'], { required_error: "Gender is required" }),
    ethnicity: z.enum(['asian', 'african', 'european', 'american', 'middle_eastern', 'pacific_islander'], { required_error: "Ethnicity is required" }),
});

export const schemaResult = {
    description: "Assessment result schema for Gemini API",
    type: SchemaType.OBJECT,
    properties: {
        "overall_match_percentage": {
            type: SchemaType.STRING, //Should be integer but changed to String based on the design requested by user
            description: "[Overall Match Percentage (integer, 0-100, representing how well the CV aligns with the requirements)]",
            nullable: false,
        },
        "assessment_summary": {
            type: SchemaType.OBJECT,
            description: "Summary of the assessment.",
            properties: {
                "overall_match_percentage": {
                    type: SchemaType.STRING,
                    description: "[Overall Match Percentage (e.g., 75%)]",
                    nullable: false,
                },
                "summary": {
                    type: SchemaType.STRING,
                    description: "[A brief summary of the candidate's overall fit for the role (1-2 sentences)]",
                    nullable: false,
                },
                "key_strengths": {
                    type: SchemaType.STRING,
                    description: "[A list of the candidate's key strengths based on the CV and job description]",
                    nullable: false,
                },
                "areas_for_improvement": {
                    type: SchemaType.STRING,
                    description: "[A list of areas where the candidate could improve their CV or application]",
                    nullable: false,
                },
            },
            required: ["overall_match_percentage", "summary", "key_strengths", "areas_for_improvement"],
        },
        "scoring_breakdown": {
            type: SchemaType.OBJECT,
            description: "Breakdown of the scoring based on different requirement categories.",
            properties: {
                "essential_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring details for essential requirements.",
                    properties: {
                        "score": {
                            type: SchemaType.STRING, //Should be integer but changed to String based on the design requested by user
                            description: "[Score achieved by candidate on essential requirements (integer, 0-100)]",
                            nullable: false,
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "[Specific explanation of how the score for essential requirements was calculated, referencing content from the CV and job description]",
                            nullable: false,
                        },
                    },
                    required: ["score", "details"],
                },
                "desirable_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring details for desirable requirements.",
                    properties: {
                        "score": {
                            type: SchemaType.STRING, //Should be integer but changed to String based on the design requested by user
                            description: "[Score achieved by candidate on desirable requirements (integer, 0-100)]",
                            nullable: false,
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "[Specific explanation of how the score for desirable requirements was calculated, referencing content from the CV and job description]",
                            nullable: false,
                        },
                    },
                    required: ["score", "details"],
                },
                "nice_to_have_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring details for nice-to-have requirements.",
                    properties: {
                        "score": {
                            type: SchemaType.STRING, //Should be integer but changed to String based on the design requested by user
                            description: "[Score achieved by candidate on nice-to-have requirements (integer, 0-100)]",
                            nullable: false,
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "[Specific explanation of how the score for nice-to-have requirements was calculated, referencing content from the CV and job description]",
                            nullable: false,
                        },
                    },
                    required: ["score", "details"],
                },
            },
            required: ["essential_requirements", "desirable_requirements", "nice_to_have_requirements"],
        },
        "detailed_analysis": {
            type: SchemaType.OBJECT,
            description: "Detailed analysis of various aspects of the candidate's profile.",
            properties: {
                "education": {
                    type: SchemaType.OBJECT,
                    description: "Analysis of the candidate's education.",
                    properties: {
                        "suitable": {
                            type: SchemaType.STRING,
                            description: "[Does the education meet the requirements? (Yes/No)]",
                            nullable: false,
                        },
                        "detail": {
                            type: SchemaType.STRING,
                            description: "[Further explanation of the education suitability, referencing specific degrees, institutions, or relevant coursework]",
                            nullable: false,
                        },
                    },
                    required: ["suitable", "detail"],
                },
                "work_experience": {
                    type: SchemaType.OBJECT,
                    description: "Analysis of the candidate's work experience.",
                    properties: {
                        "suitable": {
                            type: SchemaType.STRING,
                            description: "[Does the work experience meet the requirements? (Yes/No)]",
                            nullable: false,
                        },
                        "detail": {
                            type: SchemaType.STRING,
                            description: "[Further explanation of the work experience suitability. Mention relevant and less relevant experience, referencing specific roles and responsibilities from the CV]",
                            nullable: false,
                        },
                    },
                    required: ["suitable", "detail"],
                },
                "skills": {
                    type: SchemaType.OBJECT,
                    description: "Analysis of the candidate's skills.",
                    properties: {
                        "suitable": {
                            type: SchemaType.STRING,
                            description: "[Do the skills meet the requirements? (Yes/No)]",
                            nullable: false,
                        },
                        "detail": {
                            type: SchemaType.STRING,
                            description: "[Further explanation of the skills suitability. Mention matching skills and skills that need improvement, referencing specific skills listed in the CV and required in the job description]",
                            nullable: false,
                        },
                    },
                    required: ["suitable", "detail"],
                },
                "other_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Analysis of other requirements.",
                    properties: {
                        "suitable": {
                            type: SchemaType.STRING,
                            description: "[Do other requirements (e.g., certifications, languages) meet the requirements? (Yes/No)]",
                            nullable: false,
                        },
                        "detail": {
                            type: SchemaType.STRING,
                            description: "[Further explanation of the suitability of other requirements, referencing specific certifications, languages, or other qualifications]",
                            nullable: false,
                        },
                    },
                    required: ["suitable", "detail"],
                },
            },
            required: ["education", "work_experience", "skills", "other_requirements"],
        },
        "skill_analysis": {
            type: SchemaType.OBJECT,
            description: "Analysis of the candidate's skills compared to the requirements.",
            properties: {
                "matching_skills": {
                    type: SchemaType.ARRAY,
                    description: "List of skills that match the requirements.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "skill": {
                                type: SchemaType.STRING,
                                description: "[Skill name from Job Description]",
                                nullable: false,
                            },
                            "evidence_in_cv": {
                                type: SchemaType.STRING,
                                description: "[Specific example from the CV that demonstrates this skill (quote)]",
                                nullable: false,
                            },
                            "recommendation": {
                                type: SchemaType.STRING,
                                description: "[If applicable: Recommendation to further highlight this skill]",
                                nullable: true,
                            },
                        },
                        required: ["skill", "evidence_in_cv"],
                    },
                    nullable: false,
                },
                "missing_skills": {
                    type: SchemaType.ARRAY,
                    description: "List of skills that are missing.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "skill": {
                                type: SchemaType.STRING,
                                description: "[Skill name from Job Description]",
                                nullable: false,
                            },
                            "reason": {
                                type: SchemaType.STRING,
                                description: "[Explanation of why the skill is considered missing (e.g., not mentioned, insufficient experience)]",
                                nullable: false,
                            },
                            "recommendation": {
                                type: SchemaType.STRING,
                                description: "[Actionable suggestion for how the candidate could acquire or demonstrate this skill]",
                                nullable: false,
                            },
                        },
                        required: ["skill", "reason", "recommendation"],
                    },
                    nullable: false,
                },
            },
            required: ["matching_skills", "missing_skills"],
        },
        "experience_analysis": {
            type: SchemaType.OBJECT,
            description: "Analysis of the candidate's experience.",
            properties: {
                "relevant_experience": {
                    type: SchemaType.ARRAY,
                    description: "List of relevant experience.",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "company": {
                                type: SchemaType.STRING,
                                description: "[Company Name from CV]",
                                nullable: false,
                            },
                            "role": {
                                type: SchemaType.STRING,
                                description: "[Role Title from CV]",
                                nullable: false,
                            },
                            "relevance": {
                                type: SchemaType.STRING,
                                description: "[Explanation of how this experience is relevant to the target job, referencing specific responsibilities]",
                                nullable: false,
                            },
                            "recommendation": {
                                type: SchemaType.STRING,
                                description: "[If applicable: Recommendation to better highlight this experience in the CV]",
                                nullable: true,
                            },
                        },
                        required: ["company", "role", "relevance"],
                    },
                    nullable: false,
                },
                "less_relevant_experience": {
                    type: SchemaType.STRING,
                    description: "[Summary of experience that is less relevant to the target job and suggestions for how to minimize its emphasis (if necessary)]",
                    nullable: false,
                },
            },
            required: ["relevant_experience", "less_relevant_experience"],
        },
        "recommendations": {
            type: SchemaType.STRING,
            description: "[Concrete suggestions for improving the CV to better match the job opening. Example: Add details about SEO experience, Google Analytics certification, etc.]",
            nullable: false,
        },
        "warnings": {
            type: SchemaType.STRING,
            description: "[Warning messages if there is unclear or incomplete information in the CV]",
            nullable: false,
        },
        "error": {
            type: SchemaType.STRING,
            description: "[If an error occurred during processing (e.g., invalid input, unparsable document), a brief description of the error.  Otherwise, this field MUST be empty.]",
            nullable: false,
        },
    },
    required: [
        "overall_match_percentage",
        "assessment_summary",
        "scoring_breakdown",
        "detailed_analysis",
        "skill_analysis",
        "experience_analysis",
        "recommendations",
        "warnings",
        "error",
    ],
};

export const schemaCandidate = {
    description: "CV data schema for Gemini API",
    type: SchemaType.OBJECT,
    properties: {
        "personal_information": {
            type: SchemaType.OBJECT,
            description: "Personal information of the candidate.",
            properties: {
                "full_name": {
                    type: SchemaType.STRING,
                    description: "[Your Full Name]",
                    nullable: false,
                },
                "phone_number": {
                    type: SchemaType.STRING,
                    description: "[Your Phone Number]",
                    nullable: false,
                },
                "email_address": {
                    type: SchemaType.STRING,
                    description: "[Your Email Address]",
                    nullable: false,
                },
                "linkedin_profile": {
                    type: SchemaType.STRING,
                    description: "[Your LinkedIn Profile URL (create one if it doesn't exist, targeting the job poster's industry)]",
                    nullable: false,
                },
                "address": {
                    type: SchemaType.STRING,
                    description: "[Your Full Address (create one if it doesn't exist, reflecting a location relevant to the target job)]",
                    nullable: false,
                },
                "website": {
                    type: SchemaType.STRING,
                    description: "[Your Personal Website URL (create one if it doesn't exist, showcasing relevant skills)]",
                    nullable: false,
                },
            },
            required: ["full_name", "phone_number", "email_address", "linkedin_profile", "address", "website"],
        },
        "professional_summary": {
            type: SchemaType.STRING,
            description: "[A brief professional summary (4-5 sentences) highlighting experience, skills, and career goals, tailored to the job posting.  Include relevant keywords from the job posting.  Quantify achievements where possible.]",
            nullable: false,
        },
        "work_experience": {
            type: SchemaType.ARRAY,
            description: "List of work experience entries.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "job_title": {
                        type: SchemaType.STRING,
                        description: "[Your Job Title]",
                        nullable: false,
                    },
                    "company_name": {
                        type: SchemaType.STRING,
                        description: "[Company Name]",
                        nullable: false,
                    },
                    "company_address": {
                        type: SchemaType.STRING,
                        description: "[Company Address]",
                        nullable: false,
                    },
                    "dates_of_employment": {
                        type: SchemaType.STRING,
                        description: "[Month Year Started] - [Month Year Ended] (or \"Present\")",
                        nullable: false,
                    },
                    "job_description": {
                        type: SchemaType.STRING,
                        description: "[Use bullet points to describe responsibilities and accomplishments. Use numbers and action verbs to demonstrate impact. Focus on quantifiable results. Tailor the description to match the job posting's requirements. If there are no related work experiance with the job requirements, list any other experience you can, or the error must be included.]",
                        nullable: false,
                    },
                },
                required: ["job_title", "company_name", "company_address", "dates_of_employment", "job_description"],
            },
            nullable: false,
        },
        "education": {
            type: SchemaType.ARRAY,
            description: "List of education entries.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "degree": {
                        type: SchemaType.STRING,
                        description: "[Your Degree]",
                        nullable: false,
                    },
                    "major": {
                        type: SchemaType.STRING,
                        description: "[Your Major]",
                        nullable: false,
                    },
                    "institution_name": {
                        type: SchemaType.STRING,
                        description: "[Institution Name]",
                        nullable: false,
                    },
                    "dates_attended": {
                        type: SchemaType.STRING,
                        description: "[Year Started] - [Year Ended]",
                        nullable: false,
                    },
                    "gpa": {
                        type: SchemaType.STRING,
                        description: "[Your GPA (create one if it doesn't exist, but reasonable)]",
                        nullable: false,
                    },
                    "awards_achievements": {
                        type: SchemaType.STRING,
                        description: "[List any relevant awards or achievements (create some if they don't exist, but relevant to the degree and job posting)]",
                        nullable: false,
                    },
                },
                required: ["degree", "major", "institution_name", "dates_attended", "gpa", "awards_achievements"],
            },
            nullable: false,
        },
        "skills": {
            type: SchemaType.OBJECT,
            description: "Skills of the candidate.",
            properties: {
                "technical_skills": {
                    type: SchemaType.STRING,
                    description: "[Comma-separated list of technical skills relevant to the job posting, e.g., SEO, Google Analytics, Python. Indicate proficiency level where relevant (e.g., SEO (Expert))]",
                    nullable: false,
                },
                "soft_skills": {
                    type: SchemaType.STRING,
                    description: "[Comma-separated list of soft skills, e.g., Communication, Leadership, Teamwork. Indicate proficiency level where relevant]",
                    nullable: false,
                },
            },
            required: ["technical_skills", "soft_skills"],
        },
        "awards_certifications": {
            type: SchemaType.ARRAY,
            description: "List of awards and certifications.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "name": {
                        type: SchemaType.STRING,
                        description: "[Name of Award/Certification (create an example relevant to the job posting if none exist)]",
                        nullable: false,
                    },
                    "institution": {
                        type: SchemaType.STRING,
                        description: "[Institution Issuing the Award/Certification]",
                        nullable: false,
                    },
                    "date": {
                        type: SchemaType.STRING,
                        description: "[Date Awarded]",
                        nullable: false,
                    },
                },
                required: ["name", "institution", "date"],
            },
            nullable: false,
        },
        "activities_interests": {
            type: SchemaType.STRING,
            description: "[Comma-separated list of relevant organizational activities, volunteer work, or interests that showcase personality and skills (create examples that match the job requirements if none exist)]",
            nullable: false,
        },
        "projects": {
            type: SchemaType.ARRAY,
            description: "List of projects.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "name": {
                        type: SchemaType.STRING,
                        description: "[Name of Project (create an example that aligns with the job posting if none exist)]",
                        nullable: false,
                    },
                    "description": {
                        type: SchemaType.STRING,
                        description: "[Description of the Project and its outcomes, quantifying achievements if possible]",
                        nullable: false,
                    },
                },
                required: ["name", "description"],
            },
            nullable: false,
        },
        "target_job_industry": {
            type: SchemaType.STRING,
            description: "[The specific target job or industry, extracted from the Job Posting. Example: Software Engineering, Digital Marketing]",
            nullable: false,
        },
        "cv_length_pages": {
            type: SchemaType.STRING, //Should be integer but changed to String based on the design requested by user
            description: "[The approximate length of the CV in pages (aim for 1-2). This should be a number]",
            nullable: false,
        },
        "keywords": {
            type: SchemaType.STRING,
            description: "[List of keywords extracted from the job posting and incorporated into the CV]",
            nullable: false,
        },
        "tone": {
            type: SchemaType.STRING,
            description: "[The overall tone of the CV (confident, positive, professional)]",
            nullable: false,
        },
        "warnings": {
            type: SchemaType.STRING,
            description: "[Warning messages if there is unclear or incomplete information in the Analysis Result Before, the Existing CV, or the Job Posting.  Be specific.]",
            nullable: false,
        },
        "error": {
            type: SchemaType.STRING,
            description: "[If an error occurred during processing (e.g., invalid input, missing required information, inability to create a complete CV), a detailed description of the error. Otherwise, this field MUST be empty.]",
            nullable: false,
        },
    },
    required: [
        "personal_information",
        "professional_summary",
        "work_experience",
        "education",
        "skills",
        "awards_certifications",
        "activities_interests",
        "projects",
        "target_job_industry",
        "cv_length_pages",
        "keywords",
        "tone",
        "warnings",
        "error",
    ],
};

export const schemaInterview = {
    description: "Interview questions and red flags schema for Gemini API",
    type: SchemaType.OBJECT,
    properties: {
        "hrd_interview_questions": {
            type: SchemaType.ARRAY,
            description: "List of HRD interview questions.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "question": {
                        type: SchemaType.STRING,
                        description: "[HRD Interview Question 1]",
                        nullable: false,
                    },
                    "goal": {
                        type: SchemaType.STRING,
                        description: "[Explanation of the question's purpose]",
                        nullable: false,
                    },
                    "answer_framework": {
                        type: SchemaType.STRING,
                        description: "[Tips on how to answer the question effectively]",
                        nullable: false,
                    },
                    "recommendation_answer": {
                        type: SchemaType.STRING,
                        description: "[Example of a strong answer]",
                        nullable: false,
                    },
                    "key_value_targeting": {
                        type: SchemaType.STRING,
                        description: "[The company value this question assesses]",
                        nullable: false,
                    },
                },
                required: ["question", "goal", "answer_framework", "recommendation_answer", "key_value_targeting"],
            },
            nullable: false,
        },
        "technical_interview_questions": {
            type: SchemaType.ARRAY,
            description: "List of technical interview questions.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "question": {
                        type: SchemaType.STRING,
                        description: "[Technical Interview Question 1]",
                        nullable: false,
                    },
                    "goal": {
                        type: SchemaType.STRING,
                        description: "[Explanation of the question's purpose]",
                        nullable: false,
                    },
                    "answer_framework": {
                        type: SchemaType.STRING,
                        description: "[Tips on how to answer the question effectively]",
                        nullable: false,
                    },
                    "recommendation_answer": {
                        type: SchemaType.STRING,
                        description: "[Example of a strong answer]",
                        nullable: false,
                    },
                    "seniority_level": {
                        type: SchemaType.STRING,
                        description: "[Entry-Level/Mid-Level/Senior-Level]",
                        nullable: false,
                    },
                },
                required: ["question", "goal", "answer_framework", "recommendation_answer", "seniority_level"],
            },
            nullable: false,
        },
        "potential_red_flags": {
            type: SchemaType.ARRAY,
            description: "List of potential red flags.",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "area": {
                        type: SchemaType.STRING,
                        description: "[Description of the Potential Red Flag]",
                        nullable: false,
                    },
                    "reason": {
                        type: SchemaType.STRING,
                        description: "[Explanation of why it's a concern]",
                        nullable: false,
                    },
                    "follow_up_question": {
                        type: SchemaType.STRING,
                        description: "[Follow-up Question to Clarify]",
                        nullable: false,
                    },
                },
                required: ["area", "reason", "follow_up_question"],
            },
            nullable: false,
        },
        "information_gathering_advice": {
            type: SchemaType.OBJECT,
            description: "Advice on gathering information about skills.",
            properties: {
                "skill_1": {
                    type: SchemaType.OBJECT,
                    properties: {
                        "skill_name": {
                            type: SchemaType.STRING,
                            description: "[Name of the skill]",
                            nullable: false,
                        },
                        "advice": {
                            type: SchemaType.STRING,
                            description: "[Advice on gathering information about skill 1]",
                            nullable: false,
                        },
                        "behavioral_questions": {
                            type: SchemaType.STRING,
                            description: "[Example behavioral questions for skill 1]",
                            nullable: false,
                        },
                    },
                    required: ["skill_name", "advice", "behavioral_questions"],
                },
                "skill_2": {
                    type: SchemaType.OBJECT,
                    properties: {
                        "skill_name": {
                            type: SchemaType.STRING,
                            description: "[Name of the skill]",
                            nullable: false,
                        },
                        "advice": {
                            type: SchemaType.STRING,
                            description: "[Advice on gathering information about skill 2]",
                            nullable: false,
                        },
                        "behavioral_questions": {
                            type: SchemaType.STRING,
                            description: "[Example behavioral questions for skill 2]",
                            nullable: false,
                        },
                    },
                    required: ["skill_name", "advice", "behavioral_questions"],
                },
                "skill_3": {
                    type: SchemaType.OBJECT,
                    properties: {
                        "skill_name": {
                            type: SchemaType.STRING,
                            description: "[Name of the skill]",
                            nullable: false,
                        },
                        "advice": {
                            type: SchemaType.STRING,
                            description: "[Advice on gathering information about skill 3]",
                            nullable: false,
                        },
                        "behavioral_questions": {
                            type: SchemaType.STRING,
                            description: "[Example behavioral questions for skill 3]",
                            nullable: false,
                        },
                    },
                    required: ["skill_name", "advice", "behavioral_questions"],
                },
            },
            required: ["skill_1", "skill_2", "skill_3"],
        },
        "warnings": {
            type: SchemaType.STRING,
            description: "[Warning messages if there is unclear or incomplete information in the Analysis Result Before, the Existing CV, or the Job Posting.  Be specific.]",
            nullable: false,
        },
        "error": {
            type: SchemaType.STRING,
            description: "[If an error occurred during processing, a detailed explanation of the error. Otherwise, this field MUST be empty.]",
            nullable: false,
        },
    },
    required: [
        "hrd_interview_questions",
        "technical_interview_questions",
        "potential_red_flags",
        "information_gathering_advice",
        "warnings",
        "error",
    ],
};

export const schemaHR = {
    description: "Candidate Assessment Summary Schema",
    type: SchemaType.OBJECT,
    properties: {
        "candidate_summary": {
            type: SchemaType.OBJECT,
            description: "Overall summary of the candidate assessment.",
            nullable: false,
            properties: {
                "overall_recommendation": {
                    type: SchemaType.STRING,
                    description: "Overall recommendation (Strongly Recommend/Recommend with Reservations/Do Not Recommend).",
                    nullable: false,
                    enum: ["Strongly Recommend", "Recommend with Reservations", "Do Not Recommend"] // Optional: Enforce specific values
                },
                "match_percentage": {
                    type: SchemaType.STRING, //Should ideally be NUMBER or INTEGER if your code can send it as number
                    description: "Percentage Match Score (integer, 0-100).",
                    nullable: false
                },
                "rationale": {
                    type: SchemaType.STRING,
                    description: "Concise explanation for the recommendation and match score (2-3 sentences max).",
                    nullable: false
                }
            },
            required: [
                "overall_recommendation",
                "match_percentage",
                "rationale"
            ]
        },
        "scoring_breakdown": {
            type: SchemaType.OBJECT,
            description: "Breakdown of scoring based on requirement types.",
            nullable: false,
            properties: {
                "essential_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring for essential requirements.",
                    nullable: false,
                    properties: {
                        "score": {
                            type: SchemaType.STRING,  //Should ideally be NUMBER or INTEGER if your code can send it as number
                            description: "Score achieved on essential requirements (integer, 0-100).",
                            nullable: false
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "Explanation of how the score was calculated.",
                            nullable: false
                        }
                    },
                    required: [
                        "score",
                        "details"
                    ]
                },
                "desirable_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring for desirable requirements.",
                    nullable: false,
                    properties: {
                        "score": {
                            type: SchemaType.STRING,  //Should ideally be NUMBER or INTEGER if your code can send it as number
                            description: "Score achieved on desirable requirements (integer, 0-100).",
                            nullable: false
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "Explanation of how the score was calculated.",
                            nullable: false
                        }
                    },
                    required: [
                        "score",
                        "details"
                    ]
                },
                "nice_to_have_requirements": {
                    type: SchemaType.OBJECT,
                    description: "Scoring for nice-to-have requirements.",
                    nullable: false,
                    properties: {
                        "score": {
                            type: SchemaType.STRING,  //Should ideally be NUMBER or INTEGER if your code can send it as number
                            description: "Score achieved on nice-to-have requirements (integer, 0-100).",
                            nullable: false
                        },
                        "details": {
                            type: SchemaType.STRING,
                            description: "Explanation of how the score was calculated.",
                            nullable: false
                        }
                    },
                    required: [
                        "score",
                        "details"
                    ]
                }
            },
            required: [
                "essential_requirements",
                "desirable_requirements",
                "nice_to_have_requirements"
            ]
        },
        "skill_match": {
            type: SchemaType.OBJECT,
            description: "Matching and missing skills analysis.",
            nullable: false,
            properties: {
                "matching_skills": {
                    type: SchemaType.ARRAY,
                    description: "List of matching skills.",
                    nullable: false,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "skill": {
                                type: SchemaType.STRING,
                                description: "Skill name from Job Description.",
                                nullable: false
                            },
                            "proficiency": {
                                type: SchemaType.STRING,
                                description: "Candidate's demonstrated proficiency (Expert, Proficient, Basic, or Not Evident).",
                                nullable: false,
                                enum: ["Expert", "Proficient", "Basic", "Not Evident"]  // Optional: Enforce specific values
                            },
                            "notes": {
                                type: SchemaType.STRING,
                                description: "Optional: Short note about where this skill is demonstrated in the CV.",
                                nullable: false
                            }
                        },
                        required: [
                            "skill",
                            "proficiency",
                            "notes"
                        ]
                    }
                },
                "missing_skills": {
                    type: SchemaType.ARRAY,
                    description: "List of missing skills.",
                    nullable: false,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "skill": {
                                type: SchemaType.STRING,
                                description: "Skill name from Job Description.",
                                nullable: false
                            },
                            "reason": {
                                type: SchemaType.STRING,
                                description: "Why the candidate is missing this skill.",
                                nullable: false
                            }
                        },
                        required: [
                            "skill",
                            "reason"
                        ]
                    }
                }
            },
            required: [
                "matching_skills",
                "missing_skills"
            ]
        },
        "experience_match": {
            type: SchemaType.OBJECT,
            description: "Matching and irrelevant experience analysis.",
            nullable: false,
            properties: {
                "relevant_experience": {
                    type: SchemaType.ARRAY,
                    description: "List of relevant experience.",
                    nullable: false,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            "company": {
                                type: SchemaType.STRING,
                                description: "Company Name from CV.",
                                nullable: false
                            },
                            "role": {
                                type: SchemaType.STRING,
                                description: "Role Title from CV.",
                                nullable: false
                            },
                            "duration": {
                                type: SchemaType.STRING,
                                description: "Duration in Role from CV.",
                                nullable: false
                            },
                            "responsibilities": {
                                type: SchemaType.STRING,
                                description: "Key responsibilities that align with job description.",
                                nullable: false
                            }
                        },
                        required: [
                            "company",
                            "role",
                            "duration",
                            "responsibilities"
                        ]
                    }
                },
                "irrelevant_experience": {
                    type: SchemaType.STRING,
                    description: "Brief summary of experience that is not directly relevant.",
                    nullable: false
                }
            },
            required: [
                "relevant_experience",
                "irrelevant_experience"
            ]
        },
        "education_match": {
            type: SchemaType.OBJECT,
            description: "Education match analysis.",
            nullable: false,
            properties: {
                "degree": {
                    type: SchemaType.STRING,
                    description: "Degree from CV.",
                    nullable: false
                },
                "major": {
                    type: SchemaType.STRING,
                    description: "Major from CV.",
                    nullable: false
                },
                "institution": {
                    type: SchemaType.STRING,
                    description: "Institution from CV.",
                    nullable: false
                },
                "meets_requirements": {
                    type: SchemaType.STRING,
                    description: "Does the education meet the job requirements? (Yes/No/Not Specified)",
                    nullable: false,
                    enum: ["Yes", "No", "Not Specified"]  // Optional: Enforce specific values
                },
                "notes": {
                    type: SchemaType.STRING,
                    description: "Any notes on the relevance or quality of the education.",
                    nullable: false
                }
            },
            required: [
                "degree",
                "major",
                "institution",
                "meets_requirements",
                "notes"
            ]
        },
        "culture_fit_assessment": {
            type: SchemaType.OBJECT,
            description: "Culture fit assessment.",
            nullable: false,
            properties: {
                "potential_fit": {
                    type: SchemaType.STRING,
                    description: "Potential culture fit (High/Medium/Low/Insufficient Data).",
                    nullable: false,
                    enum: ["High", "Medium", "Low", "Insufficient Data"]  // Optional: Enforce specific values
                },
                "rationale": {
                    type: SchemaType.STRING,
                    description: "Explanation of the potential culture fit.",
                    nullable: false
                }
            },
            required: [
                "potential_fit",
                "rationale"
            ]
        },
        "red_flags": {
            type: SchemaType.ARRAY,
            description: "List of potential red flags identified in the CV.",
            nullable: false,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    "area": {
                        type: SchemaType.STRING,
                        description: "Description of the potential red flag area.",
                        nullable: false
                    },
                    "reason": {
                        type: SchemaType.STRING,
                        description: "Explanation of why the area is a potential concern.",
                        nullable: false
                    },
                    "follow_up_question": {
                        type: SchemaType.STRING,
                        description: "A question to ask the candidate to clarify the potential red flag.",
                        nullable: false
                    }
                },
                required: ["area", "reason", "follow_up_question"] // All three fields are required
            },
        },
        "notes_for_recruiter": {
            type: SchemaType.STRING,
            description: "Any additional notes or observations for the recruiter.",
            nullable: false
        },
        "warnings": {
            type: SchemaType.STRING,
            description: "Warning messages if there is unclear or incomplete information.",
            nullable: false
        },
        "error": {
            type: SchemaType.STRING,
            description: "Detailed explanation of the error, if any.",
            nullable: false
        }
    },
    required: [
        "candidate_summary",
        "scoring_breakdown",
        "skill_match",
        "experience_match",
        "education_match",
        "culture_fit_assessment",
        "red_flags",
        "notes_for_recruiter",
        "warnings",
        "error"
    ]
};

export const cvSchemaOptimized = {
    type: SchemaType.OBJECT,
    description: 'CV Data Schema optimized for Gemini API input',
    properties: {
        personalInformation: {
            type: SchemaType.OBJECT,
            description: 'Personal information of the individual',
            properties: {
                fullName: { type: SchemaType.STRING, description: 'Full Name' },
                address: { type: SchemaType.STRING, description: 'Address (optional)' },
                phoneNumber: { type: SchemaType.STRING, description: 'Phone Number (optional)' },
                emailAddress: { type: SchemaType.STRING, description: 'Email Address' },
                linkedInProfile: { type: SchemaType.STRING, description: 'LinkedIn Profile URL (optional)' },
            },
            required: ['fullName', 'emailAddress'], // Example required fields
        },
        educationHistory: {
            type: SchemaType.ARRAY,
            description: 'Array of education history entries',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    institution: { type: SchemaType.STRING, description: 'Institution Name' },
                    degree: { type: SchemaType.STRING, description: 'Degree Earned' },
                    yearOfGraduation: { type: SchemaType.STRING, description: 'Year of Graduation' },
                },
                required: ['institution', 'degree', 'yearOfGraduation'],
            },
        },
        workExperience: {
            type: SchemaType.ARRAY,
            description: 'Array of work experience entries',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    company: { type: SchemaType.STRING, description: 'Company Name' },
                    jobTitle: { type: SchemaType.STRING, description: 'Job Title' },
                    employmentPeriod: { type: SchemaType.STRING, description: 'Employment Period' },
                    description: { type: SchemaType.STRING, description: 'Description of Responsibilities and Achievements (optional)' },
                },
                required: ['company', 'jobTitle', 'employmentPeriod'],
            },
        },
        skills: {
            type: SchemaType.ARRAY,
            description: 'Array of skills',
            items: { type: SchemaType.STRING, description: 'Skill Name' }, // Simple string array for skills
        },
        references: {
            type: SchemaType.ARRAY,
            description: 'Array of references',
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    referenceName: { type: SchemaType.STRING, description: 'Reference Name (optional)' },
                    contactInformation: { type: SchemaType.STRING, description: 'Contact Information (optional)' },
                },
                required: [], // No required fields for references if they are optional
            },
        },
        certificationsAndAwards: {
            type: SchemaType.ARRAY,
            description: 'Array of certifications and awards',
            items: { type: SchemaType.STRING, description: 'Certification/Award Name' }, // Simple string array
        },
    },
    required: ['personalInformation', 'educationHistory', 'workExperience', 'skills'], // Example top-level required fields
};

export const linkedInProfileAnalysisSchema = {
    type: SchemaType.OBJECT,
    description: 'Schema for analyzing and providing feedback on a LinkedIn profile.',
    properties: {
        overallSummary: {
            type: SchemaType.OBJECT,
            description: 'Summary of the profile\'s overall analysis',
            properties: {
                strengths: { type: SchemaType.STRING, description: '[Summary of the profile\'s strengths]' },
                weaknesses: { type: SchemaType.STRING, description: '[Summary of the profile\'s weaknesses]' },
                overallRecommendation: { type: SchemaType.STRING, description: '[Overall recommendation for improvement]' },
            },
            required: ['strengths', 'weaknesses', 'overallRecommendation'],
        },
        recruiterAppeal: {
            type: SchemaType.OBJECT,
            description: 'Analysis of the profile\'s appeal to recruiters',
            properties: {
                keywordAnalysis: {
                    type: SchemaType.OBJECT,
                    description: 'Analysis of keyword usage in the profile',
                    properties: {
                        relevantKeywords: { type: SchemaType.STRING, description: '[List of general keywords relevant to professional profiles]' },
                        keywordUsage: { type: SchemaType.STRING, description: '[Analysis of keyword usage in the profile]' },
                        keywordRecommendations: { type: SchemaType.STRING, description: '[Keyword optimization suggestions]' },
                    },
                    required: ['relevantKeywords', 'keywordUsage', 'keywordRecommendations'],
                },
                titleEvaluation: {
                    type: SchemaType.OBJECT,
                    description: 'Evaluation of the profile title',
                    properties: {
                        attractiveness: { type: SchemaType.STRING, description: '[Rating of the title\'s attractiveness (Scale 1-5)]' },
                        informativeness: { type: SchemaType.STRING, description: '[Rating of the title\'s informativeness (Scale 1-5)]' },
                        seoOptimization: { type: SchemaType.STRING, description: '[Rating of the title\'s SEO optimization (Scale 1-5)]' },
                        recommendations: { type: SchemaType.STRING, description: '[Suggestions for title improvement]' },
                    },
                    required: ['attractiveness', 'informativeness', 'seoOptimization', 'recommendations'],
                },
                summaryEvaluation: {
                    type: SchemaType.OBJECT,
                    description: 'Evaluation of the profile summary',
                    properties: {
                        engagement: { type: SchemaType.STRING, description: '[Rating of the summary\'s engagement (Scale 1-5)]' },
                        readability: { type: SchemaType.STRING, description: '[Rating of the summary\'s readability (Scale 1-5)]' },
                        valueProposition: { type: SchemaType.STRING, description: '[Analysis of the summary\'s conveyance of a unique value proposition]' },
                        recommendations: { type: SchemaType.STRING, description: '[Suggestions for summary improvement]' },
                    },
                    required: ['engagement', 'readability', 'valueProposition', 'recommendations'],
                },
                experienceQuantification: { type: SchemaType.STRING, description: '[Analysis of the quantification of work experience]' },
                grammarAndProfessionalism: { type: SchemaType.STRING, description: '[Assessment of grammar, spelling, and professional tone]' },
            },
            required: ['keywordAnalysis', 'titleEvaluation', 'summaryEvaluation', 'experienceQuantification', 'grammarAndProfessionalism'],
        },
        searchVisibility: {
            type: SchemaType.OBJECT,
            description: 'Analysis of the profile\'s search visibility',
            properties: {
                seoLinkedIn: { type: SchemaType.STRING, description: '[Overall LinkedIn SEO optimization suggestions]' },
                skillsOptimization: { type: SchemaType.STRING, description: '[Analysis and optimization recommendations for the skills section]' },
                recommendationStrategy: { type: SchemaType.STRING, description: '[Strategy for obtaining quality recommendations]' },
            },
            required: ['seoLinkedIn', 'skillsOptimization', 'recommendationStrategy'],
        },
        personalBranding: {
            type: SchemaType.OBJECT,
            description: 'Analysis of the profile\'s personal branding',
            properties: {
                brandConsistency: { type: SchemaType.STRING, description: '[Evaluation of personal brand consistency across profile sections]' },
                contentStrategy: { type: SchemaType.STRING, description: '[Content strategy suggestions]' },
                engagementTips: { type: SchemaType.STRING, description: '[Engagement tips, suggesting how to interact with connections, join relevant groups, and participate in discussions]' },
                profilePictureEvaluation: { type: SchemaType.STRING, description: '[Assessment of the profile picture]' },
            },
            required: ['brandConsistency', 'contentStrategy', 'engagementTips', 'profilePictureEvaluation'],
        },
        networkingAndConnections: {
            type: SchemaType.OBJECT,
            description: 'Suggestions for networking and building connections',
            properties: {
                relevantConnections: { type: SchemaType.STRING, description: '[Suggestions on how to identify and connect with relevant individuals]' },
                outreachMessageTips: { type: SchemaType.STRING, description: '[Tips for crafting effective outreach messages]' },
                relationshipBuilding: { type: SchemaType.STRING, description: '[Guidance on building and maintaining relationships with LinkedIn connections]' },
            },
            required: ['relevantConnections', 'outreachMessageTips', 'relationshipBuilding'],
        },
        overallRecommendationForTargetGoal: { type: SchemaType.STRING, description: '[General and actionable suggestions for improving the profile]' },
        stepByStepActionPlan: {
            type: SchemaType.OBJECT,
            description: 'Step-by-step action plan for profile improvement',
            properties: {
                day1: { type: SchemaType.STRING, description: '[Specific task for day 1]' },
                day2: { type: SchemaType.STRING, description: '[Specific task for day 2]' },
                day3: { type: SchemaType.STRING, description: '[Specific task for day 3]' },
                day4: { type: SchemaType.STRING, description: '[Specific task for day 4]' },
                day5: { type: SchemaType.STRING, description: '[Specific task for day 5]' },
                day6: { type: SchemaType.STRING, description: '[Specific task for day 6]' },
                day7: { type: SchemaType.STRING, description: '[Specific task for day 7]' },
            },
            required: ['day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'],
        },
        warnings: { type: SchemaType.STRING, description: '[Warning messages if there is unclear or incomplete information in the LinkedIn profile]' },
        error: { type: SchemaType.STRING, description: '[If an error occurred during processing, a detailed explanation of the error. Otherwise, this field MUST be empty.]' },
    },
    required: [
        'overallSummary',
        'recruiterAppeal',
        'searchVisibility',
        'personalBranding',
        'networkingAndConnections',
        'overallRecommendationForTargetGoal',
        'stepByStepActionPlan',
        'warnings',
        'error',
    ],
};
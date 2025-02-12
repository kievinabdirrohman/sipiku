'use server'

import { NextResponse } from 'next/server'

import { GoogleGenerativeAI } from "@google/generative-ai";

import { z } from 'zod';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function isValidImageMimeType(mimeType: string | null | undefined): boolean {
    if (!mimeType) return false;
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']; // Add more as needed
    return validMimeTypes.includes(mimeType.toLowerCase());
}

const fileSchema = z.object({
    file: z
        .instanceof(File, { message: "Wajib memilih file" })
        .refine((file) => file.type === "application/pdf", {
            message: "File harus berupa PDF",
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "Ukuran file maksimal 1 MB",
        }),
    job_type: z.enum(["file", "text"], {
        required_error: "Job Type is required",
    }),
    job_text: z.string().min(100, {
        message: "Minimal 100 karakter",
    }).optional(),
    image: z
        .instanceof(File, { message: "Wajib memilih file" })
        .refine((file) => isValidImageMimeType(file.type), {
            message: "File harus berupa Gambar atau PDF",
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "Ukuran file maksimal 1 MB",
        }).optional(),
});

export default async function analyzeCV(formData: z.infer<typeof fileSchema>) {
    const validatedFields = fileSchema.safeParse({
        file: formData.file,
        job_type: formData.job_type,
        job_text: formData.job_text,
        image: formData.image
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const bytes = await validatedFields.data.file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');

    const prompt = `
        You are an expert recruiter, CV Analyzer, HRD. Detect and Analyze Document is CV. Extract All Data Document into CV Data. Format output in Paragraph with List of CV.
        If Document not CV, return:
        "Document not CV"
        `

    const result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: prompt,
                    },
                    {
                        inlineData: {
                            data: base64String,
                            mimeType: "application/pdf",
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
            topP: 0.5
        }
    });

    const geminiOutput = result.response.text();

    if (geminiOutput === "Document not CV") {
        return {
            response: "Document not CV",
        }
    }

    if (validatedFields.data.job_type === "file") {
        const bytesImage = await validatedFields.data.image!.arrayBuffer();
        const bufferImage = Buffer.from(bytesImage);
        const base64StringImage = bufferImage.toString('base64');
        const mimeTypeImage = validatedFields.data.image!.type;

        const promptImage = `
            You are expert Image Analyzer. Extract Image into Job Requirement.Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output in Paragraph with List of Job Requirements.
            If Image is not Job Requirements, return:
            "Job Requirements not contains job requirements"
        `

        const resultImage = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptImage,
                        },
                        {
                            inlineData: {
                                data: base64StringImage,
                                mimeType: mimeTypeImage,
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.1,
                topP: 0.5
            }
        });

        const geminiOutputImage = resultImage.response.text();

        if (geminiOutputImage === "Job Requirements not contains job requirements") {
            return {
                response: "Job Requirements not contains job requirements",
            }
        }

        const promptFinal = `
            Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output JSON and generate in one format:
                {
                    "cv_friendly": boolean,
                    "job_requirements": boolean,
                    "result": JSON (result output),
                }
            .
            **Job Requirements** : ${geminiOutputImage}.
            if not real or Invalid, the output only return:
            {
                "cv_friendly": false,
                "job_requirements": false,
                "result": "Job Requirements not contains job requirements",
            }
            .
            If it is real job requirements, continue to analyze CV.
            **CV** : ${geminiOutput}.
            You are an expert recruiter, CV Analyzer, HRD. Detect and Analyze Document is CV. Analyze the CV against the job requirements. Extract All Data Document into CV Data. Format output JSON:
                {
                    "cv_friendly": boolean,
                    "result": JSON (result output),
                }
            .
            if Document is Equal to "Document not CV", return:
                {
                    "cv_friendly": false,
                    "result": "Document not CV",
                }
            .
            if Document is CV, comparing a CV against job requirements.
            
            You are a career assistant helping job seekers analyze and compare their resumes/CVs with job openings they are interested in. Your task is to provide an easy-to-understand report on how well the CV matches the job requirements.

            **Instructions:**

            1.  **Analyze the CV:**  Thoroughly read and understand the content of the job seeker's CV (PDF format). Extract all relevant information, including education, work experience, skills, and certifications.
            2.  **Analyze the Job Description:** Carefully analyze the job description (PDF or Image format) to identify the essential requirements, desired qualifications, key responsibilities, and keywords.
            3.  **Compare CV and Job Description:** Compare the information extracted from the CV with the requirements in the job description to determine how well the candidate's profile aligns with the role.
            4.  **Assign Weights to Requirements:** Assign a weight to each requirement in the job description based on its importance (e.g., Essential = 50%, Desirable = 30%, Nice-to-Have = 20%). This assessment must be *derived solely from the content of the Job Description*.
            5.  **Calculate Match Score:** Calculate a percentage match score representing the overall alignment between the job seeker's CV and the job description. Provide a breakdown of how the score was calculated so the user can understand the strengths and weaknesses of their application.
            6.  **Provide Detailed Feedback:**  Provide specific feedback on areas where the CV aligns well with the job description and areas where there are gaps. Offer actionable suggestions on how the job seeker can improve their CV and overall application to increase their chances of success.
            7.  **Use Clear and Simple Language:**  Present the analysis and recommendations in a clear, concise, and easy-to-understand manner, avoiding HR jargon. Focus on practical advice that the job seeker can implement immediately.
            8.  **Output in JSON Format:** Structure the assessment in a JSON format for easy parsing and display in the application.

            **Input:**

            *   **CV:** ${geminiOutput}
            *   **Job Posting:** ${geminiOutputImage}

            **Output (JSON):**
            {
                "Overall Match Percentage": "A percentage representing how well the CV aligns with the requirements (0-100%).  Be conservative; do not inflate the percentage. return in integer",
                "assessment_summary": {
                    "overall_match_percentage": "[Overall Match Percentage (e.g., 75%)]",
                    "summary": "[A brief summary of the candidate's overall fit for the role (1-2 sentences)]",
                    "key_strengths": "[A list of the candidate's key strengths based on the CV and job description]",
                    "areas_for_improvement": "[A list of areas where the candidate could improve their CV or application]"
                },
                "scoring_breakdown": {
                    "essential_requirements": {
                        "score": "[Score achieved by candidate on essential requirements]. return in integer",
                        "details": "[Brief explanation of how the score for essential requirements was calculated. Be Specific.]"
                    },
                    "desirable_requirements": {
                        "score": "[Score achieved by candidate on desirable requirements]. return in integer",
                        "details": "[Brief explanation of how the score for desirable requirements was calculated. Be Specific.]"
                    },
                    "nice_to_have_requirements": {
                        "score": "[Score achieved by candidate on nice-to-have requirement]. return in integer",
                        "details": "[Brief explanation of how the score for nice-to-have requirements was calculated. Be Specific.]"
                    },
                },
                "detailed_analysis": {
                    "education": {
                        "suitable": "[Does the education meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the education suitability]"
                    },
                    "work_experience": {
                        "suitable": "[Does the work experience meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the work experience suitability. Mention relevant and less relevant experience]"
                    },
                    "skills": {
                        "suitable": "[Do the skills meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the skills suitability. Mention matching skills and skills that need improvement]"
                    },
                    "other_requirements": {
                        "suitable": "[Do other requirements (e.g., certifications, languages) meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the suitability of other requirements]"
                    }
                },
                "skill_analysis": {
                    "matching_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "evidence_in_cv": "[Specific example from the CV that demonstrates this skill]",
                            "recommendation": "[If applicable: Recommendation to further highlight this skill]"
                        }
                    ],
                    "missing_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "reason": "[Explanation of why the skill is considered missing (e.g., not mentioned, insufficient experience)]",
                            "recommendation": "[Actionable suggestion for how the candidate could acquire or demonstrate this skill]"
                        }
                    ]
                },
                "experience_analysis": {
                    "relevant_experience": [
                        {
                            "company": "[Company Name from CV]",
                            "role": "[Role Title from CV]",
                            "relevance": "[Explanation of how this experience is relevant to the target job]",
                            "recommendation": "[If applicable: Recommendation to better highlight this experience in the CV]"
                        }
                    ],
                    "less_relevant_experience": "[Summary of experience that is less relevant to the target job and suggestions for how to minimize its emphasis (if necessary)]"
                },
                "recommendations": [
                    "[Concrete suggestions for improving the CV to better match the job opening. Example: Add details about SEO experience, Google Analytics certification, etc.]",
                    "[Other suggestions for improving the chances of getting hired, such as creating a more personalized cover letter, preparing for the interview, etc.]"
                ],
                "warnings": "[Warning messages if there is unclear or incomplete information in the CV]"
            }

            Be concise and professional in your response. Prioritize accuracy and relevance.
            `

        const resultFinal = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: promptFinal,
                        },
                    ],
                },
            ],
            generationConfig: {
                maxOutputTokens: 8192,
                temperature: 0.1,
                topP: 0.5
            }
        });

        const geminiOutputFinal = resultFinal.response.text();

        return {
            response: geminiOutputFinal,
        }
    }

    const promptText = `
            Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output JSON and generate in one format:
                {
                    "cv_friendly": boolean,
                    "job_requirements": boolean,
                    "result": JSON (result output),
                }
            .
            **Job Requirements** : ${validatedFields.data.job_text}.
            if not real or Invalid, the output only return:
            {
                "cv_friendly": true,
                "job_requirements": false,
                "result": "Job Requirements not contains job requirements",
            }
            .
            If it is real job requirements, continue to analyze CV.
            **CV** : ${geminiOutput}.
            You are an expert recruiter, CV Analyzer, HRD. Detect and Analyze Document is CV. Analyze the CV against the job requirements. Extract All Data Document into CV Data. Format output JSON:
                {
                    "cv_friendly": boolean,
                    "job_requirements": boolean,
                    "result": JSON (result output),
                }
            .
            if Document is Equal to "Document not CV", return:
                {
                    "cv_friendly": false,
                    "job_requirements": true,
                    "result": "Document not CV",
                }
            .
            if Document is CV, comparing a CV against job requirements.
            
            You are a career assistant helping job seekers analyze and compare their resumes/CVs with job openings they are interested in. Your task is to provide an easy-to-understand report on how well the CV matches the job requirements.

            **Instructions:**

            1.  **Analyze the CV:**  Thoroughly read and understand the content of the job seeker's CV (PDF format). Extract all relevant information, including education, work experience, skills, and certifications.
            2.  **Analyze the Job Description:** Carefully analyze the job description (PDF or Image format) to identify the essential requirements, desired qualifications, key responsibilities, and keywords.
            3.  **Compare CV and Job Description:** Compare the information extracted from the CV with the requirements in the job description to determine how well the candidate's profile aligns with the role.
            4.  **Assign Weights to Requirements:** Assign a weight to each requirement in the job description based on its importance (e.g., Essential = 50%, Desirable = 30%, Nice-to-Have = 20%). This assessment must be *derived solely from the content of the Job Description*.
            5.  **Calculate Match Score:** Calculate a percentage match score representing the overall alignment between the job seeker's CV and the job description. Provide a breakdown of how the score was calculated so the user can understand the strengths and weaknesses of their application.
            6.  **Provide Detailed Feedback:**  Provide specific feedback on areas where the CV aligns well with the job description and areas where there are gaps. Offer actionable suggestions on how the job seeker can improve their CV and overall application to increase their chances of success.
            7.  **Use Clear and Simple Language:**  Present the analysis and recommendations in a clear, concise, and easy-to-understand manner, avoiding HR jargon. Focus on practical advice that the job seeker can implement immediately.
            8.  **Output in JSON Format:** Structure the assessment in a JSON format for easy parsing and display in the application.

            **Input:**

            *   **CV:** ${geminiOutput}
            *   **Job Posting:** ${validatedFields.data.job_text}

            **Output (JSON):**
            {
                "Overall Match Percentage": "A percentage representing how well the CV aligns with the requirements (0-100%).  Be conservative; do not inflate the percentage. return in integer",
                "assessment_summary": {
                    "overall_match_percentage": "[Overall Match Percentage (e.g., 75%)]",
                    "summary": "[A brief summary of the candidate's overall fit for the role (1-2 sentences)]",
                    "key_strengths": "[A list of the candidate's key strengths based on the CV and job description]",
                    "areas_for_improvement": "[A list of areas where the candidate could improve their CV or application]"
                },
                "scoring_breakdown": {
                    "essential_requirements": {
                        "score": "[Score achieved by candidate on essential requirements]. return in integer",
                        "details": "[Brief explanation of how the score for essential requirements was calculated. Be Specific.]"
                    },
                    "desirable_requirements": {
                        "score": "[Score achieved by candidate on desirable requirements]. return in integer",
                        "details": "[Brief explanation of how the score for desirable requirements was calculated. Be Specific.]"
                    },
                    "nice_to_have_requirements": {
                        "score": "[Score achieved by candidate on nice-to-have requirement]. return in integer",
                        "details": "[Brief explanation of how the score for nice-to-have requirements was calculated. Be Specific.]"
                    },
                },
                "detailed_analysis": {
                    "education": {
                        "suitable": "[Does the education meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the education suitability]"
                    },
                    "work_experience": {
                        "suitable": "[Does the work experience meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the work experience suitability. Mention relevant and less relevant experience]"
                    },
                    "skills": {
                        "suitable": "[Do the skills meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the skills suitability. Mention matching skills and skills that need improvement]"
                    },
                    "other_requirements": {
                        "suitable": "[Do other requirements (e.g., certifications, languages) meet the requirements? Yes/No]",
                        "detail": "[Further explanation of the suitability of other requirements]"
                    }
                },
                "skill_analysis": {
                    "matching_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "evidence_in_cv": "[Specific example from the CV that demonstrates this skill]",
                            "recommendation": "[If applicable: Recommendation to further highlight this skill]"
                        }
                    ],
                    "missing_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "reason": "[Explanation of why the skill is considered missing (e.g., not mentioned, insufficient experience)]",
                            "recommendation": "[Actionable suggestion for how the candidate could acquire or demonstrate this skill]"
                        }
                    ]
                },
                "experience_analysis": {
                    "relevant_experience": [
                        {
                            "company": "[Company Name from CV]",
                            "role": "[Role Title from CV]",
                            "relevance": "[Explanation of how this experience is relevant to the target job]",
                            "recommendation": "[If applicable: Recommendation to better highlight this experience in the CV]"
                        }
                    ],
                    "less_relevant_experience": "[Summary of experience that is less relevant to the target job and suggestions for how to minimize its emphasis (if necessary)]"
                },
                "recommendations": [
                    "[Concrete suggestions for improving the CV to better match the job opening. Example: Add details about SEO experience, Google Analytics certification, etc.]",
                    "[Other suggestions for improving the chances of getting hired, such as creating a more personalized cover letter, preparing for the interview, etc.]"
                ],
                "warnings": "[Warning messages if there is unclear or incomplete information in the CV]"
            }

            Be concise and professional in your response. Prioritize accuracy and relevance.
            `

    const resultText = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: promptText,
                    },
                ],
            },
        ],
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
            topP: 0.5
        }
    });

    const geminiOutputText = resultText.response.text();
    const resultJSON = JSON.parse(geminiOutputText.replace(/```json\n?|```/g, ''));

    if (resultJSON.cv_friendly === false) {
        return {
            response: "Document not CV",
        }
    }

    if (resultJSON.job_requirements === false) {
        return {
            response: "Job Requirements not contains job requirements",
        }
    }

    return {
        response: geminiOutputText,
    }

    // const promptHRD = `
    //     You are a recruitment assistant for HRD/Recruiters. Your task is to analyze a candidate's CV and a job description to provide a comprehensive assessment of the candidate's suitability for the role, including a percentage match score. The goal is to streamline the initial screening process and provide recruiters with a clear, concise, and actionable overview.

    //     **Instructions:**

    //     1.  **Thoroughly Analyze the CV:** Extract all relevant information from the candidate's CV (PDF format), including education, work experience, skills, certifications, and any other pertinent details.
    //     2.  **Deconstruct the Job Description:** Analyze the job description (PDF or Image format) to identify the essential requirements, desired qualifications, key responsibilities, and the company culture fit.
    //     3.  **Compare CV and Job Description:**  Compare the extracted information from the CV against the requirements and preferences outlined in the job description.
    //     4.  **Assign Weights to Requirements:** Assign a weight to each requirement in the job description based on its importance (e.g., Essential = 50%, Desirable = 30%, Nice-to-Have = 20%). This is implicitly based on the content of the Job Description.  You do *not* need outside information to assign weights.
    //     5.  **Calculate Match Score:** Calculate a percentage match score based on the candidate's fulfillment of the weighted requirements. This score should reflect the overall alignment between the CV and the job description. Show your work in the JSON response so the user can understand how the score was generated.
    //     6.  **Identify Strengths & Weaknesses:**  Pinpoint the candidate's key strengths that align with the job requirements and any weaknesses or gaps in their experience, skills, or qualifications.  Quantify strengths and weaknesses where possible (e.g., "5 years of experience in project management" vs. "lacks experience in Agile methodologies").
    //     7.  **Assess Culture Fit (If Possible):**  Based on information available in the job description and any clues in the CV (e.g., volunteer work, hobbies), assess the potential culture fit of the candidate with the company. This is often subjective, so clearly state the rationale.
    //     8.  **Generate a Concise Summary:**  Produce a concise summary of the candidate's suitability, including the percentage match score and a clear recommendation (e.g., "Strongly Recommend," "Recommend with Reservations," "Do Not Recommend") with a rationale.
    //     9.  **Output in JSON Format:**  Structure the analysis in a JSON format that is easy to parse and integrate into recruitment management systems.

    //     **Input:**

    //     *   **Candidate CV (PDF):** ${geminiOutput}
    //     *   **Job Description:** ${geminiOutputImage}

    //     **Output (JSON):**
    //     {
    //     "candidate_summary": {
    //         "overall_recommendation": "[Strongly Recommend/Recommend with Reservations/Do Not Recommend]",
    //         "match_percentage": "[Percentage Match Score (e.g., 85%)]",
    //         "rationale": "[Concise explanation for the recommendation and match score (2-3 sentences max)]"
    //     },
    //     "scoring_breakdown": {
    //         "essential_requirements": {
    //             "weight": "[Weight assigned to essential requirements (e.g., 50%)]",
    //             "score": "[Score achieved by candidate on essential requirements (e.g., 40% out of 50%)]",
    //             "details": "[Brief explanation of how the score for essential requirements was calculated]"
    //         },
    //         "desirable_requirements": {
    //             "weight": "[Weight assigned to desirable requirements (e.g., 30%)]",
    //             "score": "[Score achieved by candidate on desirable requirements (e.g., 20% out of 30%)]",
    //             "details": "[Brief explanation of how the score for desirable requirements was calculated]"
    //         },
    //         "nice_to_have_requirements": {
    //             "weight": "[Weight assigned to nice-to-have requirements (e.g., 20%)]",
    //             "score": "[Score achieved by candidate on nice-to-have requirements (e.g., 10% out of 20%)]",
    //             "details": "[Brief explanation of how the score for nice-to-have requirements was calculated]"
    //         },
    //         "overall_calculation": "[Explanation of how the overall match percentage was calculated based on the weighted scores]"
    //     },
    //     "skill_match": {
    //         "matching_skills": [
    //             {
    //                 "skill": "[Skill name from Job Description]",
    //                 "proficiency": "[Candidate's demonstrated proficiency (e.g., Expert, Proficient, Basic) - based on CV]",
    //                 "notes": "[Optional: Short note about where this skill is demonstrated in the CV]"
    //             }
    //         ],
    //         "missing_skills": [
    //             {
    //                 "skill": "[Skill name from Job Description]",
    //                 "reason": "[Why the candidate is missing this skill (e.g., no mention in CV, insufficient experience)]"
    //             }
    //         ]
    //     },
    //     "experience_match": {
    //         "relevant_experience": [
    //         {
    //             "company": "[Company Name from CV]",
    //             "role": "[Role Title from CV]",
    //             "duration": "[Duration in Role from CV]",
    //             "responsibilities": "[Key responsibilities from CV that align with job description]"
    //         }
    //         ],
    //         "irrelevant_experience": "[Brief summary of experience that is not directly relevant to the job]"
    //     },
    //     "education_match": {
    //         "degree": "[Degree from CV]",
    //         "major": "[Major from CV]",
    //         "institution": "[Institution from CV]",
    //         "meets_requirements": "[Does the education meet the job requirements? Yes/No]",
    //         "notes": "[Optional: Any notes on the relevance or quality of the education]"
    //     },
    //     "culture_fit_assessment": {
    //         "potential_fit": "[Likelihood of culture fit (High/Medium/Low)]",
    //         "rationale": "[Explanation of the potential culture fit based on available information]"
    //     },
    //     "red_flags": [
    //         "[List of potential red flags identified in the CV (e.g., unexplained gaps in employment, frequent job changes)]"
    //     ],
    //     "notes_for_recruiter": "[Any additional notes or observations for the recruiter to consider]"
    //     }
    // `
}
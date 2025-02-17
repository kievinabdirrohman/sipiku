'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from 'zod';

import { candidateSchema, cvSchema, jobPosterSchema, jobSchema, textSchema } from "@/lib/schema";

const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: process.env.GOOGLE_GEMINI_API_MODEL! });

/**
 * Analyze a CV file and return the extracted data in a paragraph format
 * with a list of CV data. If the document is not a CV, return an error.
 *
 * @param {Object} formData - The form data containing the CV file and role.
 * @param {string} formData.role - The role of the CV, either 'candidate' or 'hrd'.
 * @param {File} formData.file - The CV file.
 * @returns {Promise<Object>} - The response object containing the errors and response.
 * If errors is true, response is the error message. Otherwise, response is the extracted CV data.
 */
export const analyzeCV = async (formData: z.infer<typeof cvSchema>) => {
    const validatedCV = cvSchema.safeParse({
        role: formData.role,
        file: formData.file,
    })

    if (!validatedCV.success) {
        return {
            errors: true,
            response: "validation_error",
        }
    }

    const cv_bytes = await validatedCV.data.file.arrayBuffer();
    const cv_buffer = Buffer.from(cv_bytes);
    const cv_base64_string = cv_buffer.toString('base64');

    const cv_prompt = `
        You are an expert recruiter, CV Analyzer, HRD. Detect and Analyze Document is CV. Extract All Data Document into CV Data. Format output in Paragraph with List of CV.
        If Document not CV, return:
        "Document not CV"
        `

    const cv_result = await model.generateContent({
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        text: cv_prompt,
                    },
                    {
                        inlineData: {
                            data: cv_base64_string,
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

    const cv_output = cv_result.response.text();

    if (cv_output === "Document not CV") {
        return {
            errors: true,
            response: "cv_is_invalid",
        }
    }

    return {
        errors: false,
        response: cv_output
    }
}


/**
 * Analyze a job poster file and return the extracted job requirements in a paragraph format
 * with a list of job requirements. If the document is not a job poster, return an error.
 *
 * @param {Object} formData - The form data containing the job poster file and role.
 * @param {string} formData.role - The role of the job poster, either 'candidate' or 'hrd'.
 * @param {File} formData.file - The job poster file.
 * @returns {Promise<Object>} - The response object containing the errors and response.
 * If errors is true, response is the error message. Otherwise, response is the extracted job requirements.
 */
export const analyzeJobPoster = async (formData: any) => {
/*************  ✨ Codeium Command ⭐  *************/
/**
 * Analyze a job poster file and return the extracted job requirements in a paragraph format
 * with a list of job requirements. If the document is not a job poster, return an error.
 *
 * @param {Object} formData - The form data containing the job poster file and role.
 * @param {string} formData.role - The role of the job poster, either 'candidate' or 'hrd'.
 * @param {File} formData.file - The job poster file.
 * @returns {Promise<Object>} - The response object containing the errors and response.
 * If errors is true, response is the error message. Otherwise, response is the extracted job requirements.
 */
/******  873af3bd-0f0e-4ea2-acd4-1f3ba92d3e24  *******/    const validatedJob = jobSchema.safeParse({
        role: formData.role,
        cv: formData.cv,
        job_type: formData.job_type
    })

    if (!validatedJob.success) {
        return {
            errors: true,
            response: "validation_error",
        }
    }

    switch (validatedJob.data.job_type) {
        case "file":
            const validatedJobPoster = jobPosterSchema.safeParse({
                job_poster: formData.job_poster
            })

            if (!validatedJobPoster.success) {
                return {
                    errors: true,
                    response: "validation_error",
                }
            }

            const job_poster_bytes = await validatedJobPoster.data.job_poster!.arrayBuffer();
            const job_poster_buffer = Buffer.from(job_poster_bytes);
            const job_poster_base64_string = job_poster_buffer.toString('base64');
            const job_poster_mimetype = validatedJobPoster.data.job_poster!.type;

            const job_poster_prompt = `
                You are expert Image/PDF Analyzer. Extract Image/PDF into Job Requirement.Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output in Paragraph with List of Job Requirements. provide Company Name if Exist   
                If Image is not Job Requirements, return:
                "Job Requirements not contains job requirements"
            `

            const job_poster_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: job_poster_prompt,
                            },
                            {
                                inlineData: {
                                    data: job_poster_base64_string,
                                    mimeType: job_poster_mimetype,
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

            const job_poster_output = job_poster_result.response.text();

            if (job_poster_output === "Job Requirements not contains job requirements") {
                return {
                    errors: true,
                    response: "job_poster_is_invalid",
                }
            }

            return {
                errors: false,
                response: job_poster_output
            }

        default:
            const validatedJobText = textSchema.safeParse({
                job_text: formData.job_text
            })

            if (!validatedJobText.success) {
                return {
                    errors: true,
                    response: "validation_error",
                }
            }

            const job_text_prompt = `
                You are expert Job Seeker Analyzer over 10 years experience. Extract Input Text into Job Requirement.Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output in Paragraph with List of Job Requirements. provide Company Name if Exist.

                **Input Text:** ${validatedJobText.data.job_text}

                If Input Text is not Job Requirements, return:
                "Job Requirements not contains job requirements"
            `

            const job_text_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: job_text_prompt,
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

            const job_text_output = job_text_result.response.text();

            if (job_text_output === "Job Requirements not contains job requirements\n") {
                return {
                    errors: true,
                    response: "job_poster_is_invalid",
                }
            }

            return {
                errors: false,
                response: job_text_output
            }
    }
}

/**
 * Analyze a candidate's CV against a job description to provide a comprehensive
 * assessment of the candidate's suitability for the role.
 * @param {Object} formData - Form data containing the role, CV, job type, and job
 *     description.
 * @returns {Object} An object with the following properties: `errors` (a boolean
 *     indicating if there are errors), `candidate` (the output of the candidate
 *     analysis), `revision` (the output of the CV revision), and `interview` (the
 *     output of the interview questions and answers).
 */
export const analyzeCandidate = async (formData: z.infer<typeof candidateSchema>) => {
    const validatedCandidate = candidateSchema.safeParse({
        role: formData.role,
        cv: formData.cv,
        job_type: formData.job_type,
        job_poster: formData.job_poster
    })

    if (!validatedCandidate.success) {
        return {
            errors: true,
            response: "validation_error",
        }
    }

    switch (validatedCandidate.data.role) {
        case 'candidate':
            const candidate_prompt = `
                Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output JSON and generate in one format:
                    {
                        "cv_friendly": boolean,
                        "job_requirements": boolean,
                        "result": JSON (result output),
                    }
                .
                **Job Requirements** : ${validatedCandidate.data.job_poster}.
                if not real or Invalid, the output only return:
                {
                    "cv_friendly": false,
                    "job_requirements": false,
                    "result": "Job Requirements not contains job requirements",
                }
                .
                If it is real job requirements, continue to analyze CV.
                **CV** : ${validatedCandidate.data.cv}.
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
    
                *   **CV:** ${validatedCandidate.data.cv}
                *   **Job Posting:** ${validatedCandidate.data.job_poster}
    
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

            const candidate_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: candidate_prompt,
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

            const candidate_output = candidate_result.response.text();

            const revision_prompt = `
                You are an expert in the field of CV/Resume creation and Job Seeker Coach.
                Your task is to create or improve existing CVs to be a professional, credible CV and ATS friendly that easily catches the attention of the HR team at the company being applied to, ultimately leading to a 100% job matching.
                *   **Analysis Result Before:** ${candidate_output}.
                *   **CV:** ${validatedCandidate.data.cv}
                *   **Job Posting:** ${validatedCandidate.data.job_poster}

                Please use the following information:

                **[Section 1: Personal Information]**
                *   Full Name: [Your Full Name]
                *   Phone Number: [Your Phone Number]
                *   Email Address: [Your Email Address]
                *   LinkedIn Profile (Optional): [Your LinkedIn Profile URL. If does not exist, create one
                *   Address (Optional): [Your Full Address]. If does not exist, create one
                *   Website (Optional): [Your Personal Website]. If does not exist, create one

                **[Section 2: Professional Summary/Profile]**
                *   Write a brief professional summary (maximum 4-5 sentences) that highlights your experience, skills, and career goals. Focus on what you can offer to the company. Use keywords relevant to the position you are targeting.
                    *Example:  Results-driven digital marketing professional with 5+ years of experience increasing brand visibility and generating qualified leads. Expertise in SEO, social media, and content marketing. Seeking a challenging role where I can leverage my skills to drive company growth.*

                **[Section 3: Work Experience]**
                *   For each work experience (starting with the most recent):
                    *   Job Title: [Your Job Title]
                    *   Company Name: [Company Name]
                    *   Company Address: [Company Address]
                    *   Dates of Employment: [Month Year Started] - [Month Year Ended] (or "Present")
                    *   Job Description: Use bullet points to describe your responsibilities and accomplishments. **Use *numbers* and *action verbs* to demonstrate the impact you made.** Focus on quantifiable results.
                        *Example:*
                            *   *Increased* organic traffic by 30% in 6 months through a comprehensive SEO strategy.
                            *   *Managed* a marketing budget of $100,000 and *delivered* a 200% ROI.
                            *   *Led* a team of 5 in a new product launch that *resulted in* a 15% increase in sales.

                **[Section 4: Education]**
                *   For each education (starting with the most recent):
                    *   Degree: [Your Degree]
                    *   Major: [Your Major]
                    *   Institution Name: [Institution Name]
                    *   Dates Attended: [Year Started] - [Year Ended]
                    *   GPA (Optional): [Your GPA]. If does not exist, create one
                    *   Awards/Achievements (Optional): [List any relevant awards or achievements]. If does not exist, create one

                **[Section 5: Skills]**
                *   List your relevant skills. Group them by category if possible (e.g., Technical Skills, Soft Skills, Languages). Indicate your proficiency level (e.g., Expert, Proficient, Basic) if relevant.
                    *Example:*
                        *   *Technical Skills:* SEO (Expert), Google Analytics (Expert), Content Marketing (Expert), Microsoft Office Suite (Expert), Adobe Creative Suite (Proficient)
                        *   *Soft Skills:* Communication, Leadership, Teamwork, Problem-solving, Time Management

                **[Section 6: Awards & Certifications (Optional)]**
                *   If applicable, list any awards and certifications relevant to the jobs you are applying for. If does not exist, please provide example which match the job requirements:
                    *name: [Name of Award/Certification],
                    *institution: [Institution Issuing the Award/Certification],
                    *date: [Date Awarded],

                **[Section 7: Activities & Interests (Optional)]**
                *   List any relevant organizational activities, volunteer work, or interests that can showcase your personality and skills. If does not exist, please provide example which match the job requirements.

                **[Section 8: Projects (Optional)]**
                *   If applicable, list any projects you have worked on in the past. If does not exist, please provide example which match the job requirements:
                    *name: [Name of Award/Certification],
                    *description: [Description of the Project],

                **Additional Instructions:**

                *   **Target Job/Industry:** [Specify the type of job or industry you are targeting. This will help the AI tailor the language and keywords used.]
                *   **Format:** Use a common and easy-to-read CV (resume) format. Prioritize readability and clarity. Consider using a modern and professional CV template.
                *   **Length:** Aim for a CV that is no more than 2 pages long.
                *   **Language:** Use standard and professional English.
                *   **Keywords:** Ensure your CV contains keywords relevant to the jobs you are applying for. Research keywords commonly used in job descriptions in your target industry.
                *   **Tone:** Use a confident, positive, and professional tone.
                *   **Revision:** After the CV is generated, double-check the grammar, spelling, and formatting.

                **I want you to generate a CV that is:**

                *   **ATS-Friendly:** Easily scannable by Applicant Tracking Systems.
                *   **Visually Appealing:** Visually appealing and easy to read.
                *   **Relevant:** Highlights the experience and skills most relevant to the jobs I am targeting.
                *   **Professional:** Reflects my professionalism and competence.

                Make sure to fullfill All Sections above.
                Output in JSON format. Structure the assessment in a JSON format for easy parsing and display in the application.
            `;

            const revision_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: revision_prompt,
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

            const revision_output = revision_result.response.text();

            const interview_prompt = `
                You are an HR/recruiter with over 20 years of experience and you are looking for the best candidate for your company.
                *   **Analysis Result Before:** ${candidate_output}.

                Your task is to analyze the following candidate's CV:

                ${validatedCandidate.data.cv}

                And the following Job Requirements:

                ${validatedCandidate.data.job_poster}

                Based on the information above, create:

                1.  **A list of 10 HRD interview questions that are most likely to be asked to this candidate.** The questions should be relevant to the candidate's experience, alignment with company culture, motivation, salary expectations, and long-term potential in the company. Include a brief explanation of why each question is important to ask. also provide tips and tricks how to answer these questions.

                2.  **A list of 10 User/Technical interview questions that are most likely to be asked to this candidate.** The questions should focus on the required technical skills, relevant experience with similar projects, problem-solving abilities, understanding of the industry, and ability to adapt to new technologies. Include a brief explanation of why each question is important to ask. also provide tips and tricks how to answer these questions.

                3.  **Identify up to 10 potential areas that might be 'red flags' or concerns based on the candidate's CV and the Job Requirements.** Explain why these areas are concerning and what follow-up questions could be asked to gather more in-depth information.

                4.  **Provide advice on how best to gather information about [Specify 1-10 specific Skills/Experience that are most important for this position] during the interview process.** Include examples of behavioral questions that can be used.

                **Answer Format:**

                Use the following format to present your answers:

                **I. HRD Interview Questions:**

                *   Question 1: [Question] - Reason: [Explanation] - Ansrwer Tips: [How to Answer]
                *   Question 2: [Question] - Reason: [Explanation] - Ansrwer Tips: [How to Answer]
                *   ... (up to 10 questions)

                **II. User/Technical Interview Questions:**

                *   Question 1: [Question] - Reason: [Explanation] - Ansrwer Tips: [How to Answer]
                *   Question 2: [Question] - Reason: [Explanation] - Ansrwer Tips: [How to Answer]
                *   ... (up to 10 questions)

                **III. Potential 'Red Flags':**

                *   Area 1: [Description of Area] - Reason: [Explanation] - Follow-up Question: [Question]
                *   Area 2: [Description of Area] - Reason: [Explanation] - Follow-up Question: [Question]
                *   Area 3: [Description of Area] - Reason: [Explanation] - Follow-up Question: [Question]
                *   ... (up to 10)

                **Additional Instructions:**

                *   Provide answers that are specific and relevant to the information provided in the CV and Job Requirements.
                *   Prioritize questions that can uncover core competencies and the candidate's suitability for the company's needs.
                *   Use professional and easy-to-understand language.
                *   Focus on gathering information that will assist in making informed recruitment decisions.
                *   Use formal and systematic language.
                *   Avoid generic questions (e.g., "Tell me about yourself?"). Focus on questions based on the resume (CV) and job description.
                *   For technical questions, adjust the difficulty to the seniority level being sought (entry/mid/senior).
                *   If the job requirements mention company values (e.g., innovation, collaboration), integrate those values into the HR questions.

                Make sure to fullfill All Information above.
                Output in JSON format. Structure the assessment in a JSON format for easy parsing and display in the application.
            `;

            const interview_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: interview_prompt,
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

            const interview_output = interview_result.response.text();

            return {
                errors: false,
                candidate: candidate_output,
                revision: revision_output,
                interview: interview_output
            }
        
        //----HRD----
        default:
            const hrd_prompt = `
                You are a recruitment assistant for HRD/Recruiters. Your task is to analyze a candidate's CV and a job description to provide a comprehensive assessment of the candidate's suitability for the role, including a percentage match score. The goal is to streamline the initial screening process and provide recruiters with a clear, concise, and actionable overview.

                **Instructions:**

                1.  **Thoroughly Analyze the CV:** Extract all relevant information from the candidate's CV (PDF format), including education, work experience, skills, certifications, and any other pertinent details.
                2.  **Deconstruct the Job Description:** Analyze the job description (PDF or Image format) to identify the essential requirements, desired qualifications, key responsibilities, and the company culture fit.
                3.  **Compare CV and Job Description:**  Compare the extracted information from the CV against the requirements and preferences outlined in the job description.
                4.  **Assign Weights to Requirements:** Assign a weight to each requirement in the job description based on its importance (e.g., Essential = 50%, Desirable = 30%, Nice-to-Have = 20%). This is implicitly based on the content of the Job Description.  You do *not* need outside information to assign weights.
                5.  **Calculate Match Score:** Calculate a percentage match score based on the candidate's fulfillment of the weighted requirements. This score should reflect the overall alignment between the CV and the job description. Show your work in the JSON response so the user can understand how the score was generated.
                6.  **Identify Strengths & Weaknesses:**  Pinpoint the candidate's key strengths that align with the job requirements and any weaknesses or gaps in their experience, skills, or qualifications.  Quantify strengths and weaknesses where possible (e.g., "5 years of experience in project management" vs. "lacks experience in Agile methodologies").
                7.  **Assess Culture Fit (If Possible):**  Based on information available in the job description and any clues in the CV (e.g., volunteer work, hobbies), assess the potential culture fit of the candidate with the company. This is often subjective, so clearly state the rationale.
                8.  **Generate a Concise Summary:**  Produce a concise summary of the candidate's suitability, including the percentage match score and a clear recommendation (e.g., "Strongly Recommend," "Recommend with Reservations," "Do Not Recommend") with a rationale.
                9.  **Output in JSON Format:**  Structure the analysis in a JSON format that is easy to parse and integrate into recruitment management systems.

                **Input:**

                *   **Candidate CV (PDF):** ${validatedCandidate.data.cv}
                *   **Job Description:** ${validatedCandidate.data.job_poster}

                **Output (JSON):**
                {
                "candidate_summary": {
                    "overall_recommendation": "[Strongly Recommend/Recommend with Reservations/Do Not Recommend]",
                    "match_percentage": "[Percentage Match Score (e.g., 85%)]. return in integer",
                    "rationale": "[Concise explanation for the recommendation and match score (2-3 sentences max)]"
                },
                "scoring_breakdown": {
                    "essential_requirements": {
                        "score": "[Score achieved by candidate on essential requirements (e.g., 40% out of 50%)]. return in integer",
                        "details": "[Brief explanation of how the score for essential requirements was calculated]"
                    },
                    "desirable_requirements": {
                        "score": "[Score achieved by candidate on desirable requirements (e.g., 20% out of 30%)]. return in integer",
                        "details": "[Brief explanation of how the score for desirable requirements was calculated]"
                    },
                    "nice_to_have_requirements": {
                        "score": "[Score achieved by candidate on nice-to-have requirements (e.g., 10% out of 20%)]. return in integer",
                        "details": "[Brief explanation of how the score for nice-to-have requirements was calculated]"
                    },
                },
                "skill_match": {
                    "matching_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "proficiency": "[Candidate's demonstrated proficiency (e.g., Expert, Proficient, Basic) - based on CV]",
                            "notes": "[Optional: Short note about where this skill is demonstrated in the CV]"
                        }
                    ],
                    "missing_skills": [
                        {
                            "skill": "[Skill name from Job Description]",
                            "reason": "[Why the candidate is missing this skill (e.g., no mention in CV, insufficient experience)]"
                        }
                    ]
                },
                "experience_match": {
                    "relevant_experience": [
                    {
                        "company": "[Company Name from CV]",
                        "role": "[Role Title from CV]",
                        "duration": "[Duration in Role from CV]",
                        "responsibilities": "[Key responsibilities from CV that align with job description]"
                    }
                    ],
                    "irrelevant_experience": "[Brief summary of experience that is not directly relevant to the job]"
                },
                "education_match": {
                    "degree": "[Degree from CV]",
                    "major": "[Major from CV]",
                    "institution": "[Institution from CV]",
                    "meets_requirements": "[Does the education meet the job requirements? Yes/No]",
                    "notes": "[Optional: Any notes on the relevance or quality of the education]"
                },
                "culture_fit_assessment": {
                    "potential_fit": "[Likelihood of culture fit (High/Medium/Low)]",
                    "rationale": "[Explanation of the potential culture fit based on available information]"
                },
                "red_flags": [
                    "[List of potential red flags identified in the CV (e.g., unexplained gaps in employment, frequent job changes)]"
                ],
                "notes_for_recruiter": "[Any additional notes or observations for the recruiter to consider]"
                }
            `

            const hrd_result = await model.generateContent({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: hrd_prompt,
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

            const hrd_output = hrd_result.response.text();
            
            return {
                errors: false,
                response: hrd_output
            }
    }
}
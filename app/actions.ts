'use server'

import { NextResponse } from 'next/server'

import { GoogleGenerativeAI } from "@google/generative-ai";

import { z } from 'zod';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const fileSchema = z.object({
    file: z
        .instanceof(File, { message: "Wajib memilih file" })
        .refine((file) => file.type === "application/pdf", {
            message: "File harus berupa PDF",
        })
        .refine((file) => file.size <= 1 * 1024 * 1024, {
            message: "Ukuran file maksimal 1 MB",
        }),
    job_text: z.string().min(100, {
        message: "Job Text must be at least 100 characters.",
    }),
});

export default async function analyzeCV(formData: z.infer<typeof fileSchema>) {
    const validatedFields = fileSchema.safeParse({
        file: formData.file,
        job_text: formData.job_text,
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
        Check Job Requirements are Real Job Requirements. at least have 3 job requirements. Format output JSON and generate in one format:
            {
                "cv_friendly": boolean,
                "job_requirements": boolean,
                "result": JSON (result output),
            }
        .
        if not real, the output only return:
        {
            "cv_friendly": false,
            "job_requirements": false,
            "result": "Job Requirements not contains job requirements",
        }
        .
        If it is real job requirements, continue to analyze CV.
        **Job Requirements** : ${validatedFields.data.job_text}.
        You are an expert recruiter, CV Analyzer, HRD. Detect and Analyze Document is CV. Analyze the CV against the job requirements. Extract All Data Document into CV Data. Format output JSON:
            {
                "cv_friendly": boolean,
                "result": JSON (result output),
            }
        .
        if Document not CV, return:
            {
                "cv_friendly": false,
                "result": "Document not CV",
            }
        .
        if Document is CV, comparing a CV against job requirements.
        **Job Requirements:**
        ${validatedFields.data.job_text}.

        Consider skills, experience, education, and keywords.  Provide the following:

        1.  **Overall Match Percentage:** A percentage representing how well the CV aligns with the requirements (0-100%).  Be conservative; do not inflate the percentage.

        2.  **Strengths:** List 5-10 specific strengths of the candidate based on the CV and how they relate to the requirements.  Be specific and provide evidence from the CV.

        3.  **Areas for Improvement:** List 5-10 areas where the CV is lacking compared to the requirements, or where the candidate needs to improve their skills/experience. Be specific and explain why these areas are important for the role.  Indicate if these are critical gaps or minor deficiencies.

        4.  **Skills Gap Analysis:**  Create a table of skills from the requirements, indicating if the candidate has the skill (Yes/No/Partial) and a brief justification.  Include 5-10 of the most important skills.  Example:

            | Skill           | Has Skill? | Justification                                                                   |
            |-----------------|------------|-------------------------------------------------------------------------------|
            | Node.js         | Yes        | The CV mentions experience building Node.js APIs.                               |
            | React           | Partial    | The CV mentions "JavaScript" but doesn't explicitly state React experience. |
            | Cloud Deployment| No         | The CV doesn't mention any cloud deployment experience (AWS, Azure, GCP).      |

        5. **Summary:** A brief paragraph summarizing the overall suitability of the candidate for the role, highlighting the key strengths and weaknesses.

        6. **Recommendation: ** List 5-10 Best Trick & Tips Action to Improve standout CV and reach 90-100% Match.

        Be concise and professional in your response. Prioritize accuracy and relevance.
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
        }
    });

    const geminiOutput = result.response.text();

    return {
        response: geminiOutput,
    }
}
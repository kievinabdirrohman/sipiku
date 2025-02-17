import { z } from 'zod';

import { isValidJobPosterMimeType } from './helper';

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
    role: z.enum(["candidate", "hrd"]),
    cv: z.string().min(100),
    job_type: z.enum(["file", "text"]),
    job_poster: z.string().min(100),
});
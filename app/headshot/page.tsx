"use client"

import { useCallback, useRef, useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileUp, OctagonX, X, FileIcon, Info, Loader2, BadgeCheck, ArrowBigLeft, InfoIcon, Download } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { motion, AnimatePresence } from "framer-motion";
import { pusherClient } from '@/lib/pusher'

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import Resume from "@/components/pages/resume";

import { cn } from "@/lib/utils"
import { cvSchema } from "@/lib/schema";

import { analyzeCandidate, analyzeCV, analyzeJobPoster, transformPhoto } from "../actions";
import StepIndicator from "@/components/Stepper/StepIndicator";
import DetailedAnalysis from "@/components/Result/Analysis/DetailedAnalysis";
import ExperienceAnalysis from "@/components/Result/Analysis/ExperienceAnalysis";
import Recommendations from "@/components/Result/Analysis/Recommendations";
import ScoringBreakdown from "@/components/Result/Analysis/ScoringBreakdown";
import SkillAnalysis from "@/components/Result/Analysis/SkillAnalysis";
import TopSection from "@/components/Result/Analysis/TopSection";
import { HRDQuestions } from "@/components/Result/Interview/HRDQuestions";
import { RedFlags } from "@/components/Result/Interview/RedFlags";
import { TechnicalQuestions } from "@/components/Result/Interview/TechnicalQuestions";
import { TabNavigation } from "@/components/Result/Interview/TabNavigation";
import { CandidateAssessment } from "@/components/Result/HR/candidate-assessment";
import { CandidateSummary } from "@/components/Result/HR/candidate-summary";
import { CultureFitAssessment } from "@/components/Result/HR/culture-fit-assessment";
import { EducationMatch } from "@/components/Result/HR/education-match";
import { ExperienceMatch } from "@/components/Result/HR/experience-match";
import { NotesForRecruiter } from "@/components/Result/HR/notes-for-recruiter";
import { SkillMatch } from "@/components/Result/HR/skill-match";
import { Warnings } from "@/components/Result/HR/warnings";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/pages/file-uploader";

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const generateRecaptchaToken = async (action: string) => {
    try {
        return await window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action }
        )
    } catch (error) {
        console.error('reCAPTCHA error:', error)
        throw new Error('Failed to generate reCAPTCHA token')
    }
}

export default function Headshot() {
    useEffect(() => {
        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}`
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])
    
    const { toast } = useToast()
    const [step, setStep] = useState<"form" | "processing" | "result">("form")
    const [hasUsed, setHasUsed] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [headshot, setHeadshot] = useState<string | null>(null)
    const [gender, setGender] = useState<string>("male")
    const [ethnicity, setEthnicity] = useState<string>("asian")
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [facePhoto, setFacePhoto] = useState<File | null>(null)

    const handleFileChange = (file: File | null) => {
        if (file && file.type !== "application/pdf") {
            toast({
                title: "Unsupported file format",
                description: "Please upload a PDF file.",
                variant: "destructive",
            })
            return
        }
        setCvFile(file)
    }

    const handleFacePhotoChange = (file: File | null) => {
        // New function for face photo
        if (file && !file.type.startsWith("image/")) {
            toast({
                title: "Unsupported file format",
                description: "Please upload an image file (JPG, PNG, etc).",
                variant: "destructive",
            })
            return
        }
        setFacePhoto(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!cvFile) {
            toast({
                title: "CV is required",
                description: "Please upload your CV in PDF format.",
                variant: "destructive",
            })
            return
        }

        if (!facePhoto) {
            toast({
                title: "Face photo is required",
                description: "Please upload your face photo.",
                variant: "destructive",
            })
            return
        }

        setStep("processing")

        try {
            const token = await generateRecaptchaToken(gender)

            const formData = new FormData()
            formData.append("cv", cvFile)
            formData.append("photo", facePhoto)
            formData.append("gender", gender)
            formData.append("ethnicity", ethnicity)
            formData.append("recaptcha_token", token)

            const headshotUrl = await transformPhoto(formData)

            if (headshotUrl?.errors === false) {
                setHeadshot(headshotUrl.data!)
                setHasUsed(true)
                setProgress(100)
                setStep("result")
            }
        } catch (error) {
            toast({
                title: "An error occurred",
                description: "Failed to generate headshot. Please try again later.",
                variant: "destructive",
            })
            setStep("form")
        }
    }

    const handleDownload = () => {
        if (headshot) {
            // In a real implementation, this would download the actual image
            const link = document.createElement("a")
            link.href = headshot
            link.download = "headshot-ai.png"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                title: "Headshot downloaded successfully",
                description: "Your AI headshot has been downloaded successfully.",
            })
        }
    }

    const handleReset = () => {
        // In a real implementation, this would be limited or disabled
        setStep("form")
        setProgress(0)
    }

    return (
        <div className="flex justify-center">
            <div className="relative mb-12 w-1/3">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl md:text-3xl">Get a Professional AI Headshot for Your CV</CardTitle>
                        <CardDescription className="max-w-2xl mx-auto">
                            Use AI to generate a professional headshot that will make your CV stand out. Upload your CV, select your gender and ethnicity (for AI accuracy), and get a high-quality headshot in minutes.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {step === "form" && (
                            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                                <div className="space-y-2">
                                    <Label htmlFor="cv-upload">
                                        Upload CV (PDF)
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <FileUploader
                                        id="cv-upload"
                                        onFileChange={handleFileChange}
                                        accept=".pdf"
                                        maxSize={1 * 1024 * 1024} // 5MB
                                        disabled={hasUsed}
                                    />
                                    {hasUsed && (
                                        <p className="text-sm text-amber-600">
                                            You have already used your chance to get a professional AI headshot.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="face-photo-upload">
                                        Upload Face Photo
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <FileUploader
                                        id="face-photo-upload"
                                        onFileChange={handleFacePhotoChange}
                                        accept=".jpg,.jpeg,.png"
                                        maxSize={1 * 1024 * 1024} // 5MB
                                        disabled={hasUsed}
                                        showPreview={true}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload your face photo with good lighting and a clean background.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        We use gender data to enhance the AI's accuracy in generating appropriate headshots. This data will be processed anonymously.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <RadioGroup
                                        id="gender"
                                        value={gender}
                                        onValueChange={setGender}
                                        className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                                        disabled={hasUsed}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="male" id="male" />
                                            <Label htmlFor="male">Male</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="female" id="female" />
                                            <Label htmlFor="female">Female</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="ethnicity">Ethnicity</Label>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="h-4 w-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">
                                                        We use ethnicity data to improve the accuracy of our AI in generating headshots. This data
                                                        will be processed anonymously.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Select value={ethnicity} onValueChange={setEthnicity} disabled={hasUsed}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ethnicity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asian">Asian</SelectItem>
                                            <SelectItem value="african">African</SelectItem>
                                            <SelectItem value="european">European</SelectItem>
                                            <SelectItem value="american">American</SelectItem>
                                            <SelectItem value="middle_eastern">Middle Eastern</SelectItem>
                                            <SelectItem value="pacific_islander">Pacific Islander</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={hasUsed || !cvFile || !facePhoto}>
                                    Generate My Headshot
                                </Button>

                                {hasUsed && headshot && (
                                    <div className="flex justify-center">
                                        <Button type="button" variant="outline" onClick={() => setStep("result")}>
                                            View My Headshot
                                        </Button>
                                    </div>
                                )}
                            </form>
                        )}

                        {step === "processing" && (
                            <div className="space-y-8 py-10">
                                <h3 className="text-xl font-semibold text-center">Generating Your Headshot...</h3>
                                <Progress value={progress} className="h-2 w-full" />
                                <p className="text-center text-muted-foreground">
                                    Please wait, our AI is generating a professional headshot for you. This may take a few minutes.
                                </p>
                            </div>
                        )}

                        {step === "result" && headshot && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-center">Your AI Headshot is Ready!</h3>

                                <div className="flex justify-center">
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 border rounded-lg overflow-hidden">
                                        <img src={headshot || "/placeholder.svg"} alt="AI Generated Headshot" className="object-cover" />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button onClick={handleDownload} className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Download Headshot
                                    </Button>

                                    <Button variant="outline" onClick={handleReset}>
                                        Back to Form
                                    </Button>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                                    <p>
                                        <strong>Note:</strong> You can only use this feature once. Please make sure you are satisfied with your
                                        headshot before leaving this page.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 text-sm text-muted-foreground">
                        <p className="text-center max-w-2xl mx-auto">
                            The quality of the AI-generated headshot may vary depending on the quality of the CV you upload and the data you provide.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
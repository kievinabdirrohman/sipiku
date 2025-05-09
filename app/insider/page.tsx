"use client"

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileUp, OctagonX, X, FileIcon, Info, Loader2, BadgeCheck, ArrowBigLeft, InfoIcon, Download, GraduationCap, Briefcase, ClockAlert } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query'

import { pusherClient } from '@/lib/pusher'
import { cn } from "@/lib/utils"
import { generateRecaptchaToken, getUser } from "@/lib/helper";
import { cvSchema } from "@/lib/schema";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import Resume from "@/components/pages/resume";
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
import { CandidateSummary } from "@/components/Result/HR/candidate-summary";
import { CultureFitAssessment } from "@/components/Result/HR/culture-fit-assessment";
import { EducationMatch } from "@/components/Result/HR/education-match";
import { ExperienceMatch } from "@/components/Result/HR/experience-match";
import { NotesForRecruiter } from "@/components/Result/HR/notes-for-recruiter";
import { SkillMatch } from "@/components/Result/HR/skill-match";
import { Warnings } from "@/components/Result/HR/warnings";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import LoadingPage from "@/components/LoadingPage";

import { analyzeCandidate, analyzeCV, analyzeJobPoster } from "./actions";

export default function JobAnalyzer() {
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

    const { data: dataHRD } = useQuery({
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

    const { data: dataLinkedIn } = useQuery({
        queryKey: ['linkedinProfile'],
        queryFn: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('linkedin_analysis')
                .select('profile, result')
                .eq('email', user);

            return data
        }
    });

    const steps = [
        { label: "Pick CV" },
        { label: "Pick Job" },
        { label: "Result" }
    ];

    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(0);
    const [cvFile, setCVFile] = useState<File | null>(null);
    const [jobFile, setJobFile] = useState<File | null>(null);
    const [selectedJobPoster, setSelectedJobPoster] = useState<File | null>(null);
    const [selectedJobType, setSelectedJobType] = useState<string>("file");
    const [selectedRole, setSelectRole] = useState<string>("candidate");
    const [pending, setPending] = useState<boolean>(false);
    const [candidate, setCandidate] = useState<string>("");
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [updatedCV, setUpdatedCV] = useState<any>();
    const [analysis, setAnalysis] = useState<any>();
    const [interview, setInterview] = useState<any>();
    const [dataHR, setDataHR] = useState<any>();
    const [dataLinkedInProfile, setDataLinkedInProfile] = useState<any>();
    const [cvMessage, setCVMessage] = useState<string | null>(null);
    const [jobMessage, setJobMessage] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState<string | null>("Analyzing...");
    const [activeTab, setActiveTab] = useState("hrd")
    const [isHistoryCandidate, setIsHistoryCandidate] = useState<boolean>(false);
    const [isHistoryHRD, setIsHistoryHRD] = useState<boolean>(false);
    const [isLinkedIn, setIsLinkedIn] = useState<boolean>(false);
    const [openLinkedIn, setOpenLinkedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleOpenLinkedIn = (isOpen: boolean) => {
        setOpenLinkedIn(isOpen);
    };

    useEffect(() => {
        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}`
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    useEffect(() => {
        const channel = pusherClient.subscribe('result')

        channel.bind('get-result', (message: string) => {
            setProgressMessage(message)
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
        }
    }, [])

    const cv_form = useForm<z.infer<typeof cvSchema>>({
        resolver: zodResolver(cvSchema),
        defaultValues: {
            role: "candidate",
            file: undefined,
            recaptcha_token: "",
            using_linkedin: false,
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setCVFile(selectedFile);
            cv_form.setValue("file", selectedFile);
        }
    }, [cv_form]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
    });

    const removeFile = () => {
        setCVFile(null);
        cv_form.reset();
    };

    const cv_onsubmit = async (values: z.infer<typeof cvSchema>) => {
        setCVMessage(null);
        setPending(true);
        setCandidate("");
        try {
            const token = await generateRecaptchaToken(values.role)

            values.recaptcha_token = token;

            const response = await analyzeCV(values);

            if (response.errors === false) {
                setCandidate(response.response);

                if (currentStep < steps.length - 1) {
                    setCurrentStep((prev) => prev + 1);
                }
            }

            if (response.response === 'cv_is_invalid') {
                setCVMessage("CV is Invalid!");
            }
        } catch (error) {
            setCVMessage("Whoops! Something went wrong.");
        } finally {
            setPending(false);
        }
    }

    const job_form = useForm<any>({
        defaultValues: {
            job_type: "file",
        },
    });

    const onDropJob = useCallback((acceptedFilesJob: File[]) => {
        const selectedFileJob = acceptedFilesJob[0];
        if (selectedFileJob) {
            setJobFile(selectedFileJob);
            job_form.setValue("job_poster", selectedFileJob);
        }
    }, [job_form]);

    const { getRootProps: getRootPropsJob, getInputProps: getInputPropsJob, isDragActive: isDragActiveJob } = useDropzone({
        onDrop: onDropJob,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        },
        maxFiles: 1,
    });

    const removeFileJob = () => {
        setJobFile(null);
        job_form.reset();
    };

    const job_onsubmit = async (values: any) => {
        setJobMessage(null);
        setPending(true);
        setIsFinished(false);
        setUpdatedCV(null);
        setAnalysis(null);
        setInterview(null);
        setDataHR(null);

        try {
            if (selectedJobType === "file" && jobFile === null) {
                setJobMessage("File must be selected");
                return;
            }

            if (selectedJobType === "file" && jobFile && jobFile.size > 1 * 1024 * 1024) {
                setJobMessage("File size must be a maximum of 1 MB");
                return;
            }

            if ((selectedJobType === "text" && values.job_text === undefined) || (selectedJobType === "text" && values.job_text !== undefined && values.job_text.length < 100)) {
                setJobMessage("Job Text must be at least 100 characters.");
                return;
            }

            const token = await generateRecaptchaToken(values.role)

            values.recaptcha_token = token;

            const response = await analyzeJobPoster({
                role: selectedRole as "candidate" | "hrd",
                cv: candidate,
                job_type: selectedJobType,
                job_text: values.job_text,
                recaptcha_token: values.recaptcha_token,
                ...values
            });

            if (response?.errors === false) {
                setProgressMessage("Getting Analysis...");

                const token = await generateRecaptchaToken(values.role)

                values.recaptcha_token = token;

                const result = await analyzeCandidate({
                    role: selectedRole as "candidate" | "hrd",
                    cv: candidate,
                    job_type: selectedJobType as "file" | "text",
                    job_poster: response?.response,
                    recaptcha_token: values.recaptcha_token,
                });

                setIsFinished(true);

                if (result.data_hrd && result.hrd === true) {
                    setDataHR(JSON.parse(result.data_hrd));
                }

                if (result.revision) {
                    setAnalysis(JSON.parse(result.candidate))
                    setUpdatedCV(JSON.parse(result.revision));
                    setInterview(JSON.parse(result.interview));
                }

                if (currentStep < steps.length - 1) {
                    setCurrentStep((prev) => prev + 1);
                }
            }

            if (response.response === 'job_poster_is_invalid') {
                setJobMessage("Job Requirement is Invalid!");
            }
        } catch (error) {
            setJobMessage("Whoops! Something went wrong.");
        } finally {
            setPending(false);
        }
    }

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

    const handleLoadingComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (data && data.length > 0) {
            const candidateElement = document.getElementById("candidate") as HTMLInputElement | null;
            const hrdElement = document.getElementById("hrd") as HTMLInputElement | null;
            if (candidateElement) {
                setIsHistoryCandidate(true);
                candidateElement.disabled = true;
            }
            hrdElement?.click();
        }

        if (dataHRD && dataHRD.length > 0) {
            const hrdElement = document.getElementById("hrd") as HTMLInputElement | null;
            const candidateElement = document.getElementById("candidate") as HTMLInputElement | null;
            if (hrdElement) {
                setIsHistoryHRD(true);
                hrdElement.disabled = true;
            }
            candidateElement?.click();
        }

        if (dataLinkedIn && dataLinkedIn.length > 0) {
            setIsLinkedIn(true);

            setDataLinkedInProfile(dataLinkedIn[0].profile)
        }

        setIsLoading(false);
    }, [data, dataHRD, dataLinkedIn])

    return (
        <>
            <LoadingPage
                isDoneLoading={!isLoading}
                message="Please Wait"
                onLoadingComplete={handleLoadingComplete}
            />
            {(isHistoryCandidate === false || isHistoryHRD === false) && <div className="flex justify-center">
                {!isLoading && <div className="relative mb-12 w-full md:w-1/3">
                    <div className="flex justify-between relative z-50">
                        {steps.map((step, index) => (
                            <StepIndicator
                                key={index}
                                step={index}
                                currentStep={currentStep}
                                label={step.label}
                            />
                        ))}
                    </div>
                    <div className="hidden md:block absolute top-5 left-5 right-5 h-[2px] bg-gray-200">
                        <div
                            className="h-full bg-black transition-all duration-300"
                            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>}
            </div>}

            {!isLoading && <div className="flex justify-center">
                {(!candidate && !isFinished && !updatedCV) &&
                    <div className="w-full md:w-1/3" >
                        {(isHistoryCandidate === false || isHistoryHRD === false) && <Form {...cv_form}>
                            <form onSubmit={cv_form.handleSubmit(cv_onsubmit)} className="space-y-6" encType="multipart/form-data">
                                <FormField
                                    control={cv_form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem className="space-y-8">
                                            <p className="tomorrow-semibold text-lg text-center">Who are you? <br /> Choose your role for the best results</p>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        setSelectRole(value);
                                                    }}
                                                    defaultValue={field.value}
                                                    className="flex flex-row md:space-x-5 justify-center"
                                                >
                                                    {isHistoryCandidate === false && <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedRole === "candidate" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                                                        <FormControl>
                                                            <RadioGroupItem value="candidate" id="candidate" />
                                                        </FormControl>
                                                        <FormLabel className="tomorrow-medium text-base">
                                                            Job Hunter
                                                        </FormLabel>
                                                    </FormItem>}
                                                    {isHistoryHRD === false && <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedRole === "hrd" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                                                        <FormControl>
                                                            <RadioGroupItem value="hrd" id="hrd" />
                                                        </FormControl>
                                                        <FormLabel className="tomorrow-medium text-base">
                                                            HR/Recruiter
                                                        </FormLabel>
                                                    </FormItem>}
                                                </RadioGroup>
                                            </FormControl>
                                            <Alert variant="warning">
                                                <Info className="h-4 w-4" />
                                                <AlertDescription className="text-sm tomorrow-medium">
                                                    Your choice changes the analysis you get
                                                </AlertDescription>
                                            </Alert>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Separator />
                                {selectedRole === "candidate" && <FormField
                                    control={cv_form.control}
                                    name="using_linkedin"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Use LinkedIn Profile</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={(value) => {
                                                        if (value === true && isLinkedIn === false) {
                                                            setOpenLinkedIn(true);
                                                        } else {
                                                            setCandidate(dataLinkedInProfile);

                                                            if (currentStep < steps.length - 1) {
                                                                setCurrentStep((prev) => prev + 1);
                                                            }
                                                            field.onChange(value);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />}
                                <FormField
                                    control={cv_form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="tomorrow-semibold text-base">Upload CV (.pdf)</FormLabel>
                                            <p className="text-sm !mb-6">We'll look at how it's made, what it says, and any possible problems.</p>
                                            {cvMessage && <Alert variant="destructive" className="!mb-6">
                                                <OctagonX className="h-4 w-4" />
                                                <AlertDescription className="text-sm tomorrow-medium">
                                                    {cvMessage}
                                                </AlertDescription>
                                            </Alert>}
                                            <FormControl>
                                                <div
                                                    {...getRootProps()}
                                                    className={cn(
                                                        "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out",
                                                        "hover:border-primary/50 hover:bg-muted/50",
                                                        isDragActive ? "border-primary bg-muted" : "border-muted-foreground/25",
                                                        cvFile ? "bg-muted/50" : "",
                                                        cv_form.formState.errors.file && "border-destructive"
                                                    )}
                                                >
                                                    <input {...getInputProps()} disabled={pending} />

                                                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                                                        <FileUp
                                                            className={cn(
                                                                "w-12 h-12 transition-transform duration-200",
                                                                isDragActive ? "scale-110 text-primary" : "text-muted-foreground",
                                                                cvFile ? "text-primary" : "",
                                                                cv_form.formState.errors.file && "text-destructive"
                                                            )}
                                                        />

                                                        {cvFile ? (
                                                            <div className="flex items-center gap-2">
                                                                <FileIcon className="w-4 h-4" />
                                                                <span className="text-sm font-medium">{cvFile.name}</span>
                                                                {!pending && <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="w-8 h-8 rounded-full"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeFile();
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <p className="text-sm font-medium">
                                                                        {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        or click to select (PDF files only, max 1 MB)
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button disabled={pending} type="submit" className="w-full text-base py-6">
                                    {pending && (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    )}
                                    {!pending && "Analyze CV Now!"}
                                </Button>
                            </form>
                        </Form>}
                        <div className="space-y-6 mt-6">
                            {(!pending && isHistoryCandidate === true) && <Button onClick={() => {
                                router.push('/insider/result-candidate')
                            }} type="button" className="w-full text-base py-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
                                <GraduationCap className="mr-1" /> Show Job Hunter Result
                            </Button>}
                            {(!pending && isHistoryHRD === true) && <Button onClick={() => {
                                router.push('/insider/result-hrd')
                            }} type="button" className="w-full text-base py-6 bg-teal-100 text-teal-700 hover:bg-teal-200">
                                <Briefcase className="mr-1" /> Show HR/Recruiter Result
                            </Button>}
                        </div>
                    </div>
                }

                {(candidate && !isFinished && !updatedCV) &&
                    <AnimatePresence mode="wait">
                        <motion.div
                            key="content"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={{
                                hidden: { opacity: 0, scale: 0.8, y: 20 },
                                visible: { opacity: 1, scale: 1, y: 0 },
                                exit: { opacity: 0, scale: 0.8, y: 20 },
                            }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            style={{ transformOrigin: "center center" }}
                            className="w-full md:w-1/3"
                        >
                            <Form {...job_form}>
                                <form onSubmit={job_form.handleSubmit(job_onsubmit)} className="space-y-6" encType="multipart/form-data">
                                    <Alert variant="success">
                                        <BadgeCheck className="h-4 w-4" />
                                        <AlertDescription className="text-sm tomorrow-medium">
                                            Your CV looks good. Go to the next step!
                                        </AlertDescription>
                                    </Alert>
                                    <p className="tomorrow-semibold text-lg text-center">Enter the Job Info You Want/Have</p>
                                    <p className="tomorrow-medium text-base text-center !mt-4">Give us info about the job. This helps us analyze things</p>
                                    <FormField
                                        control={job_form.control}
                                        name="job_type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            setSelectedJobType(value);
                                                            if (value === 'text') {
                                                                setSelectedJobPoster(null);
                                                            }
                                                        }}
                                                        defaultValue={field.value}
                                                        className="flex flex-row md:space-x-5 justify-center"
                                                    >
                                                        <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedJobType === "file" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                                                            <FormControl>
                                                                <RadioGroupItem value="file" />
                                                            </FormControl>
                                                            <FormLabel className="tomorrow-medium text-basel">
                                                                Image/PDF
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedJobType === "text" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                                                            <FormControl>
                                                                <RadioGroupItem value="text" />
                                                            </FormControl>
                                                            <FormLabel className="tomorrow-medium text-basel">
                                                                Text/Descriptive
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {jobMessage && <Alert variant="destructive" className="!mb-6">
                                        <OctagonX className="h-4 w-4" />
                                        <AlertDescription className="text-sm tomorrow-medium">
                                            {jobMessage}
                                        </AlertDescription>
                                    </Alert>}
                                    {selectedJobType === "file" && <FormField
                                        control={job_form.control}
                                        name="job_poster"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div
                                                        {...getRootPropsJob()}
                                                        className={cn(
                                                            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out",
                                                            "hover:border-primary/50 hover:bg-muted/50",
                                                            isDragActiveJob ? "border-primary bg-muted" : "border-muted-foreground/25",
                                                            jobFile ? "bg-muted/50" : "",
                                                            job_form.formState.errors.job_poster && "border-destructive"
                                                        )}
                                                    >
                                                        <input {...getInputPropsJob()} disabled={pending} />

                                                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                                                            <FileUp
                                                                className={cn(
                                                                    "w-12 h-12 transition-transform duration-200",
                                                                    isDragActiveJob ? "scale-110 text-primary" : "text-muted-foreground",
                                                                    jobFile ? "text-primary" : "",
                                                                    job_form.formState.errors.job_poster && "text-destructive"
                                                                )}
                                                            />

                                                            {jobFile ? (
                                                                <div className="flex items-center gap-2">
                                                                    <FileIcon className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">{jobFile.name}</span>
                                                                    {!pending && <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="w-8 h-8 rounded-full"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFileJob();
                                                                        }}
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="space-y-2">
                                                                        <p className="text-sm font-medium">
                                                                            {isDragActiveJob ? "Drop your File here" : "Drag & drop your File here"}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            or click to select (Image or PDF files only, max 1 MB)
                                                                        </p>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />}
                                    {selectedJobType === "text" && <FormField
                                        control={job_form.control}
                                        name="job_text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base">Describe the job description below:</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={`Write or Paste Your Job Requirements Here, for example:

Collaborate with development teams and product managers to design and implement robust backend solutions. Build scalable and secure applications, including client-side and server-side architecture. Develop, test, and maintain well-functioning APIs, ensuring performance and reliability. Analyze existing systems and plan refactoring to align with enterprise architecture standards. Implement abstractions to support interchangeable source and destination systems via connectors. Work as part of agile Scrum teams to deliver high-quality solutions.

*Responsibilities
- Be team leader to drive squad to develiver software with quality and on plan.
- Manage team capacity to be able delivery software on plan and priority based.
.....

*Requirements
- Golang (compulsory), RestAPI, SQL, MongoDB
- Bachelor's in Computer Science or related field
.....`}
                                                        className="resize-none h-[400px] border-black"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />}
                                    <Button disabled={pending} type="submit" className="w-full text-base py-6">
                                        {pending && (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {progressMessage}
                                            </>
                                        )}
                                        {!pending && "Analyze Job Requirements Now!"}
                                    </Button>
                                    {!pending && <Button variant='outline' className="w-full text-sm" onClick={() => {
                                        setCandidate("");
                                        if (currentStep > 0) {
                                            cv_form.setValue('using_linkedin', false);
                                            setCurrentStep((prev) => prev - 1);
                                        }
                                    }}><ArrowBigLeft /> Update CV</Button>}
                                </form>
                            </Form>
                        </motion.div>
                    </AnimatePresence>
                }
            </div>}

            {
                (candidate && isFinished && updatedCV) &&
                <>
                    <div className="p-4">
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
                        <h1 className="text-xl md:text-3xl font-bold mb-12 underline decoration-double">Interview Guide</h1>
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
                        <Button variant='outline' className="text-sm mt-10" onClick={() => location.reload()}><ArrowBigLeft /> Back</Button>
                    </div>
                </>
            }

            {
                (isFinished && dataHR) &&
                <>
                    <div className="container mx-auto px-4 py-8 space-y-8">
                        <CandidateSummary data={dataHR.candidate_summary} />
                        <ScoringBreakdown data={dataHR.scoring_breakdown} />
                        <SkillMatch data={dataHR.skill_match} />
                        <ExperienceMatch data={dataHR.experience_match} />
                        <EducationMatch data={dataHR.education_match} />
                        <CultureFitAssessment data={dataHR.culture_fit_assessment} />
                        <RedFlags data={dataHR.red_flags} />
                        <NotesForRecruiter notes={dataHR.notes_for_recruiter} />
                        <Warnings warnings={dataHR.warnings} />
                        <Button variant='outline' className="text-sm mt-16" onClick={() => location.reload()}><ArrowBigLeft /> Back</Button>
                    </div>
                </>
            }

            <AlertDialog open={openLinkedIn} onOpenChange={handleOpenLinkedIn}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>LinkedIn Profile is Incomplete</AlertDialogTitle>
                        <AlertDialogDescription className="text-black">
                            Sorry, you cannot use this feature because data <span className="font-semibold">LinkedIn Profile</span> is incomplete. Please complete first to enable this functionality.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Later</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push('/insider/linkedin')}>Complete Now</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    );
}

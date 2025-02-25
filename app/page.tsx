"use client"

import { useCallback, useRef, useState, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileUp, OctagonX, X, FileIcon, Info, Loader2, BadgeCheck, ArrowBigLeft } from "lucide-react";
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

import { analyzeCandidate, analyzeCV, analyzeJobPoster } from "./actions";
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

const fadeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 },
};

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

export default function Home() {
  const steps = [
    { label: "Pick CV" },
    { label: "Pick Job" },
    { label: "Result" }
  ];

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
  const [cvMessage, setCVMessage] = useState<string | null>(null);
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>("Analyzing...");
  const [activeTab, setActiveTab] = useState("hrd")

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
          console.log(JSON.parse(result.data_hrd))
        }

        if (result.revision) {
          setAnalysis(JSON.parse(result.candidate))
          setUpdatedCV(JSON.parse(result.revision));
          setInterview(JSON.parse(result.interview));

          if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
          }
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
        return <HRDQuestions data={interview.hrd_interview_questions} />
      case "technical":
        return <TechnicalQuestions data={interview.technical_interview_questions} />
      case "redFlags":
        return <RedFlags data={interview.potential_red_flags} />
      default:
        return null
    }
  }


  return (
    <>
      <div className="flex justify-center">
        <div className="relative mb-12 w-1/3">
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
        </div>
      </div>

      <div className="flex justify-center">
        {(!candidate && !isFinished && !updatedCV) &&
          <div className="w-1/3" >
            <Form {...cv_form}>
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
                          className="flex flex-row space-x-5 justify-center"
                        >
                          <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedRole === "candidate" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                            <FormControl>
                              <RadioGroupItem value="candidate" />
                            </FormControl>
                            <FormLabel className="tomorrow-medium text-base">
                              Job Hunter
                            </FormLabel>
                          </FormItem>
                          <FormItem className={`flex items-center space-x-3 space-y-0 border ${selectedRole === "hrd" && "border-black bg-muted"} rounded w-full p-3 justify-center`}>
                            <FormControl>
                              <RadioGroupItem value="hrd" />
                            </FormControl>
                            <FormLabel className="tomorrow-medium text-base">
                              HR/Recruiter
                            </FormLabel>
                          </FormItem>
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
            </Form>
          </div>
        }

        {(candidate && !isFinished && !updatedCV) &&
          <AnimatePresence mode="wait">
            <motion.div
              key="content"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeVariants}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1], // Custom easing for smoother animation
              }}
              style={{ transformOrigin: "center center" }}
              className="w-1/3"
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
                            className="flex flex-row space-x-5 justify-center"
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
                      setCurrentStep((prev) => prev - 1);
                    }
                  }}><ArrowBigLeft /> Update CV</Button>}
                </form>
              </Form>
            </motion.div>
          </AnimatePresence>
        }
      </div>
      {
        (candidate && isFinished && updatedCV) &&
        <>
          <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-center mb-8">Interview Guide</h1>
              <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="mt-8">{renderContent()}</div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">CV Analysis</h1>
            <div className="grid gap-8 md:grid-cols-2">
              <TopSection data={analysis.assessment_summary} />
              <ScoringBreakdown data={analysis.scoring_breakdown} />
            </div>
            <DetailedAnalysis data={analysis.detailed_analysis} />
            <SkillAnalysis data={analysis.skill_analysis} />
            <ExperienceAnalysis data={analysis.experience_analysis} />
            <Recommendations recommendation={analysis.recommendations} warning={analysis.warnings} error={analysis.error} />
          </div>
          <PDFDownloadLink document={<Resume data={updatedCV ?? []} />} fileName="cv_yourname_position.pdf">
            {({ blob, url, loading, error }) =>
              loading ? 'Loading document...' : 'Download now!'
            }
          </PDFDownloadLink>
          <Button variant='outline' className="w-full text-sm" onClick={() => location.reload()}><ArrowBigLeft /> Re-Analyze</Button>
        </>
      }

      {
        (isFinished && dataHR) &&
        <>
          <div className="space-y-8">
            <CandidateSummary data={dataHR.candidate_summary} />
            <ScoringBreakdown data={dataHR.scoring_breakdown} />
            <SkillMatch data={dataHR.skill_match} />
            <ExperienceMatch data={dataHR.experience_match} />
            <EducationMatch data={dataHR.education_match} />
            <CultureFitAssessment data={dataHR.culture_fit_assessment} />
            <RedFlags data={dataHR.red_flags} />
            <NotesForRecruiter notes={dataHR.notes_for_recruiter} />
            <Warnings warnings={dataHR.warnings} />
          </div>
        </>
      }
    </>
  );
}

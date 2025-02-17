"use client"

import { useCallback, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileUp, OctagonX, X, FileIcon, Info, Loader2, BadgeCheck, ArrowBigLeft } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { motion, AnimatePresence } from "framer-motion";

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

const fadeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8, y: 20 },
};

export default function Home() {
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [selectedJobPoster, setSelectedJobPoster] = useState<File | null>(null);
  const [selectedJobType, setSelectedJobType] = useState<string>("file");
  const [selectedRole, setSelectRole] = useState<string>("candidate");
  const [pending, setPending] = useState<boolean>(false);
  const [candidate, setCandidate] = useState<string>("");
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [updatedCV, setUpdatedCV] = useState<any>();
  const [cvMessage, setCVMessage] = useState<string | null>(null);
  const [jobMessage, setJobMessage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>("Analyzing...");

  const cv_form = useForm<z.infer<typeof cvSchema>>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      role: "candidate",
      file: undefined,
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
    try {
      const response = await analyzeCV(values);

      if (response.errors === false) {
        setCandidate(response.response);
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

      const response = await analyzeJobPoster({
        role: selectedRole as "candidate" | "hrd",
        cv: candidate,
        job_type: selectedJobType,
        job_text: values.job_text,
        ...values
      });

      if (response?.errors === false) {
        setProgressMessage("Collecting Result...");

        const result = await analyzeCandidate({
          role: selectedRole as "candidate" | "hrd",
          cv: candidate,
          job_type: selectedJobType as "file" | "text",
          job_poster: response?.response,
        });

        if (result.revision) {
          const new_cv = JSON.parse(result.revision!.replace(/```json\n?|```/g, ''));

          setIsFinished(true);
          setUpdatedCV(new_cv.cv);
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

  return (
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
                {!pending && <Button variant='outline' className="w-full text-sm" onClick={() => setCandidate("")}><ArrowBigLeft /> Update CV</Button>}
              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      }
      {/* <h5>Result</h5>
      <div id="result">

      </div> */}

      {/* <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Resume data={resumeData} />
      </PDFViewer> */}
      {(selectedRole === 'candidate' && isFinished && updatedCV) && <PDFDownloadLink document={<Resume data={updatedCV} />} fileName="resume.pdf">
        {({ blob, url, loading, error }) =>
          loading ? 'Loading document...' : 'Download now!'
        }
      </PDFDownloadLink>}
    </div>
  );
}

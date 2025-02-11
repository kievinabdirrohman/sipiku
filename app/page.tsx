"use client"

import { useCallback, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"

import { cn } from "@/lib/utils"

import analyzeCV from "./actions";

function isValidImageMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return false;
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Add more as needed
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
  // job_text: z.string().min(100, {
  //   message: "Job Text must be at least 100 characters.",
  // }),
  job_text: z.string().optional(),
  image: z
    .instanceof(File, { message: "Wajib memilih file" })
    .refine((file) => isValidImageMimeType(file.type), {
      message: "File harus berupa Gambar",
    })
    .refine((file) => file.size <= 1 * 1024 * 1024, {
      message: "Ukuran file maksimal 1 MB",
    }),
});

export default function Home() {
  const form = useForm<z.infer<typeof fileSchema>>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      job_text: "",
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const onSubmit = (values: z.infer<typeof fileSchema>) => {
    setPending(true);
    analyzeCV(values).then((res) => {
      setPending(false);
      // const resultElement = document.getElementById('result');
      const resultJSON = JSON.parse(res.response!.replace(/```json\n?|```/g, ''));
      console.log(resultJSON)
      
      // if (resultElement && resultJSON.cv_friendly && resultJSON.cv_friendly === true) {
      //   console.log(resultJSON.result)
      //   const list = document.createElement('ul');
      //   list.className = 'list-disc list-inside';
      //   Object.entries(resultJSON.result).forEach(([key, value]) => {
      //     const item = document.createElement('li');
      //     item.textContent = `${key}: ${value}`;
      //     list.appendChild(item);
      //   });
      //   resultElement.innerHTML = '';
      //   resultElement.appendChild(list);
      // } else {
      //   resultElement!.textContent = resultJSON.result;
      // }

    }).finally(() => setPending(false));
  };

  const [pending, setPending] = useState(false);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
          <div className="flex flex-row gap-5">
            <div className="w-full">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV Text</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedFile(file || null);
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full">
            <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CV Text</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedImage(file || null);
                          field.onChange(file);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none h-96"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button disabled={pending} type="submit">Submit</Button>
        </form>
      </Form>
      <h5>Result</h5>
      <div id="result">

      </div>
    </div>
  );
}

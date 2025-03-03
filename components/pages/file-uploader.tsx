"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

interface FileUploaderProps {
    id: string
    onFileChange: (file: File | null) => void
    accept?: string
    maxSize?: number
    disabled?: boolean,
    showPreview?: boolean,
}

export function FileUploader({
    id,
    onFileChange,
    accept = ".pdf",
    maxSize = 5 * 1024 * 1024, // 5MB default
    disabled = false,
    showPreview = false,
}: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileSelect = (selectedFile: File | null) => {
        setError(null)

        if (!selectedFile) {
            setFile(null)
            onFileChange(null)
            return
        }

        // Check file type
        if (accept && !accept.split(",").some((type) => selectedFile.name.endsWith(type.replace(".", "")))) {
            setError(`Unsupported file format. Please upload a ${accept.replace(".", "")} file`)
            return
        }

        // Check file size
        if (maxSize && selectedFile.size > maxSize) {
            setError(`File size is too large. Maximum ${maxSize / (1024 * 1024)}MB`)
            return
        }

        setFile(selectedFile)
        onFileChange(selectedFile)

        if (showPreview && selectedFile.type.startsWith("image/")) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleButtonClick = () => {
        if (fileInputRef.current && !disabled) {
            fileInputRef.current.click()
        }
    }

    const handleRemoveFile = () => {
        setFile(null)
        onFileChange(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
    }

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    return (
        <div className="space-y-2">
            <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleButtonClick}
            >
                <input
                    id={id}
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={accept}
                    onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
                    disabled={disabled}
                />

                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <UploadIcon className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{file ? file.name : "Click to upload or drag and drop"}</p>
                        <p className="text-xs text-muted-foreground">
                            {accept.replace(".", "").toUpperCase()} upto {maxSize / (1024 * 1024)}MB
                        </p>
                    </div>
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {showPreview && previewUrl && (
                <div className="mt-2 mb-2">
                    <div className="relative w-32 h-32 mx-auto border rounded-lg overflow-hidden">
                        <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                </div>
            )}

            {file && (
                <div className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} disabled={disabled}>
                        <XIcon className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                </div>
            )}
        </div>
    )
}


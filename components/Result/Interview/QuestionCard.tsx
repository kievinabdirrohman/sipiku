"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface QuestionCardProps {
    question: string
    goal: string
    answer_framework: string
    recommendation_answer: string
    key_value_targeting?: string
    seniority_level?: string
}

export function QuestionCard({
    question,
    goal,
    answer_framework,
    recommendation_answer,
    key_value_targeting,
    seniority_level,
}: QuestionCardProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <div className="bg-white shadow-md rounded-lg mb-4 overflow-hidden">
            <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className="text-base md:text-lg font-semibold">{question}</h3>
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            {isExpanded && (
                <div className="p-4 border-t">
                    <p className="mb-2">
                        <strong>Goal:</strong> {goal}
                    </p>
                    <p className="mb-2">
                        <strong>Answer Framework:</strong> {answer_framework}
                    </p>
                    <p className="mb-2">
                        <strong>Recommended Answer:</strong> {recommendation_answer}
                    </p>
                    {key_value_targeting && (
                        <p className="mb-2">
                            <strong>Key Value Targeting:</strong> {key_value_targeting}
                        </p>
                    )}
                    {seniority_level && (
                        <p>
                            <strong>Seniority Level:</strong> {seniority_level}
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}


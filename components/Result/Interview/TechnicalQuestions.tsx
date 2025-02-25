"use client"

import { useState } from "react"
import { QuestionCard } from "./QuestionCard"

export function TechnicalQuestions({ data }: any) {
    const [seniorityFilter, setSeniorityFilter] = useState("All")

    const filteredQuestions =
        seniorityFilter === "All"
            ? data
            : data.filter((q: any) => q.seniority_level === seniorityFilter)

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Technical Interview Questions</h2>
            <div className="mb-4">
                <label htmlFor="seniority" className="mr-2">
                    Seniority Level:
                </label>
                <select
                    id="seniority"
                    value={seniorityFilter}
                    onChange={(e) => setSeniorityFilter(e.target.value)}
                    className="border rounded p-1"
                >
                    <option value="All">All</option>
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior-Level">Senior-Level</option>
                </select>
            </div>
            {filteredQuestions.length === 0 && <p className="text-2xl text-center">No questions found.</p>}
            {filteredQuestions.map((q: any, index: number) => (
                <QuestionCard key={index} {...q} />
            ))}
        </div>
    )
}


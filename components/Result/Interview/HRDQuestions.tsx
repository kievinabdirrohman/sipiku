import { QuestionCard } from "./QuestionCard"

export function HRDQuestions({ data }: any) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">HRD Interview Questions</h2>
            {data.map((q: any, index: number) => (
                <QuestionCard key={index} {...q} />
            ))}
        </div>
    )
}


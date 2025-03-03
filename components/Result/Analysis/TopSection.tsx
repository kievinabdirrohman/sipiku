import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TopSection({ data }: any) {
    const overallMatch = data.overall_match_percentage.split("%")[0]

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl font-bold">{overallMatch}%</div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-gray-200 stroke-current"
                            strokeWidth="10"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                        ></circle>
                        <circle
                            className="text-primary stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            strokeDasharray={`${overallMatch * 2.51327} 251.327`}
                            transform="rotate(-90 50 50)"
                        ></circle>
                    </svg>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-y-3">
                    <p className="text-base">
                        <span className="font-semibold">Summary:</span> {data.summary}
                    </p>
                    <p>
                        <span className="font-semibold">Key Strengths:</span> {data.key_strengths}
                    </p>
                    <p>
                        <span className="font-semibold">Areas for Improvement:</span> {data.areas_for_improvement}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}


import { CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CandidateSummary({ data }: any) {
    const getRecommendationIcon = (recommendation: any) => {
        switch (recommendation) {
            case "Strongly Recommend":
                return <CheckCircle className="w-6 h-6 text-green-500" />
            case "Recommend with Reservations":
                return <AlertCircle className="w-6 h-6 text-yellow-500" />
            case "Do Not Recommend":
                return <XCircle className="w-6 h-6 text-red-500" />
            default:
                return null
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Candidate Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    {getRecommendationIcon(data.overall_recommendation)}
                    <span className="text-lg font-semibold">{data.overall_recommendation}</span>
                </div>
                <div className="mb-4">
                    <div className="text-3xl font-bold">{data.match_percentage}%</div>
                    <div className="text-sm text-muted-foreground">Match Percentage</div>
                </div>
                <p className="text-sm">{data.rationale}</p>
            </CardContent>
        </Card>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"


export function CultureFitAssessment({data}: any) {
    const fitPercentage: any = {
        High: 100,
        Medium: 66,
        Low: 33,
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Culture Fit Assessment</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Potential Fit</span>
                            <span className="text-sm font-medium">{data.potential_fit}</span>
                        </div>
                        <Progress value={fitPercentage[data.potential_fit]} className="h-2" />
                    </div>
                    <p className="text-sm">{data.rationale}</p>
                </div>
            </CardContent>
        </Card>
    )
}


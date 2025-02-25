import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ScoringBreakdown({ data }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold mb-2">Essential Requirements</h3>
                    <Progress value={data.essential_requirements.score.split("%")[0]} className="mb-2" />
                    <p className="text-sm">{data.essential_requirements.details}</p>
                </div>
                <div>
                    <h3 className="text-base font-semibold mb-2">Desirable Requirements</h3>
                    <Progress value={data.desirable_requirements.score.split("%")[0]} className="mb-2" />
                    <p className="text-sm">{data.desirable_requirements.details}</p>
                </div>
                <div>
                    <h3 className="text-base font-semibold mb-2">Nice-to-Have Requirements</h3>
                    <Progress value={data.nice_to_have_requirements.score.split("%")[0]} className="mb-2" />
                    <p className="text-sm">{data.nice_to_have_requirements.details}</p>
                </div>
            </CardContent>
        </Card>
    )
}


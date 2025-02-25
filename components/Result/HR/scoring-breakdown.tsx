import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ScoringData {
    [key: string]: {
      score: number;
      details: string;
    };
  }

export function ScoringBreakdown({ data }: { data: ScoringData }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Scoring Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">
                                    {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span className="text-sm font-medium">{value.score}%</span>
                            </div>
                            <Progress value={value.score} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-1">{value.details}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

export default function Recommendations({ recommendation, warning, error }: { recommendation: string, warning: string, error: string }) {
    const recommendations = [recommendation]

    const warnings = [warning]

    const errors = [error]

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Recommendations and Warnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert className="flex-col items-start">
                    <div className="flex items-center gap-x-2 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle className="text-base">Recommendations</AlertTitle>
                    </div>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>

                {(warnings.length > 0 && warnings[0] !== "") && <Alert className="flex-col items-start" variant="warning">
                    <div className="flex items-center gap-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-base">Warnings</AlertTitle>
                    </div>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>}
            </CardContent>
        </Card>
    )
}


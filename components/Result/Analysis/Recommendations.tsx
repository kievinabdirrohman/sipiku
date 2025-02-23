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
                <CardTitle>Recommendations, Warnings, and Errors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Recommendations</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>

                { warnings.length > 0 && <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>}

                {errors.length > 0 && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Errors</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    )
}


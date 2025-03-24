import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, XOctagon } from "lucide-react"

export function Warnings({ warnings }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Warnings and Errors</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="warning" className="flex-col items-start">
                    <div className="flex items-center gap-x-2 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warnings</AlertTitle>
                    </div>
                    <AlertDescription>
                        {warnings}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function RedFlags({ data }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Red Flags</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-1">
                    {data.map((flag: any, index: number) => (
                        <li key={index} className="text-sm">
                            {flag}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}


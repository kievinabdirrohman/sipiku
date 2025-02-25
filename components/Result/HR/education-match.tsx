import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, MinusCircle } from "lucide-react"

export function EducationMatch({ data }: any) {
    const getRequirementIcon = (meetsRequirements: any) => {
        switch (meetsRequirements) {
            case "Yes":
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case "No":
                return <XCircle className="w-5 h-5 text-red-500" />
            default:
                return <MinusCircle className="w-5 h-5 text-gray-500" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Education Match</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p>
                        <span className="font-semibold">Degree:</span> {data.degree}
                    </p>
                    <p>
                        <span className="font-semibold">Major:</span> {data.major}
                    </p>
                    <p>
                        <span className="font-semibold">Institution:</span> {data.institution}
                    </p>
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold">Meets Requirements:</span>
                        {getRequirementIcon(data.meets_requirements)}
                        <span>{data.meets_requirements}</span>
                    </div>
                    <p>
                        <span className="font-semibold">Notes:</span> {data.notes}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}


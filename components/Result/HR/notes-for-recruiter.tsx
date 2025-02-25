import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NotesForRecruiter({ notes }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes for Recruiter</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm">{notes}</p>
            </CardContent>
        </Card>
    )
}


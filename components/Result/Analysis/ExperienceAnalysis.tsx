import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ExperienceAnalysis({ data }: any) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Experience Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <h3 className="text-base font-semibold mb-4">Relevant Experience</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-base text-black">Company</TableHead>
                            <TableHead className="text-base text-black">Role</TableHead>
                            <TableHead className="text-base text-black">Relevance</TableHead>
                            <TableHead className="text-base text-black">Recommendation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.relevant_experience.map((exp: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{exp.company}</TableCell>
                                <TableCell>{exp.role}</TableCell>
                                <TableCell>{exp.relevance}</TableCell>
                                <TableCell>{exp.recommendation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <h3 className="text-base font-semibold mb-4 mt-8">Less Relevant Experience</h3>
                <p className="text-sm">{data.less_relevant_experience}</p>
            </CardContent>
        </Card>
    )
}


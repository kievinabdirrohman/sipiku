import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function SkillAnalysis({ data }: any) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Skill Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <h3 className="text-base font-semibold mb-4">Matching Skills</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-base text-black">Skill</TableHead>
                            <TableHead className="text-base text-black">Evidence in CV</TableHead>
                            <TableHead className="text-base text-black">Recommendation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.matching_skills.map((skill: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{skill.skill}</TableCell>
                                <TableCell>{skill.evidence_in_cv}</TableCell>
                                <TableCell>{skill.recommendation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <h3 className="text-base font-semibold mb-4 mt-8">Missing Skills</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-base text-black">Skill</TableHead>
                            <TableHead className="text-base text-black">Reason</TableHead>
                            <TableHead className="text-base text-black">Recommendation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.missing_skills.map((skill: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{skill.skill}</TableCell>
                                <TableCell>{skill.reason}</TableCell>
                                <TableCell>{skill.recommendation}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Star } from "lucide-react"

export function SkillMatch({ data }: any) {
    const getProficiencyStars = (proficiency: any) => {
        const starCount: any = {
            Expert: 5,
            Proficient: 4,
            Basic: 3,
            "Not Evident": 1,
        }
        return Array(starCount[proficiency])
            .fill(0)
            .map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skill Match</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Matching Skills</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Skill</TableHead>
                                    <TableHead>Proficiency</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.matching_skills.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No matching skills</TableCell></TableRow>}
                                {data.matching_skills.map((skill: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{skill.skill}</TableCell>
                                        <TableCell>
                                            <div className="flex">{getProficiencyStars(skill.proficiency)}</div>
                                        </TableCell>
                                        <TableCell>{skill.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Missing Skills</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Skill</TableHead>
                                    <TableHead>Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.missing_skills.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No missing skills</TableCell></TableRow>}
                                {data.missing_skills.map((skill: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>{skill.skill}</TableCell>
                                        <TableCell>{skill.reason}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


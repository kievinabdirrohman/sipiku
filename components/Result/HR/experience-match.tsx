import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ExperienceMatch({ data }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Experience Match</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Relevant Experience</h3>
                        <div className="space-y-4">
                            {data.relevant_experience.map((experience: any, index: number) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold">{experience.company}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {experience.role} - {experience.duration}
                                        </p>
                                        <p className="text-sm mt-2">{experience.responsibilities}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Irrelevant Experience</h3>
                        <p className="text-sm">{data.irrelevant_experience}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DetailedAnalysis({ data }: any) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="education">
                        <AccordionTrigger>Education</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 ${data.education.suitable ? "text-success" : "text-error"}`}>
                                Suitable: {data.education.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p>{data.education.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="work-experience">
                        <AccordionTrigger>Work Experience</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 ${data.work_experience.suitable ? "text-success" : "text-error"}`}>
                                Suitable: {data.work_experience.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p>{data.work_experience.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="skills">
                        <AccordionTrigger>Skills</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 ${data.skills.suitable ? "text-success" : "text-error"}`}>
                                Suitable: {data.skills.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p>{data.skills.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="other-requirements">
                        <AccordionTrigger>Other Requirements</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 ${data.work_experience.suitable ? "text-success" : "text-error"}`}>
                                Suitable: {data.work_experience.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p>{data.work_experience.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}


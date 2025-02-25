import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DetailedAnalysis({ data }: any) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-lg">Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" defaultValue={["education", "work-experience", "skills", "other-requirements"]} className="w-full">
                    <AccordionItem value="education">
                        <AccordionTrigger className="text-base font-semibold">Education</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 text-sm font-medium ${data.education.suitable === "Yes" ? "text-green-600" : "text-red-600"}`}>
                                Suitable: {data.education.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p className="text-sm font-normal">{data.education.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="work-experience">
                        <AccordionTrigger className="text-base font-semibold">Work Experience</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 text-sm font-medium ${data.work_experience.suitable === "Yes" ? "text-green-600" : "text-red-600"}`}>
                                Suitable: {data.work_experience.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p className="text-sm font-normal">{data.work_experience.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="skills">
                        <AccordionTrigger className="text-base font-semibold">Skills</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 text-sm font-medium ${data.skills.suitable === "Yes" ? "text-green-600" : "text-red-600"}`}>
                                Suitable: {data.skills.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p className="text-sm font-normal">{data.skills.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="other-requirements">
                        <AccordionTrigger className="text-base font-semibold">Other Requirements</AccordionTrigger>
                        <AccordionContent>
                            <p className={`mb-2 text-sm font-medium ${data.work_experience.suitable === "Yes" ? "text-green-600" : "text-red-600"}`}>
                                Suitable: {data.work_experience.suitable === "Yes" ? "Yes" : "No"}
                            </p>
                            <p className="text-sm font-normal">{data.work_experience.detail}</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}


import { AlertTriangle } from "lucide-react"

export function RedFlags({ data }: any) {
    return (
        <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">Potential Red Flags</h2>
            {data.map((flag: any, index: number) => (
                <div key={index} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <div className="flex items-center mb-2">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <h3 className="font-semibold">{flag.area}</h3>
                    </div>
                    <p className="mb-2">
                        <strong>Reason:</strong> {flag.reason}
                    </p>
                    <p>
                        <strong>Follow-up Question:</strong> {flag.follow_up_question}
                    </p>
                </div>
            ))}
        </div>
    )
}


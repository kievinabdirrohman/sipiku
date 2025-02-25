import { User, Code, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react"

interface TabNavigationProps {
    activeTab: string
    setActiveTab: (tab: string) => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
    const tabs = [
        { id: "hrd", label: "HRD Questions", icon: User },
        { id: "technical", label: "Technical Questions", icon: Code },
        { id: "redFlags", label: "Red Flags", icon: AlertTriangle },
    ]

    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${activeTab === tab.id ? "bg-black text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    <tab.icon className="w-5 h-5 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    )
}


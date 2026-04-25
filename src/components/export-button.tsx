"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"

interface ExportButtonProps {
    onExport: () => Promise<string>
    filename: string
    label?: string
}

export function ExportButton({ onExport, filename, label = "Export CSV" }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            const csvData = await onExport()
            const blob = new Blob([csvData], { type: "text/csv" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
        } catch {
            alert("Failed to export data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading}
        >
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Exporting..." : label}
        </Button>
    )
}

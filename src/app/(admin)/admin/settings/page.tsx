import { getSettings } from "@/actions/admin-settings"
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Store Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Configure your store settings and preferences
                </p>
            </div>

            <SettingsForm settings={settings} />
        </div>
    )
}

import { LandingPageForm } from "../landing-page-form"

export default function NewLandingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Create Landing Page</h1>
        <p className="text-sm text-muted-foreground">
          Create a new product landing page
        </p>
      </div>
      <LandingPageForm />
    </div>
  )
}

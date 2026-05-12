interface LandingPageDescriptionProps {
  description: string
}

export function LandingPageDescription({ description }: LandingPageDescriptionProps) {
  return (
    <section id="description" className="py-12 md:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            About This Product
          </h2>
        </div>
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </section>
  )
}

interface LandingPageSpecialtiesProps {
  description: string
  heroImage: string | null
}

function extractFeatures(description: string): { title: string; items: string[] } | null {
  const lines = description.split('\n').filter(line => line.trim())
  
  let title = ''
  const items: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    const stripped = trimmed
      .replace(/^#{1,6}\s*/, '')
      .replace(/^[*\-+]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
    
    if (!stripped) continue
    
    if (!title) {
      title = stripped
    } else if (stripped.length > 100) {
      continue
    } else {
      items.push(stripped)
    }
  }
  
  if (items.length === 0) return null
  
  return { title, items }
}

export function LandingPageSpecialties({ description, heroImage }: LandingPageSpecialtiesProps) {
  const features = extractFeatures(description)
  
  if (!features) return null
  
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight">
              {features.title}
            </h2>
            
            <div className="space-y-3 mb-6">
              {features.items.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            
            <div>
              <a
                href="#checkout"
                className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 text-base"
              >
                এখনই অর্ডার করুন
              </a>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative max-w-md mx-auto lg:mx-0">
              {heroImage ? (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={heroImage}
                    alt="Specialties Image"
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg bg-gray-200 aspect-square flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

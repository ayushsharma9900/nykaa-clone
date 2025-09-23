export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About kaayalife</h1>
        <p className="text-gray-700 mb-6">
          kaayalife is your destination for skincare, makeup, and beauty essentials. We curate
          top brands and emerging favorites to help you build routines that work for you.
        </p>
        <div className="grid gap-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
            <p className="text-gray-700">
              Empower every person to feel confident in their skin by providing quality products,
              helpful guidance, and delightful shopping experiences.
            </p>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">What We Offer</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Curated skincare, makeup, hair care and fragrance</li>
              <li>Clear pricing with savings where possible</li>
              <li>Fast shipping and COD on eligible orders</li>
              <li>Helpful content and community-driven tips</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Use of Service</h2>
            <p className="text-gray-700">By using kaayalife, you agree to follow all applicable laws and these terms.</p>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Orders & Payments</h2>
            <p className="text-gray-700">All orders are subject to acceptance and availability. Prices are subject to change.</p>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Returns</h2>
            <p className="text-gray-700">Refer to our Return Policy for eligibility and process.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

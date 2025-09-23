export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Return Policy</h1>
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
            <p className="text-gray-700">Returns accepted within 7 days of delivery for unopened, unused items.</p>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Process</h2>
            <ol className="list-decimal pl-5 text-gray-700 space-y-1">
              <li>Submit a return request via Help & Support</li>
              <li>Pack items securely with invoice</li>
              <li>We’ll arrange pickup or provide drop-off instructions</li>
            </ol>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Refunds</h2>
            <p className="text-gray-700">Refunds are processed to the original payment method within 5–7 business days after inspection.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

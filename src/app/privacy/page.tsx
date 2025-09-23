export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-700 mb-6">
          We value your privacy. This page outlines what data we collect, how we use it,
          and the choices you have.
        </p>
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Account details (name, email) when you sign up</li>
              <li>Order and address details to fulfill purchases</li>
              <li>Usage data to improve the experience</li>
            </ul>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Provide and improve our services</li>
              <li>Communicate order updates and support</li>
              <li>Detect, prevent, and address issues</li>
            </ul>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Your Choices</h2>
            <p className="text-gray-700">
              You can request data deletion or export by contacting
              <span className="font-medium"> privacy@kaayalife.in</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

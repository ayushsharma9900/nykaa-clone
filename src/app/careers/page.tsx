export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Careers</h1>
        <p className="text-gray-700 mb-6">
          We’re a small, fast-moving team passionate about beauty and great user experiences.
          If you love building products customers adore, we’d love to hear from you.
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold">Frontend Engineer</h2>
            <p className="text-gray-700 mt-2">React, TypeScript, Tailwind, Next.js</p>
            <p className="text-gray-500 text-sm">Remote (India) · Full-time</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold">Product Designer</h2>
            <p className="text-gray-700 mt-2">UI/UX, prototyping, design systems</p>
            <p className="text-gray-500 text-sm">Remote (India) · Contract</p>
          </div>
        </div>
        <p className="text-gray-700 mt-6">
          Send your resume/portfolio to <span className="font-medium">careers@kaayalife.in</span>.
        </p>
      </div>
    </div>
  );
}

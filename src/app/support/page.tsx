"use client";

import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

export default function SupportPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please complete all fields.", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("Thanks! We'll get back to you soon.", "success");
      setForm({ name: "", email: "", message: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
        <p className="text-gray-700 mb-6">Have a question or need help with an order? Send us a message.</p>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Your name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            placeholder="How can we help?"
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-pink-600 text-white px-6 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

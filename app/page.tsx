"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import StructuredData from "@/components/StructuredData";

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/repairs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const problemTypes = [
    { name: "No Power", icon: "⚡" },
    { name: "Not Charging", icon: "🔋" },
    { name: "No Display", icon: "🖥️" },
    { name: "Liquid Damage", icon: "💧" },
    { name: "Short Circuit", icon: "⚠️" },
    { name: "Overheating", icon: "🔥" },
  ];

  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl font-extrabold text-white sm:text-6xl md:text-7xl">
                LaptopFixDB
              </h1>
              <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
                Search through <span className="font-bold text-white">1,500+ laptop repair videos</span> from Electronics Repair School
              </p>
              <p className="mt-2 text-lg text-blue-200">
                Find solutions by brand, model, or problem type
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by brand, model, or problem..."
                    className="flex-1 px-6 py-4 text-lg rounded-xl border-2 border-transparent focus:border-white focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl transition-all transform hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Browse by Problem Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {problemTypes.map((problem) => (
                <Link
                  key={problem.name}
                  href={`/repairs?problem=${encodeURIComponent(problem.name)}`}
                  className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {problem.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {problem.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Smart Search
              </h3>
              <p className="text-gray-600">
                Find repairs by laptop brand, model, or specific problem type
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Video Tutorials
              </h3>
              <p className="text-gray-600">
                Watch detailed repair videos from Sorin's Electronics Repair School
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Detailed Solutions
              </h3>
              <p className="text-gray-600">
                Get troubleshooting steps and solutions for common laptop issues
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to fix your laptop?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Browse our database of repair solutions
            </p>
            <Link
              href="/repairs"
              className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Browse All Repairs
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>
              Video content by{" "}
              <a
                href="https://www.youtube.com/@electronicsrepairschool"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Electronics Repair School
              </a>
            </p>
            <p className="mt-2 text-sm">
              LaptopFixDB - A searchable database of laptop repair solutions
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

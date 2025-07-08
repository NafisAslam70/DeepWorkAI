'use client';

import React from 'react';

export default function WhoThisAppIsFor() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col mt-8 items-center gap-6 animate-fade-in w-full max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold  text-indigo-700 text-center">
          Who This App Is For
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed text-center">
          DeepWork AI is primarily designed for Aspiring Achievers, with tools to master focus and achieve greatness, while also supporting other users.
        </p>
      </div>

      {/* Gradient Line Divider */}
      <div className="relative my-6 flex justify-center w-full">
        <div className="h-1 w-1/2 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"></div>
      </div>

      {/* Target Groups Section */}
      <div className="relative mx-auto py-5 max-w-6xl w-full">
        <h2 className="text-3xl md:text-4xl font-semibold text-indigo-700 mb-6 text-center">
          Meet Your Perfect Fit
        </h2>
        <div className="grid grid-cols-1 gap-8 px-4">
          {/* Group 1: Aspiring Achievers (Highlighted) */}
          <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl border-2 border-indigo-400 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4">
            <div className="flex justify-center mb-6">
              <span className="text-5xl">🌟</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-4 text-center">
              Aspiring Achievers (Primary Focus)
            </h3>
            <p className="text-gray-800 leading-relaxed text-center">
              Individuals craving a holistic cycle of goal setting, execution, and analytics. Perfect for those practicing deep focus and flow states, aiming to excel in their field using their laptop daily. This app is built for you to achieve exceptional greatness!
            </p>
          </div>

          {/* Other Groups Below in Centered Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {/* Group 2: Employers/Bosses */}
            <div className="relative bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-2 text-center">Employers & Managers</h3>
              <p className="text-gray-700 text-center">
                Bosses looking to track employee focus and productivity in a job environment, ensuring teams stay on task with real-time insights.
              </p>
            </div>

            {/* Group 3: Parents */}
            <div className="relative bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex justify-center mb-4">
                <span className="text-4xl">👨‍👧</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo-600 mb-2 text-center">Concerned Parents</h3>
              <p className="text-gray-700 text-center">
                Fathers or guardians wanting to monitor their kids’ homework or tasks, ensuring children stay focused and complete their responsibilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Line Divider */}
      <div className="relative my-12 flex justify-center w-full">
        <div className="h-1 w-1/2 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"></div>
      </div>

      {/* Why Choose DeepWork Section */}
      <div className="relative mx-auto max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4 text-center">
            Why Choose DeepWork AI?
          </h2>
          <p className="text-gray-700 leading-relaxed text-center">
            Primarily for achievers seeking personal excellence, DeepWork AI also supports employers and parents with tailored focus and tracking tools—all from your laptop.
          </p>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative text-center mt-12 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border border-blue-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
            Ready to Unlock Your Greatness?
          </h2>
          <p className="text-gray-800 mb-6 leading-relaxed">
            Start your journey to exceptional focus and success with DeepWork AI, designed for achievers like you!
          </p>
          <a
            href="/dashboard/execute"
            className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all px-8 py-4 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
          >
            Get Started Now →
          </a>
        </div>
      </div>

      {/* Final Quote */}
      <div className="text-center text-gray-600 italic mt-12 max-w-3xl mx-auto w-full">
        Greatness begins with focus—let DeepWork AI guide your path to excellence.
      </div>
    </div>
  );
}
"use client";
import React from "react";

export default function TheStoryPage() {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 px-6 md:px-12 py-16 text-gray-900">
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Ma Ziyang’s Story Section - Centered Video with Text Below */}
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Large Video */}
        <div className="w-full max-w-6xl">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100/50 backdrop-blur-sm bg-white/30 transform hover:scale-105 transition-transform duration-300">
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/YEI1MAditYg?si=rMM9_I7HxZWQdTVE"
              title="Ma Ziyang's Story with DeepWork AI"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        {/* Text Below Video */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-indigo-700">
            Ma Ziyang’s Journey with DeepWork AI
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Meet Ma Ziyang, a hardworking student drowning in deadlines and distractions. He tried to focus, but nothing worked—until his friend Shahid introduced him to DeepWork AI. This app changed everything, helping Ziyang take control, stay focused, and even impress his professor with a stellar project!
          </p>
        </div>
      </div>

      {/* Gradient Line Divider */}
      <div className="relative my-12 flex justify-center">
        <div className="h-1 w-1/2 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full"></div>
      </div>
      {/* Decorative Divider */}
      {/* <div className="relative my-10">
        <div className="absolute inset-0 flex justify-center">
          <svg
            className="w-full h-12 text-indigo-200"
            viewBox="0 0 1440 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,50 Q360,100 720,50 T1440,50" />
          </svg>
        </div>
      </div> */}

      {/* Why DeepWork AI Section - Right Decorative Card, Left Text */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-8 mx-auto">
        <div className="md:w-1/2">
          <div className="relative">
            <div className="w-full h-56 md:h-64 bg-indigo-200 rounded-xl shadow-lg transform rotate-3">
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 flex items-center justify-center transform -rotate-6">
                <span className="text-xl md:text-2xl font-semibold text-indigo-600">🌟 A New Way to Focus</span>
              </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4">
            Why DeepWork AI?
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Feeling overwhelmed like Ziyang? You’re not alone! DeepWork AI is here to make focusing easy and fun. It’s like having a personal coach that helps you set goals, stay on track, and celebrate your wins—no more stress, just progress.
          </p>
        </div>
      </div>

      {/* Gradient Line Divider */}
      {/* <div className="relative my-12 flex justify-center">
        <div className="h-1 w-1/2 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full"></div>
      </div> */}

      {/* How It Helps Section - Overlapping Cards with Icons and Wave Background */}
      <div className="relative mx-auto py-12">
        {/* Wave Background */}
        <div className="absolute inset-0 -z-10">
          <svg
            className="w-full h-full opacity-20"
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#c7d2fe"
              fillOpacity="0.5"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224V0H1392C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0H0V224Z"
            />
          </svg>
        </div>

        <h2 className="text-5xl font-semibold text-indigo-700 mb-12 text-center">
          How DeepWork AI Helps You
        </h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {/* Card 1 - Set Goals */}
          <div className="relative bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-2 z-10">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-indigo-600 mb-2 text-center">Set Goals</h3>
            <p className="text-gray-700 text-center">Plan what you want to achieve, big or small, and let the app guide you step by step.</p>
          </div>

          {/* Card 2 - Stay Focused */}
          <div className="relative bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:-rotate-2 z-20 md:-mt-8">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🧘</span>
            </div>
            <h3 className="text-xl font-semibold text-indigo-600 mb-2 text-center">Stay Focused</h3>
            <p className="text-gray-700 text-center">Work in short sessions, and the app will gently nudge you if you get distracted.</p>
          </div>

          {/* Card 3 - See Results */}
          <div className="relative bg-white/80 backdrop-blur-lg rounded-xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:rotate-2 z-10">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-indigo-600 mb-2 text-center">See Results</h3>
            <p className="text-gray-700 text-center">Track your progress and watch how much you’ve improved over time!</p>
          </div>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex justify-center">
          <svg
            className="w-full h-12 text-purple-200"
            viewBox="0 0 1440 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,50 Q360,0 720,50 T1440,50" />
          </svg>
        </div>
      </div>



      {/* Gradient Line Divider */}
      <div className="relative my-12 flex justify-center">
        <div className="h-1 w-1/2 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full"></div>
      </div>

      {/* Founder’s Story Section - Right Image, Left Text */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-8 mx-auto">
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            {/* Decorative Frame with Glassmorphism Background */}
            <div className="relative p-1 bg-white/30 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg transform -rotate-2 hover:rotate-0 
            transition-transform duration-300">
              {/* Gradient Border Frame */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 -z-10"></div>
              <img
                src="/white2.jpg"
                alt="Nafis Aslam, Founder of DeepWork AI"
                className="w-auto h-96 rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
        <div className="md:w-1/2 bg-white/70 backdrop-blur-lg rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl md:text-3xl font-semibold text-indigo-700 mb-4">
            Why I Created DeepWork AI – Nafis’s Story
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Hi, I’m Nafis Aslam, the founder of DeepWork AI. Back in 2023, I was a student at Universiti Sains Malaysia, struggling to focus just like Ziyang. After a tough presentation, I knew I had to change. I turned to books like <strong>Deep Work</strong> and worked hard to improve my grades—from 3.11 to 3.65 in a year! I created DeepWork AI to help others like me and Ziyang find focus and achieve their dreams, no matter how busy life gets.
          </p>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex justify-center">
          <svg
            className="w-full h-12 text-indigo-200"
            viewBox="0 0 1440 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,50 Q360,100 720,50 T1440,50" />
          </svg>
        </div>
      </div>

      {/* Call to Action Section - Centered with Decorative Border */}
      <div className="relative text-center">
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200 p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-indigo-800 mb-4">
            Ready to Focus Like Ziyang?
          </h2>
          <p className="text-gray-800 mb-6 leading-relaxed">
            DeepWork AI is here to help you take control, stay focused, and achieve your goals—just like Ziyang did. Don’t wait, start your journey today!
          </p>
          <a
            href="/dashboard/execute"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all px-8 py-4 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
          >
            Try DeepWork AI Now →
          </a>
        </div>
      </div>
    </div>
  );
}
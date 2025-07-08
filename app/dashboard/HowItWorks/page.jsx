'use client';

import React from 'react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 text-gray-900 overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-8 py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-800 text-center leading-tight">
          How DeepWork AI Enhances Your Focus
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed text-center max-w-3xl">
          Unlock the power of distraction-free productivity with DeepWork AI, driven by the DeepLens Engine for Focus (DLEF) and cutting-edge computer vision technology.
        </p>
      </div>

      {/* Decorative Divider */}
      <div className="relative my-10 flex justify-center w-full">
        <div className="h-1 w-3/4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
      </div>

      {/* What is Deep Work Section */}
      <div className="flex flex-col md:flex-row items-center gap-10 mx-auto max-w-7xl px-6 py-12">
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6">
            What is Deep Work?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Deep Work, a concept popularized by Cal Newport, refers to professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit. These efforts create new value, improve skills, and are hard to replicate. DeepWork AI helps you achieve this state by monitoring and optimizing your focus in real-time.
          </p>
        </div>
        <div className="md:w-1/2">
          <div className="relative w-full h-80 bg-gray-100 rounded-2xl shadow-xl overflow-hidden">
            <img
              src="/Deep-Work.jpg"
              alt="Cal Newport, Author of Deep Work"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-center font-semibold">
                Cal Newport, Author of <em>Deep Work</em>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Defining Focus and Distraction Section */}
      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-100 p-10 shadow-2xl transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6 text-center">
            Defining Focus and Distraction
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
            DeepWork AI identifies focus as sustained, uninterrupted engagement with your task. Distractions are detected through webcam cues, categorized as Phone Usage, Absent, Drowsy, Looking Away, or Bad Posture. Using a YOLOv11n-cls model, combined with MediaPipe for gaze and posture tracking and Eye Aspect Ratio (EAR) for drowsiness, we ensure precise, real-time focus monitoring tailored to your unique work environment.
          </p>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="relative my-10 flex justify-center w-full">
        <div className="h-1 w-3/4 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
      </div>

      {/* DeepLens Engine Section */}
      <div className="flex flex-col md:flex-row items-center gap-10 mx-auto max-w-7xl px-6 py-12">
        <div className="md:w-1/2">
          <div className="relative w-full h-72 bg-indigo-100 rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-3xl border border-indigo-200 flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-indigo-700">🔬 DeepLens Engine</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-100 p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6">
            DeepLens Engine for Focus (DLEF)
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            The DeepLens Engine for Focus (DLEF) powers DeepWork AI, using your webcam to analyze facial expressions, gaze, posture, and objects in real-time. This intelligent system leverages advanced computer vision and machine learning to keep you in the zone.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative mx-auto py-16 max-w-7xl px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-12 text-center">
          How It Works – Step by Step
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '📷',
              title: 'Webcam Input',
              description: 'Your webcam captures frames every second, feeding them to our system for analysis during focus sessions.',
            },
            {
              icon: '🧠',
              title: 'Focus Classification',
              description: 'A YOLOv11n-cls model classifies your state as Focused, Phone, Absent, Drowsy, Looking Away, or Bad Posture.',
            },
            {
              icon: '🔍',
              title: 'Auxiliary Analysis',
              description: 'MediaPipe tracks gaze and posture, YOLOv8 detects phones, and EAR monitors drowsiness for enhanced accuracy.',
            },
            {
              icon: '✅',
              title: 'Decision Logic',
              description: 'Temporal smoothing validates predictions, ensuring reliable and consistent focus detection.',
            },
          ].map((step, index) => (
            <div
              key={index}
              className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex justify-center mb-4">
                <span className="text-5xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-3 text-center">{step.title}</h3>
              <p className="text-gray-700 text-center">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Wave Divider */}
      <div className="relative my-12 w-full">
        <svg
          className="w-full h-16 text-indigo-100"
          viewBox="0 0 1440 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,50 Q360,100 720,50 T1440,50" />
        </svg>
      </div>

      {/* 20/30 Heuristic Section */}
      <div className="flex flex-col md:flex-row-reverse items-center gap-10 mx-auto max-w-7xl px-6 py-12">
        <div className="md:w-1/2">
          <div className="relative w-full h-72 bg-purple-100 rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-3xl border border-purple-200 flex items-center justify-center">
              <span className="text-2xl md:text-3xl font-bold text-purple-700">⏱️ Sustained Focus</span>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-100 p-8 shadow-2xl transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6">
            The 20/30 Heuristic
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To ensure sustained focus, our system evaluates 30-second intervals. If 20 or more frames (66%) show you as focused, the interval is marked "Focused." Otherwise, it’s flagged as "Distracted," highlighting the primary distraction source.
          </p>
        </div>
      </div>

      {/* Logging & Analytics Section */}
      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-100 p-10 shadow-2xl transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6 text-center">
            Logging & Analytics
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
            Every 30 seconds, DeepWork AI logs your focus state, generating actionable insights. The Focus Analytics dashboard tracks focus time, identifies common distractions, and visualizes your progress over time.
          </p>
        </div>
      </div>

      {/* Science Behind Focus Detection */}
      <div className="relative mx-auto py-16 max-w-7xl px-6">
        <div className="absolute inset-0 -z-10">
          <svg
            className="w-full h-full opacity-10"
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#c7d2fe"
              fillOpacity="0.3"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224V0H1392C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0H0V224Z"
            />
          </svg>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-indigo-800 mb-12 text-center">
          The Science Behind Focus Detection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🤖',
              title: 'YOLOv11n-cls',
              description: 'Classifies your focus state with high precision using advanced machine learning.',
            },
            {
              icon: '📱',
              title: 'YOLOv8',
              description: 'Detects objects like phones to pinpoint distraction sources accurately.',
            },
            {
              icon: '👁️',
              title: 'MediaPipe FaceMesh',
              description: 'Tracks gaze and facial landmarks for detailed focus analysis.',
            },
            {
              icon: '😴',
              title: 'EAR (Eye Aspect Ratio)',
              description: 'Monitors blink rates to detect drowsiness and ensure sustained attention.',
            },
            {
              icon: '⚙️',
              title: 'Intelligent Heuristics',
              description: 'Filters noise and stabilizes results for reliable focus tracking.',
            },
          ].map((tech, index) => (
            <div
              key={index}
              className="relative bg-white/90 backdrop-blur-md rounded-2xl border border-indigo-100 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex justify-center mb-4">
                <span className="text-5xl">{tech.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-3 text-center">{tech.title}</h3>
              <p className="text-gray-700 text-center">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative text-center py-16 max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl border border-indigo-300 p-10 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-6">
            Master Your Focus Today
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Transform your productivity with DeepWork AI’s focus monitoring. Harness the DeepLens Engine to eliminate distractions and achieve deep work.
          </p>
          <a
            href="/dashboard/execute"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-10 py-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Start with DeepWork AI →
          </a>
        </div>
      </div>

      {/* Final Quote */}
      <div className="text-center text-gray-600 italic text-lg py-12 max-w-4xl mx-auto">
        “Deep work is the ability to focus without distraction on a cognitively demanding task. It’s a skill that allows you to quickly master complicated information and produce better results in less time.” — Cal Newport
      </div>
    </div>
  );
}
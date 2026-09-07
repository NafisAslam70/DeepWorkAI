/* app/dashboard/layout.jsx */
"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./_components/Sidebar";
import Header  from "./_components/Header";

export default function DashboardLayout({ children }) {
  const pathname   = usePathname();
  const hideChrome = pathname.startsWith("/dashboard/execute/timer-window");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!hideChrome && (
        <div className="fixed inset-y-0 left-0 z-30 hidden w-64 md:block">
          <Sidebar />
        </div>
      )}

      {!hideChrome && mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close navigation" className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw] shadow-2xl" onClick={(event) => { if (event.target.closest("a")) setMobileSidebarOpen(false); }}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className={`${hideChrome ? "" : "md:ml-64"} flex-1 flex flex-col`}>
        {/* Header */}
        {!hideChrome && (
          <div className="fixed top-0 left-0 md:left-64 right-0 z-20 h-16">
            <Header onOpenSidebar={() => setMobileSidebarOpen(true)} />
          </div>
        )}

        {/* Page content */}
        <div
          className={`flex-1 h-screen overflow-auto overflow-x-hidden relative
            ${hideChrome ? "" : "pt-16 bg-gray-100"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

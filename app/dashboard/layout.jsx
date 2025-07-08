/* app/dashboard/layout.jsx */
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header  from "./_components/Header";

export default function DashboardLayout({ children }) {
  const pathname   = usePathname();
  const hideChrome = pathname.startsWith("/dashboard/execute/timer-window");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {!hideChrome && (
        <div className="fixed inset-y-0 left-0 w-64 z-30">
          <Sidebar />
        </div>
      )}

      {/* Main content area */}
      <div className={`${hideChrome ? "" : "ml-64"} flex-1 flex flex-col`}>
        {/* Header */}
        {!hideChrome && (
          <div className="fixed top-0 left-0 md:left-64 right-0 z-20 h-16">
            <Header />
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

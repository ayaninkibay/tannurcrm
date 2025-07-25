// src/app/layout.js
"use client";

import React from "react";
import Dashboard from "./Dashboard";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="flex h-screen">
          <Dashboard />
          <div className="flex-1 bg-gray-100 p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

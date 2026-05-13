"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useState } from "react";

export default function QueriesPage() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [desc, setDesc] = useState("");
  const [variables, setVariables] = useState("");

  const handleSave = async () => {
    const res = await fetch("/api/queries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        query,
        description: desc,
        variables,
      }),
    });

    const data = await res.json();

    alert(data.message || data.error);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-800">
            Query Management
          </h1>

          <p className="mt-2 text-green-700">
            Save and manage reusable SQL queries securely.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white shadow-2xl border border-green-200 p-8 max-w-4xl">

          {/* Query Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              Query Name
            </label>

            <input
              type="text"
              placeholder="Enter query name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full
                rounded-xl
                border-2
                border-green-200
                bg-green-50
                px-4
                py-3
                text-gray-800
                outline-none
                transition
                focus:border-green-500
                focus:ring-4
                focus:ring-green-200
              "
            />
          </div>

          {/* SQL Query */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              SQL Query
            </label>

            <textarea
              placeholder="SELECT * FROM users WHERE id = :id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={8}
              className="
                w-full
                rounded-xl
                border-2
                border-green-200
                bg-green-50
                font-mono
                px-4
                py-4
                outline-none
                transition
                focus:border-green-500
                focus:ring-4
                focus:ring-green-200
              "
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              Description
            </label>

            <input
              type="text"
              placeholder="Short description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="
                w-full
                rounded-xl
                border-2
                border-green-200
                bg-green-50
                px-4
                py-3
                text-gray-800
                outline-none
                transition
                focus:border-green-500
                focus:ring-4
                focus:ring-green-200
              "
            />
          </div>

          {/* Variables */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-green-800 mb-2">
              Variables JSON
            </label>

            <textarea
              placeholder='{"id":"number"}'
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              rows={4}
              className="
                w-full
                rounded-xl
                border-2
                border-green-200
                bg-green-50
                font-mono
                px-4
                py-4
                outline-none
                transition
                focus:border-green-500
                focus:ring-4
                focus:ring-green-200
              "
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="
              w-full
              rounded-xl
              bg-gradient-to-r
              from-green-600
              to-emerald-500
              px-6
              py-4
              text-lg
              font-semibold
              text-white
              shadow-lg
              transition-all
              hover:scale-[1.02]
              hover:shadow-green-300
              active:scale-[0.99]
            "
          >
            Save Query
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
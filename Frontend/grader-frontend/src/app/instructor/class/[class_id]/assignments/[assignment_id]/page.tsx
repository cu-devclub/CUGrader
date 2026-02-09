"use client";

import React from "react";
import TopBar from "@/components/submission-TopBar";
import Header from "@/components/submission-header";

const students = [
  { id: 1, name: "Student Name" },
  { id: 2, name: "Student Name" },
];

const problems = [
  "Median of Two Sorted Arrays",
  "Longest Common Prefix",
  "Median of Two Sorted Arrays",
  "Median of Two Sorted Arrays",
  "Median of Two Sorted Arrays",
];

export default function Page() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      <TopBar></TopBar>

      {/* Tabs */}
      <div className="flex gap-8 border-b mb-6 ml-25 mr-25">
        <button className="pb-2 border-b-2 border-pink-500 font-semibold">
          Submission
        </button>
        <button className="pb-2 text-gray-500">Detail</button>
      </div>

      {/* Assignment Header */}
      <Header></Header>

      {/* Submission Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 ml-25 mr-25">
        {/* Filters */}
        <div className="flex gap-6 items-center mb-4 text-sm">
          <div>
            <label className="block text-gray-500">Search</label>
            <input className="border rounded px-2 py-1" placeholder="Search" />
          </div>

          <div>
            <label className="block text-gray-500">Sort</label>
            <select className="border rounded px-2 py-1">
              <option>Name A-Z</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-500">Section</label>
            <div className="flex gap-2">
              <button className="border px-2 rounded">‹</button>
              <span>1</span>
              <button className="border px-2 rounded">›</button>
            </div>
          </div>

          <div>
            <label className="block text-gray-500">Group</label>
            <div className="flex gap-2">
              <button className="border px-2 rounded">‹</button>
              <span>1</span>
              <button className="border px-2 rounded">›</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 border-b">Student Name</th>
                {problems.map((p, i) => (
                  <th key={i} className="text-left p-3 border-b min-w-[180px]">
                    <div className="text-xs text-gray-400 text-center mb-1">
                      {i === 0 ? "2/30" : i === 2 ? "1/30" : "0/30"}
                    </div>
                    <div className="text-sm font-medium">{p}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-sm">
                      🙂
                    </div>
                    {s.name}
                  </td>

                  {problems.map((_, i) => (
                    <td key={i} className="p-3 align-top">
                      {i === 0 || i === 2 ? (
                        <div>
                          <div className="border border-pink-300 text-pink-600 rounded px-2 py-1 inline-block text-sm font-medium">
                            20/100
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            18 May 2025 17:34
                          </div>
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

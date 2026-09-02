'use client'
import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function DynamicRoutePage() {
    const params = useParams()
    const searchParams = useSearchParams()

    // Extract dynamic route parameters
    const { id, year_sem } = params

    // Extract query parameters
    const section = searchParams.get('section')
    const studentId = searchParams.get('studentId')

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Next.js Dynamic Routing Demo
                    </h1>
                    <p className="text-gray-600">
                        This page demonstrates how dynamic routing works in Next.js with multiple parameters.
                    </p>
                </div>

                {/* Current Route Information */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">Current Route Information</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Route Pattern:</span> <code className="bg-gray-100 px-2 py-1 rounded">/example/dynamic_route_example/[id]/[year_sem]</code></p>
                        <p><span className="font-medium">Current URL:</span> <code className="bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.pathname + window.location.search : 'Loading...'}</code></p>
                    </div>
                </div>

                {/* Dynamic Parameters */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Dynamic Route Parameters</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-green-700">ID Parameter [id]:</span>
                                <div className="bg-white p-2 mt-1 rounded border">
                                    {id || 'Not provided'}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-green-700">Year/Semester [year_sem]:</span>
                                <div className="bg-white p-2 mt-1 rounded border">
                                    {year_sem || 'Not provided'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Query Parameters</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="font-medium text-purple-700">Section:</span>
                                <div className="bg-white p-2 mt-1 rounded border">
                                    {section || 'Not provided'}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium text-purple-700">Student ID:</span>
                                <div className="bg-white p-2 mt-1 rounded border">
                                    {studentId || 'Not provided'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Example Links */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4">Try These Example Routes</h3>
                    <div className="grid gap-3">
                        <Link
                            href="/example/dynamic_route_example/COMP1001/2024-fall"
                            className="block bg-white p-3 rounded border hover:bg-yellow-100 transition-colors"
                        >
                            <code className="text-sm">/example/dynamic_route_example/COMP1001/2024-fall</code>
                        </Link>
                        <Link
                            href="/example/dynamic_route_example/COMP2050/2025-spring?section=A&studentId=12345"
                            className="block bg-white p-3 rounded border hover:bg-yellow-100 transition-colors"
                        >
                            <code className="text-sm">/example/dynamic_route_example/COMP2050/2025-spring?section=A&studentId=12345</code>
                        </Link>
                        <Link
                            href="/example/dynamic_route_example/MATH1010/2024-summer?section=B"
                            className="block bg-white p-3 rounded border hover:bg-yellow-100 transition-colors"
                        >
                            <code className="text-sm">/example/dynamic_route_example/MATH1010/2024-summer?section=B</code>
                        </Link>
                    </div>
                </div>

                {/* How It Works */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">How Dynamic Routing Works</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700">1. File Structure</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Files in square brackets like <code>[id]</code> and <code>[year_sem]</code> create dynamic route segments.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700">2. Accessing Parameters</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                Use <code>useParams()</code> hook to access dynamic route parameters and <code>useSearchParams()</code> for query parameters.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700">3. URL Structure</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                <code>/example/dynamic_route_example/[id]/[year_sem]</code> matches URLs like <code>/example/dynamic_route_example/COMP1001/2024-fall</code>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                        href="/example"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        ← Back to Examples
                    </Link>
                </div>
            </div>
        </div>
    )
}

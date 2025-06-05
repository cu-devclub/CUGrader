import React from 'react'
import Link from 'next/link'

export default function ExamplePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Next.js Examples (Made with 💖 by kafiling for frontend team)</h1>
                <p className="text-gray-600 mb-8">
                    This is the examples page. Here you can find various demonstrations of Next.js features.
                </p>

                <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dynamic Routing Demo</h2>
                        <p className="text-gray-600 mb-4">
                            Learn how dynamic routing works in Next.js with multiple parameters and query strings.
                        </p>
                        <Link
                            href="/example/dynamic_route_example/COMP1001/2024-fall?section=A&studentId=12345"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            View Dynamic Routing Demo
                        </Link>
                    </div>

                    {/* Placeholder for future examples */}
                    <div className="border border-gray-200 rounded-lg p-6 opacity-50">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">More Examples Coming Soon</h2>
                        <p className="text-gray-600">
                            Additional Next.js feature demonstrations will be added here.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

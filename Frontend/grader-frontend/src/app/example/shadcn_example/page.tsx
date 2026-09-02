'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    BookOpen,
    Users,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Plus,
    Download,
    Eye,
    Edit,
    Trash2,
    Code,
    Trophy,
    TrendingUp,
    Calendar,
    Upload
} from 'lucide-react'
import Link from 'next/link'

// Types
interface Student {
    id: string
    name: string
    email: string
    avatar: string
    totalAssignments: number
    completedAssignments: number
    avgScore: number
    lastSubmission: string
    status: 'active' | 'inactive' | 'pending'
}

interface Assignment {
    id: string
    title: string
    description: string
    dueDate: string
    maxScore: number
    submissions: number
    totalStudents: number
    avgScore: number
    status: 'draft' | 'active' | 'grading' | 'completed'
    language: string
}

interface Submission {
    id: string
    studentName: string
    studentId: string
    assignmentTitle: string
    submittedAt: string
    score: number | null
    maxScore: number
    status: 'pending' | 'grading' | 'graded' | 'late'
    testsPassed: number
    totalTests: number
}

// Mock Data
const mockStudents: Student[] = [
    {
        id: 'S001',
        name: 'Alice Chen',
        email: 'alice.chen@student.edu',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=alice',
        totalAssignments: 8,
        completedAssignments: 7,
        avgScore: 92.5,
        lastSubmission: '2025-06-04',
        status: 'active'
    },
    {
        id: 'S002',
        name: 'Bob Martinez',
        email: 'bob.martinez@student.edu',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=bob',
        totalAssignments: 8,
        completedAssignments: 6,
        avgScore: 87.3,
        lastSubmission: '2025-06-03',
        status: 'active'
    },
    {
        id: 'S003',
        name: 'Carol Johnson',
        email: 'carol.johnson@student.edu',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=carol',
        totalAssignments: 8,
        completedAssignments: 8,
        avgScore: 95.2,
        lastSubmission: '2025-06-05',
        status: 'active'
    },
    {
        id: 'S004',
        name: 'David Park',
        email: 'david.park@student.edu',
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=david',
        totalAssignments: 8,
        completedAssignments: 5,
        avgScore: 78.9,
        lastSubmission: '2025-06-01',
        status: 'inactive'
    }
]

const mockAssignments: Assignment[] = [
    {
        id: 'A001',
        title: 'Binary Search Tree Implementation',
        description: 'Implement a complete binary search tree with insertion, deletion, and traversal methods.',
        dueDate: '2025-06-10',
        maxScore: 100,
        submissions: 32,
        totalStudents: 35,
        avgScore: 85.6,
        status: 'active',
        language: 'Python'
    },
    {
        id: 'A002',
        title: 'Graph Algorithms',
        description: 'Implement Dijkstra\'s algorithm and BFS/DFS traversals.',
        dueDate: '2025-06-15',
        maxScore: 120,
        submissions: 28,
        totalStudents: 35,
        avgScore: 78.4,
        status: 'grading',
        language: 'Java'
    },
    {
        id: 'A003',
        title: 'Dynamic Programming Challenge',
        description: 'Solve classic DP problems including knapsack and longest common subsequence.',
        dueDate: '2025-06-20',
        maxScore: 150,
        submissions: 0,
        totalStudents: 35,
        avgScore: 0,
        status: 'draft',
        language: 'C++'
    }
]

const mockSubmissions: Submission[] = [
    {
        id: 'SUB001',
        studentName: 'Alice Chen',
        studentId: 'S001',
        assignmentTitle: 'Binary Search Tree Implementation',
        submittedAt: '2025-06-04 14:30',
        score: 95,
        maxScore: 100,
        status: 'graded',
        testsPassed: 19,
        totalTests: 20
    },
    {
        id: 'SUB002',
        studentName: 'Bob Martinez',
        studentId: 'S002',
        assignmentTitle: 'Binary Search Tree Implementation',
        submittedAt: '2025-06-05 09:15',
        score: null,
        maxScore: 100,
        status: 'grading',
        testsPassed: 15,
        totalTests: 20
    },
    {
        id: 'SUB003',
        studentName: 'Carol Johnson',
        studentId: 'S003',
        assignmentTitle: 'Graph Algorithms',
        submittedAt: '2025-06-05 16:45',
        score: null,
        maxScore: 120,
        status: 'pending',
        testsPassed: 0,
        totalTests: 25
    }
]

export default function InstructorDashboard() {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'draft': return 'bg-gray-100 text-gray-800'
            case 'grading': return 'bg-blue-100 text-blue-800'
            case 'completed': return 'bg-green-100 text-green-800'
            case 'graded': return 'bg-green-100 text-green-800'
            case 'late': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'graded': return <CheckCircle className="w-4 h-4" />
            case 'grading': return <Clock className="w-4 h-4" />
            case 'pending': return <AlertCircle className="w-4 h-4" />
            case 'late': return <XCircle className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Instructor Dashboard</h1>
                        <p className="text-slate-600 mt-1">CS 2050 - Data Structures & Algorithms | Spring 2025</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Assignment
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">35</div>
                            <p className="text-xs text-slate-600">+2 from last semester</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                            <BookOpen className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-slate-600">1 due this week</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
                            <Clock className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-slate-600">Awaiting grading</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                            <TrendingUp className="h-4 w-4 text-slate-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">87.2%</div>
                            <p className="text-xs text-slate-600">+5.3% from last assignment</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="assignments" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="assignments" className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Assignments</span>
                        </TabsTrigger>
                        <TabsTrigger value="students" className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Students</span>
                        </TabsTrigger>
                        <TabsTrigger value="submissions" className="flex items-center space-x-2">
                            <Code className="w-4 h-4" />
                            <span>Submissions</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4" />
                            <span>Analytics</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-6">
                        <div className="grid gap-6">
                            {mockAssignments.map((assignment) => (
                                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl">{assignment.title}</CardTitle>
                                                <CardDescription className="text-sm">{assignment.description}</CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit Assignment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Upload Test Cases
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-600">Due Date</p>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium">{assignment.dueDate}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-600">Language</p>
                                                <Badge variant="secondary">{assignment.language}</Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-600">Max Score</p>
                                                <span className="text-sm font-medium">{assignment.maxScore} pts</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-600">Status</p>
                                                <Badge className={getStatusColor(assignment.status)}>
                                                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Submissions Progress</span>
                                                <span>{assignment.submissions}/{assignment.totalStudents}</span>
                                            </div>
                                            <Progress
                                                value={(assignment.submissions / assignment.totalStudents) * 100}
                                                className="h-2"
                                            />
                                        </div>
                                        {assignment.avgScore > 0 && (
                                            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">Class Average</span>
                                                    <span className="text-lg font-semibold text-slate-900">{assignment.avgScore}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Students Tab */}
                    <TabsContent value="students" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Performance Overview</CardTitle>
                                <CardDescription>Track student progress and engagement</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead>Average Score</TableHead>
                                            <TableHead>Last Submission</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar>
                                                            <AvatarImage src={student.avatar} />
                                                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{student.name}</div>
                                                            <div className="text-sm text-slate-600">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="text-sm">
                                                            {student.completedAssignments}/{student.totalAssignments} completed
                                                        </div>
                                                        <Progress
                                                            value={(student.completedAssignments / student.totalAssignments) * 100}
                                                            className="h-2 w-24"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={student.avgScore >= 90 ? 'default' : student.avgScore >= 80 ? 'secondary' : 'destructive'}>
                                                        {student.avgScore}%
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {student.lastSubmission}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(student.status)}>
                                                        {student.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                                                            <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Submissions Tab */}
                    <TabsContent value="submissions" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Submissions</CardTitle>
                                <CardDescription>Monitor and grade student code submissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Assignment</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Tests</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mockSubmissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>
                                                    <div className="font-medium">{submission.studentName}</div>
                                                    <div className="text-sm text-slate-600">{submission.studentId}</div>
                                                </TableCell>
                                                <TableCell>{submission.assignmentTitle}</TableCell>
                                                <TableCell className="text-sm text-slate-600">
                                                    {submission.submittedAt}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Progress
                                                            value={(submission.testsPassed / submission.totalTests) * 100}
                                                            className="h-2 w-16"
                                                        />
                                                        <span className="text-sm">{submission.testsPassed}/{submission.totalTests}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {submission.score !== null ? (
                                                        <span className="font-medium">{submission.score}/{submission.maxScore}</span>
                                                    ) : (
                                                        <span className="text-slate-400">Pending</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(submission.status)}
                                                        <Badge className={getStatusColor(submission.status)}>
                                                            {submission.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Review
                                                        </Button>
                                                        {submission.status === 'grading' && (
                                                            <Button size="sm">
                                                                Grade
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Class Performance Trends</CardTitle>
                                    <CardDescription>Assignment scores over time</CardDescription>
                                </CardHeader>
                                <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                    <div className="text-center text-slate-500">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                                        <p>Chart visualization would go here</p>
                                        <p className="text-sm">Integration with charting library needed</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Patterns</CardTitle>
                                    <CardDescription>When students typically submit assignments</CardDescription>
                                </CardHeader>
                                <CardContent className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                                    <div className="text-center text-slate-500">
                                        <Clock className="w-12 h-12 mx-auto mb-2" />
                                        <p>Time-based analytics</p>
                                        <p className="text-sm">Heatmap visualization would go here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Code Quality Metrics</CardTitle>
                                <CardDescription>Automated analysis of student code submissions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                                        <div className="text-sm text-slate-600">Average Test Pass Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">7.2</div>
                                        <div className="text-sm text-slate-600">Average Cyclomatic Complexity</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                                        <div className="text-sm text-slate-600">Code Coverage Average</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Assignment Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                            <DialogDescription>
                                Set up a new coding assignment with automatic grading
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="title" className="text-sm font-medium">Assignment Title</label>
                                <Input id="title" placeholder="e.g., Binary Search Implementation" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="description" className="text-sm font-medium">Description</label>
                                <Textarea id="description" placeholder="Detailed assignment instructions..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label htmlFor="language" className="text-sm font-medium">Programming Language</label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="java">Java</SelectItem>
                                            <SelectItem value="cpp">C++</SelectItem>
                                            <SelectItem value="javascript">JavaScript</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label htmlFor="maxScore" className="text-sm font-medium">Max Score</label>
                                    <Input id="maxScore" type="number" placeholder="100" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                                <Input id="dueDate" type="datetime-local" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsCreateDialogOpen(false)}>
                                Create Assignment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Navigation */}
                <div className="pt-6 border-t border-slate-200">
                    <Link href="/example">
                        <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                            ← Back to Examples
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
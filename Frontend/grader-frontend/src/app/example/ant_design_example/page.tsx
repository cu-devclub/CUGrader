'use client'
import React, { useState } from 'react'
import {
    Table,
    Card,
    Button,
    Tag,
    Space,
    Typography,
    Row,
    Col,
    Progress,
    Avatar,
    Badge,
    Statistic,
    Modal,
    Form,
    Input,
    Select,
    message,
    Tooltip,
    Popconfirm
} from 'antd'
import {
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    DownloadOutlined,
    EyeOutlined
} from '@ant-design/icons'
import Link from 'next/link'

const { Title, Text } = Typography
const { Option } = Select

// Types
interface Student {
    key: string
    id: string
    name: string
    email: string
    course: string
    year: number
    gpa: number
    status: 'active' | 'inactive' | 'probation'
    assignments: number
    completed: number
    avatar: string
}

interface Assignment {
    key: string
    title: string
    course: string
    dueDate: string
    submissions: number
    totalStudents: number
    avgGrade: number
    status: 'active' | 'grading' | 'completed'
}

// Mock data for students
const mockStudents: Student[] = [
    {
        key: '1',
        id: 'S001',
        name: 'Alice Johnson',
        email: 'alice.johnson@student.edu',
        course: 'Computer Science',
        year: 3,
        gpa: 3.85,
        status: 'active',
        assignments: 15,
        completed: 12,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1'
    },
    {
        key: '2',
        id: 'S002',
        name: 'Bob Smith',
        email: 'bob.smith@student.edu',
        course: 'Mathematics',
        year: 2,
        gpa: 3.92,
        status: 'active',
        assignments: 12,
        completed: 11,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2'
    },
    {
        key: '3',
        id: 'S003',
        name: 'Charlie Brown',
        email: 'charlie.brown@student.edu',
        course: 'Physics',
        year: 4,
        gpa: 3.67,
        status: 'inactive',
        assignments: 18,
        completed: 14,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3'
    },
    {
        key: '4',
        id: 'S004',
        name: 'Diana Prince',
        email: 'diana.prince@student.edu',
        course: 'Computer Science',
        year: 1,
        gpa: 4.0,
        status: 'active',
        assignments: 8,
        completed: 8,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4'
    },
    {
        key: '5',
        id: 'S005',
        name: 'Edward Wilson',
        email: 'edward.wilson@student.edu',
        course: 'Engineering',
        year: 3,
        gpa: 3.45,
        status: 'probation',
        assignments: 20,
        completed: 15,
        avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=5'
    }
]

// Mock data for assignments
const mockAssignments: Assignment[] = [
    {
        key: '1',
        title: 'Data Structures Assignment',
        course: 'CS101',
        dueDate: '2025-06-15',
        submissions: 45,
        totalStudents: 50,
        avgGrade: 87.5,
        status: 'active'
    },
    {
        key: '2',
        title: 'Calculus Problem Set',
        course: 'MATH201',
        dueDate: '2025-06-10',
        submissions: 32,
        totalStudents: 35,
        avgGrade: 92.3,
        status: 'grading'
    },
    {
        key: '3',
        title: 'Physics Lab Report',
        course: 'PHYS301',
        dueDate: '2025-06-08',
        submissions: 28,
        totalStudents: 30,
        avgGrade: 78.9,
        status: 'completed'
    }
]

export default function AntDesignExample() {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [form] = Form.useForm()

    // Table columns for students
    const studentColumns = [
        {
            title: 'Student',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Student) => (
                <Space>
                    <Avatar src={record.avatar} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{text}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.id}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => (
                <Text copyable style={{ fontSize: '12px' }}>
                    {email}
                </Text>
            ),
        },
        {
            title: 'Course',
            dataIndex: 'course',
            key: 'course',
            filters: [
                { text: 'Computer Science', value: 'Computer Science' },
                { text: 'Mathematics', value: 'Mathematics' },
                { text: 'Physics', value: 'Physics' },
                { text: 'Engineering', value: 'Engineering' },
            ],
            onFilter: (value: boolean | React.Key, record: Student) => record.course.indexOf(value as string) === 0,
        },
        {
            title: 'Year',
            dataIndex: 'year',
            key: 'year',
            sorter: (a: Student, b: Student) => a.year - b.year,
        },
        {
            title: 'GPA',
            dataIndex: 'gpa',
            key: 'gpa',
            sorter: (a: Student, b: Student) => a.gpa - b.gpa,
            render: (gpa: number) => (
                <Tag color={gpa >= 3.8 ? 'green' : gpa >= 3.5 ? 'orange' : 'red'}>
                    {gpa.toFixed(2)}
                </Tag>
            ),
        },
        {
            title: 'Progress',
            key: 'progress',
            render: (record: Student) => {
                const percentage = Math.round((record.completed / record.assignments) * 100)
                return (
                    <Progress
                        percent={percentage}
                        size="small"
                        status={percentage === 100 ? 'success' : percentage >= 80 ? 'active' : 'exception'}
                    />
                )
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                return <Badge status={status === 'active' ? 'success' : status === 'inactive' ? 'default' : 'error'} text={status.toUpperCase()} />
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: Student) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewStudent(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Student">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditStudent(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this student?"
                        onConfirm={() => handleDeleteStudent(record.key)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Student">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    // Table columns for assignments
    const assignmentColumns = [
        {
            title: 'Assignment',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Assignment) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.course}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            sorter: (a: Assignment, b: Assignment) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        },
        {
            title: 'Submissions',
            key: 'submissions',
            render: (record: Assignment) => (
                <div>
                    <Progress
                        percent={Math.round((record.submissions / record.totalStudents) * 100)}
                        size="small"
                        format={() => `${record.submissions}/${record.totalStudents}`}
                    />
                </div>
            ),
        },
        {
            title: 'Avg Grade',
            dataIndex: 'avgGrade',
            key: 'avgGrade',
            render: (grade: number) => (
                <Tag color={grade >= 90 ? 'green' : grade >= 80 ? 'blue' : grade >= 70 ? 'orange' : 'red'}>
                    {grade.toFixed(1)}%
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config = {
                    active: { color: 'processing', text: 'Active' },
                    grading: { color: 'warning', text: 'Grading' },
                    completed: { color: 'success', text: 'Completed' }
                }[status] || { color: 'default', text: status }

                return <Badge status={config.color as any} text={config.text} />
            },
        },
    ]

    const handleViewStudent = (student: Student) => {
        setSelectedStudent(student)
        setIsModalVisible(true)
    }

    const handleEditStudent = (student: Student) => {
        form.setFieldsValue(student)
        setSelectedStudent(student)
        setIsModalVisible(true)
    }

    const handleDeleteStudent = (_key: string) => {
        message.success('Student deleted successfully')
    }

    const handleModalOk = () => {
        form.validateFields().then((_values) => {
            message.success('Student information updated successfully')
            setIsModalVisible(false)
            form.resetFields()
            setSelectedStudent(null)
        })
    }

    const handleModalCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
        setSelectedStudent(null)
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2}>Ant Design Components Example</Title>
                    <Text type="secondary">
                        This page demonstrates various Ant Design components including tables, forms, modals, and more.
                    </Text>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={mockStudents.length}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Students"
                                value={mockStudents.filter(s => s.status === 'active').length}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Avg GPA"
                                value={mockStudents.reduce((sum, s) => sum + s.gpa, 0) / mockStudents.length}
                                precision={2}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Assignments"
                                value={mockAssignments.length}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Students Table */}
                <Card
                    title="Students Management"
                    extra={
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Add Student
                            </Button>
                            <Button icon={<DownloadOutlined />}>
                                Export
                            </Button>
                        </Space>
                    }
                    style={{ marginBottom: '24px' }}
                >
                    <Table
                        columns={studentColumns}
                        dataSource={mockStudents}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`,
                        }}
                        scroll={{ x: 800 }}
                    />
                </Card>

                {/* Assignments Table */}
                <Card
                    title="Assignments Overview"
                    style={{ marginBottom: '24px' }}
                >
                    <Table
                        columns={assignmentColumns}
                        dataSource={mockAssignments}
                        pagination={false}
                    />
                </Card>

                {/* Student Details/Edit Modal */}
                <Modal
                    title={selectedStudent ? `${selectedStudent.name} Details` : 'Student Details'}
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={600}
                >
                    {selectedStudent && (
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={selectedStudent}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Student ID"
                                        name="id"
                                        rules={[{ required: true, message: 'Please input student ID!' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Name"
                                        name="name"
                                        rules={[{ required: true, message: 'Please input student name!' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please input email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Course"
                                        name="course"
                                        rules={[{ required: true, message: 'Please select course!' }]}
                                    >
                                        <Select>
                                            <Option value="Computer Science">Computer Science</Option>
                                            <Option value="Mathematics">Mathematics</Option>
                                            <Option value="Physics">Physics</Option>
                                            <Option value="Engineering">Engineering</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Year"
                                        name="year"
                                        rules={[{ required: true, message: 'Please select year!' }]}
                                    >
                                        <Select>
                                            <Option value={1}>1st Year</Option>
                                            <Option value={2}>2nd Year</Option>
                                            <Option value={3}>3rd Year</Option>
                                            <Option value={4}>4th Year</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="GPA"
                                        name="gpa"
                                        rules={[{ required: true, message: 'Please input GPA!' }]}
                                    >
                                        <Input type="number" step="0.01" min="0" max="4" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        rules={[{ required: true, message: 'Please select status!' }]}
                                    >
                                        <Select>
                                            <Option value="active">Active</Option>
                                            <Option value="inactive">Inactive</Option>
                                            <Option value="probation">Probation</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    )}
                </Modal>

                {/* Navigation */}
                <Card>
                    <Link href="/example">
                        <Button type="link" style={{ padding: 0 }}>
                            ← Back to Examples
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    )
}
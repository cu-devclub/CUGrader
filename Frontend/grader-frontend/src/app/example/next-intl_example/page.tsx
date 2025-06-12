'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { useState } from 'react'
import { Globe, Users, Calendar, Award } from 'lucide-react'

export default function NextIntlExamplePage() {
    const t = useTranslations('example')
    const locale = useLocale()
    const [counter, setCounter] = useState(0)

    // Example data
    const currentDate = new Date().toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')
    const studentCount = 150
    const gradeAverage = 85.5

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Header with locale switcher */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div></div>
                        <LocaleSwitcher />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        {t('description')}
                    </p>
                    <Badge variant="secondary" className="mt-4">
                        {t('currentLocale')}: {locale === 'en' ? 'English' : 'ไทย'}
                    </Badge>
                </div>

                {/* ...existing code... */}

                {/* Basic Usage Examples */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">

                    {/* Simple Translations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                {t('sections.basicTranslation.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.basicTranslation.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.welcome')}</h4>
                                <p className="text-lg">{t('messages.welcome')}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.goodbye')}</h4>
                                <p className="text-lg">{t('messages.goodbye')}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.loading')}</h4>
                                <p className="text-lg">{t('messages.loading')}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interpolation Examples */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                {t('sections.interpolation.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.interpolation.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.userGreeting')}</h4>
                                <p className="text-lg">
                                    {t('messages.userGreeting', { name: 'Alice', role: 'Instructor' })}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.studentCount')}</h4>
                                <p className="text-lg">
                                    {t('messages.studentCount', { count: studentCount })}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.gradeInfo')}</h4>
                                <p className="text-lg">
                                    {t('messages.gradeInfo', { average: gradeAverage, total: studentCount })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pluralization Examples */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                {t('sections.pluralization.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.pluralization.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Button
                                    onClick={() => setCounter(counter + 1)}
                                    variant="outline"
                                    size="sm"
                                >
                                    {t('buttons.increment')}
                                </Button>
                                <Button
                                    onClick={() => setCounter(Math.max(0, counter - 1))}
                                    variant="outline"
                                    size="sm"
                                    className="ml-2"
                                >
                                    {t('buttons.decrement')}
                                </Button>
                                <Button
                                    onClick={() => setCounter(0)}
                                    variant="outline"
                                    size="sm"
                                    className="ml-2"
                                >
                                    {t('buttons.reset')}
                                </Button>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.itemCount')}</h4>
                                <p className="text-lg">
                                    {t('messages.itemCount', { count: counter })}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.assignmentCount')}</h4>
                                <p className="text-lg">
                                    {t('messages.assignmentCount', { count: counter })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date and Number Formatting */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {t('sections.formatting.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('sections.formatting.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.todayDate')}</h4>
                                <p className="text-lg">{currentDate}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.averageScore')}</h4>
                                <p className="text-lg">
                                    {new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
                                        style: 'decimal',
                                        minimumFractionDigits: 1,
                                        maximumFractionDigits: 2
                                    }).format(gradeAverage)}%
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-sm text-gray-700">{t('labels.currency')}</h4>
                                <p className="text-lg">
                                    {new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
                                        style: 'currency',
                                        currency: locale === 'th' ? 'THB' : 'USD'
                                    }).format(1250.50)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Code Examples */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>{t('sections.usage.title')}</CardTitle>
                        <CardDescription>
                            {t('sections.usage.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">

                            {/* Basic Hook Usage */}
                            <div>
                                <h4 className="font-medium text-lg mb-2">{t('usage.basicHook.title')}</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                                    <pre>{`import { useTranslations } from 'next-intl'

function MyComponent() {
  const t = useTranslations('example')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}`}</pre>
                                </div>
                            </div>

                            {/* Interpolation Usage */}
                            <div>
                                <h4 className="font-medium text-lg mb-2">{t('usage.interpolation.title')}</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                                    <pre>{`// With variables
const name = 'John'
const count = 5

return (
  <div>
    <p>{t('userGreeting', { name, role: 'Student' })}</p>
    <p>{t('itemCount', { count })}</p>
  </div>
)`}</pre>
                                </div>
                            </div>

                            {/* Pluralization Usage */}
                            <div>
                                <h4 className="font-medium text-lg mb-2">{t('usage.pluralization.title')}</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                                    <pre>{`// Automatic pluralization based on count
const itemCount = 3

return (
  <p>{t('messages.itemCount', { count: itemCount })}</p>
)
// Results: "3 items" (en) or "3 รายการ" (th)`}</pre>
                                </div>
                            </div>

                            {/* Locale Detection */}
                            <div>
                                <h4 className="font-medium text-lg mb-2">{t('usage.locale.title')}</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                                    <pre>{`import { useLocale } from 'next-intl'

function LocaleAwareComponent() {
  const locale = useLocale()
  
  return (
    <p>Current locale: {locale}</p>
  )
}`}</pre>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* JSON Structure Example */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('sections.jsonStructure.title')}</CardTitle>
                        <CardDescription>
                            {t('sections.jsonStructure.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">messages/en.json</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-96">
                                    <pre>{`{
  "example": {
    "title": "Next-intl Example",
    "description": "Learn how to use internationalization",
    "messages": {
      "welcome": "Welcome to our platform!",
      "userGreeting": "Hello {name}, you are a {role}",
      "itemCount": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
    },
    "buttons": {
      "increment": "Add Item",
      "decrement": "Remove Item"
    }
  }
}`}</pre>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">messages/th.json</h4>
                                <div className="bg-gray-800 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto max-h-96">
                                    <pre>{`{
  "example": {
    "title": "ตัวอย่าง Next-intl",
    "description": "เรียนรู้วิธีใช้ระบบหลายภาษา",
    "messages": {
      "welcome": "ยินดีต้อนรับสู่แพลตฟอร์มของเรา!",
      "userGreeting": "สวัสดี {name} คุณเป็น {role}",
      "itemCount": "{count, plural, =0 {ไม่มีรายการ} other {# รายการ}}"
    },
    "buttons": {
      "increment": "เพิ่มรายการ",
      "decrement": "ลบรายการ"
    }
  }
}`}</pre>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
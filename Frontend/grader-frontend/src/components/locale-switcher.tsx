'use client'

import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { Languages } from "lucide-react"

interface LocaleSwitcherProps {
    variant?: 'default' | 'sidebar'
}

export function LocaleSwitcher({ variant = 'default' }: LocaleSwitcherProps) {
    const locale = useLocale()

    const toggleLocale = () => {
        const newLocale = locale === 'en' ? 'th' : 'en'

        // Set cookie for locale preference
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000` // 1 year

        // Force a hard refresh to apply new locale
        window.location.reload()
    }

    if (variant === 'sidebar') {
        return (
            <Button
                variant="outline"
                onClick={toggleLocale}
                className="w-full justify-center"
                title={`Switch to ${locale === 'en' ? 'Thai' : 'English'}`}
            >
                <Languages className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                    {locale === 'en' ? 'ไทย' : 'EN'}
                </span>
            </Button>
        )
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleLocale}
            className="flex items-center gap-2"
        >
            <Languages className="h-4 w-4" />
            {locale === 'en' ? 'ไทย' : 'EN'}
        </Button>
    )
}

'use client'

import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { Languages } from "lucide-react"

export function LocaleSwitcher() {
    const locale = useLocale()

    const toggleLocale = () => {
        const newLocale = locale === 'en' ? 'th' : 'en'

        // Set cookie for locale preference
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000` // 1 year

        // Force a hard refresh to apply new locale
        window.location.reload()
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

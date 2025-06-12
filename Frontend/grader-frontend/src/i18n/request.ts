import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Read locale from cookies, fallback to 'en'
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'en';

    // Ensure locale is supported
    const supportedLocales = ['en', 'th'];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    return {
        locale: validLocale,
        messages: (await import(`../../messages/${validLocale}.json`)).default
    };
});
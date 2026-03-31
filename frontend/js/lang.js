// المسار: frontend/js/lang.js

// 1. قاموس الكلمات (Dictionary)
const translations = {
    ar: {
        "dashboard_title": "لوحة تحكم بوصلة",
        "welcome": "مرحباً بك يا",
        "articles": "المقالات",
        "categories": "الأقسام",
        "add_article": "إضافة مقال جديد",
        "logout": "تسجيل الخروج",
        "switch_lang": "English",
        "theme_toggle": "الوضع الليلي"
    },
    en: {
        "dashboard_title": "Bawsala Dashboard",
        "welcome": "Welcome,",
        "articles": "Articles",
        "categories": "Categories",
        "add_article": "Add New Article",
        "logout": "Logout",
        "switch_lang": "العربية",
        "theme_toggle": "Dark Mode"
    }
};

// 2. دالة تغيير اللغة
function setLanguage(lang) {
    // حفظ اللغة في المتصفح ليتذكرها في الزيارات القادمة
    localStorage.setItem('bawsala_lang', lang);

    // تغيير اتجاه الصفحة ولغة الـ HTML
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    // البحث عن كل العناصر التي تحتوي على خاصية data-i18n وتغيير نصها
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// 3. دالة التبديل عند الضغط على زر تغيير اللغة
function toggleLanguage() {
    const currentLang = localStorage.getItem('bawsala_lang') || 'ar';
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(newLang);
}

// 4. عند تحميل الصفحة، قم بتشغيل اللغة المحفوظة أو الافتراضية (العربية)
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('bawsala_lang') || 'ar';
    setLanguage(savedLang);
});
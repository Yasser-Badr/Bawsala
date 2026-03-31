// المسار: frontend/js/admin_guard.js

const guardToken = localStorage.getItem('bawsala_token');
if (!guardToken) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', () => {
    const userRole = localStorage.getItem('bawsala_role');
    const userName = localStorage.getItem('bawsala_name');

    // عرض اسم المستخدم
    const nameDisplays = document.querySelectorAll('.admin-name-display');
    if (nameDisplays.length > 0 && userName) {
        nameDisplays.forEach(el => el.innerText = userName);
    }

    // التحكم في القائمة بناءً على الرتبة
    if (userRole !== 'superadmin') {
        const superadminLinks = ['manage_users.html', 'manage_categories.html', 'add_category.html'];
        
        const links = document.querySelectorAll('.sidebar a');
        links.forEach(link => {
            superadminLinks.forEach(restricted => {
                if (link.href.includes(restricted)) {
                    link.parentElement.style.display = 'none'; // إخفاء الزرار تماماً
                }
            });
        });

        // طرد المحرر إذا حاول فتح الصفحة من الرابط مباشرة
        const currentPath = window.location.pathname;
        if (superadminLinks.some(restricted => currentPath.includes(restricted))) {
            alert('عذراً، هذه الصفحة مخصصة للمدير العام فقط.');
            window.location.href = 'admin.html';
        }
    } else {
        // إظهار زرار الصلاحيات للسوبر أدمن
        const assignLink = document.getElementById('assignLink');
        if (assignLink) assignLink.style.display = 'block';
    }
});
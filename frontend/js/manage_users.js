// المسار: frontend/js/manage_users.js

const token = localStorage.getItem('bawsala_token');
if (!token) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', async () => {
    await fetchUsers();
    await fetchCategories();
});

// 1. جلب المستخدمين لملء الـ Select
async function fetchUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const select = document.getElementById('editorSelect');
        select.innerHTML = '<option value="">اختر المحرر...</option>';
        
        if (response.ok && data.users) {
            data.users.forEach(user => {
                select.innerHTML += `<option value="${user.ID}">${user.Name} (${user.Email})</option>`;
            });
        } else {
            select.innerHTML = '<option value="">غير مصرح لك أو لا يوجد مستخدمين</option>';
        }
    } catch (error) { console.error("Error fetching users:", error); }
}

// 2. جلب الأقسام لملء الـ Select
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const select = document.getElementById('categorySelect');
        select.innerHTML = '<option value="">اختر القسم...</option>';
        if (data.categories) {
            data.categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.ID}">${cat.Name}</option>`;
            });
        }
    } catch (error) { console.error("Error fetching categories:", error); }
}

// 3. إنشاء مستخدم جديد
document.getElementById('addUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };

    try {
        // التعديل هنا: استخدام مسار الأدمن وإرسال التوكن لضمان الصلاحية
        const response = await fetch('/api/admin/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        
        if (response.ok) {
            alert('تم إنشاء الحساب بنجاح!');
            document.getElementById('addUserForm').reset();
            fetchUsers(); // تحديث القائمة فوراً
        } else {
            alert(result.error || 'حدث خطأ');
        }
    } catch (error) { alert('فشل الاتصال بالخادم'); }
});

// 4. إعطاء صلاحية للمحرر
document.getElementById('assignCategoryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const assignData = {
        user_id: parseInt(document.getElementById('editorSelect').value),
        category_id: parseInt(document.getElementById('categorySelect').value)
    };

    try {
        const response = await fetch('/api/admin/assign-category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(assignData)
        });
        const result = await response.json();

        if (response.ok) {
            alert('تم إعطاء الصلاحية بنجاح!');
            document.getElementById('assignCategoryForm').reset();
        } else {
            alert(result.error || 'حدث خطأ. تأكد أنك تملك صلاحية المدير العام.');
        }
    } catch (error) { alert('فشل الاتصال بالخادم'); }
});
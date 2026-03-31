// المسار: frontend/js/manage_categories.js

document.addEventListener('DOMContentLoaded', fetchAdminCategories);

async function fetchAdminCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();

        if (data.categories && data.categories.length > 0) {
            data.categories.forEach(cat => {
                const row = `
                    <tr id="cat-row-${cat.ID}">
                        <td style="font-weight: bold;">${cat.Name}</td>
                        <td>${cat.Slug}</td>
                        <td>
                            <button onclick="deleteCategory(${cat.ID})" class="btn btn-danger btn-sm">حذف</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">لا توجد أقسام.</td></tr>';
        }
    } catch (error) { console.error(error); }
}

async function deleteCategory(id) {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
        const response = await fetch(`/api/admin/categories/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('bawsala_token')}` }
        });
        if (response.ok) {
            alert('تم حذف القسم!');
            document.getElementById(`cat-row-${id}`).remove();
        } else {
            alert('حدث خطأ أثناء الحذف.');
        }
    } catch (error) { alert('فشل الاتصال بالخادم'); }
}
// المسار: frontend/js/manage_articles.js

const token = localStorage.getItem('bawsala_token');
if (!token) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', fetchAdminArticles);

async function fetchAdminArticles() {
    const tbody = document.getElementById('articlesTableBody');
    const table = document.getElementById('articlesTable');
    const loading = document.getElementById('loadingMsg');

    try {
        const response = await fetch('/api/admin/my-articles', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        loading.style.display = 'none';

        if (response.ok && data.data && data.data.length > 0) {
            table.style.display = 'table';
            data.data.forEach(article => {
                const date = new Date(article.CreatedAt).toLocaleDateString('ar-EG');
                const categoryName = article.Category ? article.Category.Name : 'عام';

                const row = `
                    <tr id="row-${article.ID}">
                        <td style="font-weight: bold;">${article.Title}</td>
                        <td>${categoryName}</td>
                        <td>${article.Views}</td>
                        <td>${date}</td>
                        <td>
                            <a href="edit_article.html?slug=${article.Slug}" class="btn btn-warning btn-sm">تعديل</a>
                            <button onclick="deleteArticle(${article.ID})" class="btn btn-danger btn-sm">حذف</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        } else {
            loading.style.display = 'block';
            loading.innerText = 'لا توجد مقالات خاصة بك حتى الآن.';
        }
    } catch (error) {
        loading.innerText = 'حدث خطأ أثناء جلب المقالات.';
        loading.style.color = 'red';
    }
}

async function deleteArticle(articleId) {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا المقال نهائياً؟")) return;

    try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('تم حذف المقال بنجاح!');
            document.getElementById(`row-${articleId}`).remove();
        } else {
            const data = await response.json();
            alert(data.error || 'حدث خطأ أثناء الحذف.');
        }
    } catch (error) {
        alert('فشل الاتصال بالخادم!');
    }
}
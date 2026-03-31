// المسار: frontend/js/category.js

const token = localStorage.getItem('bawsala_token');
if (!token) {
    window.location.href = 'login.html';
}

document.getElementById('categoryForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const name = document.getElementById('catName').value;
    const slug = document.getElementById('catSlug').value;
    const description = document.getElementById('catDesc').value;
    const msgDiv = document.getElementById('categoryMessage');

    const categoryData = {
        name: name,
        slug: slug,
        description: description
    };

    try {
        const response = await fetch('/api/admin/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(categoryData)
        });

        const result = await response.json();

        msgDiv.style.display = 'block';
        if (response.ok) {
            msgDiv.className = 'success-message';
            msgDiv.innerText = '🎉 تم إضافة القسم بنجاح!';
            document.getElementById('categoryForm').reset();
        } else {
            msgDiv.className = 'error-message';
            msgDiv.innerText = result.error || 'حدث خطأ أثناء إضافة القسم';
        }
    } catch (error) {
        msgDiv.style.display = 'block';
        msgDiv.className = 'error-message';
        msgDiv.innerText = 'فشل الاتصال بالخادم!';
    }
});
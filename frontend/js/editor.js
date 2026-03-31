// المسار: frontend/js/editor.js

const token = localStorage.getItem('bawsala_token');
if (!token) window.location.href = 'login.html';

// 👇 تهيئة محرر TinyMCE الاحترافي
tinymce.init({
    selector: '#editor-container',
    directionality: 'rtl', // دعم أساسي للغة العربية
    height: 600,
    menubar: false,
    plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'codesample', 'wordcount', 'directionality'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | ' +
        'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image media table codesample | ' +
        'forecolor backcolor | ltr rtl | removeformat | fullscreen',
    content_style: 'body { font-family: "Tajawal", sans-serif; font-size: 16px; }',
    // خيارات لرفع الصور كروابط (تقدر تطورها لرفع سيرفر لاحقاً)
    image_title: true,
    automatic_uploads: true,
});

async function fetchCategories() {
    try {
        const response = await fetch('/api/admin/my-categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const select = document.getElementById('categorySelect');
        select.innerHTML = '<option value="">اختر القسم المناسب...</option>';
        if (data.categories) {
            data.categories.forEach(cat => {
                select.innerHTML += `<option value="${cat.ID}">${cat.Name}</option>`;
            });
        }
    } catch (error) { console.error("Error:", error); }
}
fetchCategories();

const articleForm = document.getElementById('articleForm');
if (articleForm) {
    articleForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // استخراج المحتوى من TinyMCE
        const articleContent = tinymce.get('editor-container').getContent();
        
        if (!articleContent.trim()) {
            alert('يرجى كتابة محتوى للمقال!');
            return;
        }

        const submitBtn = document.querySelector('.btn-full');
        submitBtn.innerText = "جاري النشر...";
        submitBtn.disabled = true;

        const articleData = {
            Title: document.getElementById('title').value,
            Slug: document.getElementById('slug').value,
            CategoryID: parseInt(document.getElementById('categorySelect').value),
            Content: articleContent // 👈 تمرير المحتوى هنا
        };

        try {
            const response = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articleData)
            });
            const result = await response.json();
            if (response.ok) {
                alert('تم نشر المقال بنجاح!');
                window.location.href = 'manage_articles.html';
            } else {
                alert(result.error || 'حدث خطأ');
                submitBtn.innerText = "نشر المقال";
                submitBtn.disabled = false;
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم!');
            submitBtn.innerText = "نشر المقال";
            submitBtn.disabled = false;
        }
    });
}
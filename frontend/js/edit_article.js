// المسار: frontend/js/edit_article.js

const token = localStorage.getItem('bawsala_token');
if (!token) window.location.href = 'login.html';

let currentArticleId = null;

// 👇 تهيئة محرر TinyMCE
tinymce.init({
    selector: '#editor-container',
    directionality: 'rtl',
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
    setup: function (editor) {
        // ننتظر حتى يعمل المحرر بالكامل قبل أن نقوم بجلب بيانات المقال ووضعها بداخله
        editor.on('init', async function () {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('slug');

            if (!slug) {
                alert("لم يتم تحديد المقال المراد تعديله.");
                window.location.href = 'manage_articles.html';
                return;
            }

            await fetchCategories();
            await fetchArticleData(slug);
        });
    }
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
    } catch (error) { console.error("Error fetching categories:", error); }
}

async function fetchArticleData(slug) {
    try {
        const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
        const data = await response.json();

        if (response.ok) {
            const article = data.article;
            currentArticleId = article.ID; 

            document.getElementById('title').value = article.Title;
            document.getElementById('slug').value = article.Slug;
            document.getElementById('categorySelect').value = article.CategoryID;
            
            // 👇 وضع محتوى المقال داخل TinyMCE
            tinymce.get('editor-container').setContent(article.Content);

            document.getElementById('loadingMsg').style.display = 'none';
            document.getElementById('editArticleForm').style.display = 'block';
        } else {
            document.getElementById('loadingMsg').innerText = "المقال غير موجود.";
            document.getElementById('loadingMsg').style.color = 'red';
        }
    } catch (error) {
        document.getElementById('loadingMsg').innerText = "فشل الاتصال بالخادم.";
        document.getElementById('loadingMsg').style.color = 'red';
    }
}

document.getElementById('editArticleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // استخراج المحتوى
    const articleContent = tinymce.get('editor-container').getContent();
        
    if (!articleContent.trim()) {
        alert('يرجى كتابة محتوى للمقال!');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerText = "جاري الحفظ...";
    submitBtn.disabled = true;

    // تنظيف الـ Slug
    const rawSlug = document.getElementById('slug').value.trim();
    const cleanSlug = rawSlug.replace(/\s+/g, '-'); 

    const articleData = {
        Title: document.getElementById('title').value,
        Slug: cleanSlug, // استخدام الـ Slug النظيف
        CategoryID: parseInt(document.getElementById('categorySelect').value),
        Content: articleContent // تمرير المحتوى الجديد
    };

    try {
        const response = await fetch(`/api/admin/articles/${currentArticleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(articleData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('تم تعديل المقال بنجاح!');
            window.location.href = 'manage_articles.html';
        } else {
            alert(result.error || 'حدث خطأ أثناء التعديل');
            submitBtn.innerText = "حفظ التعديلات";
            submitBtn.disabled = false;
        }
    } catch (error) { 
        alert('فشل الاتصال بالخادم!'); 
        submitBtn.innerText = "حفظ التعديلات";
        submitBtn.disabled = false;
    }
});
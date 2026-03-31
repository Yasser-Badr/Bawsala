// المسار: frontend/js/article.js

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const loadingMsg = document.getElementById('loadingMessage');
    const articleWrapper = document.getElementById('articleWrapper'); 

    if (!slug) {
        loadingMsg.innerHTML = '<h4 class="text-danger mt-4 fw-bold">المقال غير موجود أو الرابط غير صحيح.</h4>';
        return;
    }

    try {
        const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
        const data = await response.json();

        if (!response.ok) {
            loadingMsg.innerHTML = `<h4 class="text-danger mt-4 fw-bold">${data.error || "المقال غير موجود."}</h4>`;
            return;
        }

        const article = data.article;

        document.title = `${article.Title} - بوصلة`;
        document.getElementById('articleTitle').innerText = article.Title;
        document.getElementById('articleCategory').innerText = article.Category ? article.Category.Name : 'عام';
        
        const dateObj = new Date(article.CreatedAt);
        document.getElementById('articleDate').innerHTML = `<i class="bi bi-calendar3"></i> ${dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        
        document.getElementById('articleViews').innerHTML = `<i class="bi bi-eye"></i> ${article.Views} مشاهدة`;

        const doc = new DOMParser().parseFromString(article.Content, 'text/html');
        const firstImg = doc.querySelector('img'); 
        const heroImageEl = document.getElementById('articleHeroImage'); 
        
        if (firstImg) {
            heroImageEl.src = firstImg.src;
        } else {
            heroImageEl.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'; 
        }

        // حقن المحتوى في الصفحة
        document.getElementById('articleContent').innerHTML = doc.body.innerHTML;

        // 👇 التعديل هنا: تفعيل تلوين الأكواد البرمجية بعد حقن المحتوى
        if (window.Prism) {
            Prism.highlightAll();
        }

        loadingMsg.style.display = 'none';
        articleWrapper.style.display = 'block';

        // إرسال طلب زيادة المشاهدة بعد دقيقة (60,000 مللي ثانية)
        setTimeout(async () => {
            try {
                const viewResponse = await fetch(`/api/articles/${encodeURIComponent(slug)}/view`, { method: 'POST' });
                if (viewResponse.ok) {
                    const viewData = await viewResponse.json();
                    document.getElementById('articleViews').innerHTML = `<i class="bi bi-eye"></i> ${viewData.views} مشاهدة`;
                }
            } catch (err) {
                console.error("لم يتم حساب المشاهدة", err);
            }
        }, 60000); 

    } catch (error) {
        loadingMsg.innerHTML = '<h4 class="text-danger mt-4 fw-bold">حدث خطأ أثناء جلب المقال. تأكد من تشغيل الخادم.</h4>';
        console.error("Error fetching article:", error);
    }
});
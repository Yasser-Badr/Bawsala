// المسار: frontend/js/article.js

document.addEventListener('DOMContentLoaded', async () => {
    // 👇 استدعاء دالة الناف بار أولاً
    fetchNavbarCategories();

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const loadingMsg = document.getElementById('loadingMessage');
    const articleWrapper = document.getElementById('articleWrapper'); 

    if (!slug) {
        if(loadingMsg) loadingMsg.innerHTML = '<h4 class="text-danger mt-4 fw-bold">المقال غير موجود أو الرابط غير صحيح.</h4>';
        return;
    }

    try {
        const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`);
        const data = await response.json();

        if (!response.ok) {
            if(loadingMsg) loadingMsg.innerHTML = `<h4 class="text-danger mt-4 fw-bold">${data.error || "المقال غير موجود."}</h4>`;
            return;
        }

        const article = data.article;

        document.title = `${article.Title} - بوصلة`;
        
        const titleEl = document.getElementById('articleTitle');
        if(titleEl) titleEl.innerText = article.Title;
        
        const catEl = document.getElementById('articleCategory');
        if(catEl) catEl.innerText = article.Category ? article.Category.Name : 'عام';
        
        const dateObj = new Date(article.CreatedAt);
        const dateEl = document.getElementById('articleDate');
        if(dateEl) dateEl.innerHTML = `<i class="bi bi-calendar3"></i> ${dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        
        const viewsEl = document.getElementById('articleViews');
        if(viewsEl) viewsEl.innerHTML = `<i class="bi bi-eye"></i> ${article.Views} مشاهدة`;

        const doc = new DOMParser().parseFromString(article.Content, 'text/html');
        const firstImg = doc.querySelector('img'); 
        const heroImageEl = document.getElementById('articleHeroImage'); 
        
        if (firstImg && heroImageEl) {
            heroImageEl.src = firstImg.src;
        } else if (heroImageEl) {
            heroImageEl.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'; 
        }

        const contentEl = document.getElementById('articleContent');
        if(contentEl) contentEl.innerHTML = doc.body.innerHTML;

        if (window.Prism) {
            Prism.highlightAll();
        }

        if(loadingMsg) loadingMsg.style.display = 'none';
        if(articleWrapper) articleWrapper.style.display = 'block';

        setTimeout(async () => {
            try {
                const viewResponse = await fetch(`/api/articles/${encodeURIComponent(slug)}/view`, { method: 'POST' });
                if (viewResponse.ok) {
                    const viewData = await viewResponse.json();
                    if(viewsEl) viewsEl.innerHTML = `<i class="bi bi-eye"></i> ${viewData.views} مشاهدة`;
                }
            } catch (err) {
                console.error("لم يتم حساب المشاهدة", err);
            }
        }, 60000); 

    } catch (error) {
        if(loadingMsg) loadingMsg.innerHTML = '<h4 class="text-danger mt-4 fw-bold">حدث خطأ أثناء جلب المقال. تأكد من تشغيل الخادم.</h4>';
        console.error("Error fetching article:", error);
    }
});

// 👇 الدالة المضافة لملء الشريط العلوي
async function fetchNavbarCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        const navList = document.getElementById('publicCategories');
        if (navList) {
            navList.innerHTML = ''; 
            if (data.categories) {
                data.categories.forEach(cat => {
                    navList.innerHTML += `<li class="nav-item"><a class="nav-link fw-bold" href="category.html?slug=${cat.Slug}">${cat.Name}</a></li>`;
                });
            }
        }
    } catch (error) { console.error(error); }
}
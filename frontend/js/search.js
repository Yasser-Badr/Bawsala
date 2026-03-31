// المسار: frontend/js/search.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    let debounceTimer;

    // عند كتابة أي حرف في مربع البحث
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        // لو الحقل فارغ، أخفي النتائج
        if (query.length === 0) {
            searchResults.style.display = 'none';
            return;
        }

        // إظهار علامة تحميل بسيطة
        searchResults.style.display = 'block';
        searchResults.innerHTML = `<div class="text-center p-3 text-muted"><div class="spinner-border spinner-border-sm text-primary" role="status"></div> جاري البحث...</div>`;

        // الانتظار 300 ملي ثانية قبل إرسال الطلب (Debouncing) لحماية السيرفر
        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                renderSearchResults(data, query);
            } catch (error) {
                console.error("Search error:", error);
                searchResults.innerHTML = `<div class="text-center p-3 text-danger">حدث خطأ في الاتصال بالسيرفر.</div>`;
            }
        }, 300); 
    });

    // إغلاق القائمة عند النقر في أي مكان فارغ بالشاشة
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // عند التركيز (Focus) على الحقل وفيه كلام، أظهر النتائج مرة أخرى
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0 && searchResults.innerHTML.trim() !== "") {
            searchResults.style.display = 'block';
        }
    });
});

// دالة رسم النتائج في القائمة المنسدلة
function renderSearchResults(data, query) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    let hasResults = false;

    // 1. عرض الأقسام إن وجدت
    if (data.categories && data.categories.length > 0) {
        hasResults = true;
        searchResults.innerHTML += `<h6 class="dropdown-header text-primary fw-bold" style="font-size: 0.85rem;">📁 الأقسام</h6>`;
        data.categories.forEach(cat => {
            searchResults.innerHTML += `
                <a class="dropdown-item py-2 rounded-3 text-dark article-card-hover" href="category.html?slug=${cat.Slug}">
                    ${cat.Name}
                </a>`;
        });
        searchResults.innerHTML += `<li><hr class="dropdown-divider my-1"></li>`;
    }

    // 2. عرض المقالات إن وجدت
    if (data.articles && data.articles.length > 0) {
        hasResults = true;
        searchResults.innerHTML += `<h6 class="dropdown-header text-primary fw-bold" style="font-size: 0.85rem;">📝 المقالات</h6>`;
        data.articles.forEach(article => {
            searchResults.innerHTML += `
                <a class="dropdown-item py-2 rounded-3 text-dark text-wrap article-card-hover" href="article.html?slug=${article.Slug}" style="line-height: 1.5;">
                    ${article.Title}
                </a>`;
        });
    }

    // 3. حالة عدم وجود نتائج
    if (!hasResults) {
        searchResults.innerHTML = `<div class="p-3 text-center text-muted">لا توجد نتائج مطابقة لـ "<b>${query}</b>"</div>`;
    }
}
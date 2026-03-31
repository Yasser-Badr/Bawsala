// المسار: frontend/js/public_category.js

document.addEventListener('DOMContentLoaded', async () => {
    // 👇 استدعاء دالة الناف بار أولاً
    fetchNavbarCategories();

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const grid = document.getElementById('categoryArticlesGrid');
    const catName = document.getElementById('categoryNameTitle');
    const catDesc = document.getElementById('categoryDescTitle');

    if (!slug) {
        if(catName) catName.innerText = "القسم غير موجود";
        return;
    }

    try {
        const response = await fetch(`/api/categories/${slug}`);
        const data = await response.json();

        if (!response.ok) {
            if(catName) catName.innerText = "القسم غير موجود";
            return;
        }

        const category = data.category;
        if(catName) catName.innerHTML = `${category.Name} <i class="bi bi-folder2-open"></i>`;
        if(catDesc) catDesc.innerText = category.Description || "تصفح أحدث المقالات والمواضيع المتميزة في هذا القسم.";
        document.title = `${category.Name} - بوصلة`;

        if(grid) grid.innerHTML = ''; 

        if (category.Articles && category.Articles.length > 0) {
            const calmColors = ['#f8fafc', '#f0fdf4', '#eff6ff', '#fef2f2', '#fffbeb', '#faf5ff', '#e0f2fe', '#fce7f3', '#ecfdf5', '#fefce8'];

            category.Articles.forEach(article => {
                const date = new Date(article.CreatedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
                const coverImg = extractFirstImage(article.Content);
                const randomColor = calmColors[Math.floor(Math.random() * calmColors.length)];

                let imageHTML = '';
                if (coverImg) {
                    imageHTML = `<img src="${coverImg}" class="card-img-top" alt="${article.Title}" style="height: 220px; object-fit: cover;">`;
                } else {
                    imageHTML = `
                        <div class="card-img-top d-flex align-items-center justify-content-center" style="height: 220px; background-color: ${randomColor}; border-bottom: 1px solid #f1f5f9;">
                            <i class="bi bi-file-earmark-richtext" style="font-size: 4rem; color: rgba(0,0,0,0.15);"></i>
                        </div>
                    `;
                }

                const cardHTML = `
                    <div class="col">
                        <a href="article.html?slug=${article.Slug}" class="text-decoration-none">
                            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden article-card-hover bg-white">
                                ${imageHTML}
                                <div class="card-body p-4 d-flex flex-column">
                                    <span class="badge bg-primary bg-opacity-10 text-primary mb-3 rounded-pill align-self-start fs-6 px-3 py-2">${category.Name}</span>
                                    <h4 class="card-title fw-bold mb-3 text-dark" style="line-height: 1.4;">${article.Title}</h4>
                                    <div class="mt-auto d-flex justify-content-between align-items-center text-muted border-top pt-3 mt-3">
                                        <small><i class="bi bi-calendar3"></i> ${date}</small>
                                        <small><i class="bi bi-eye"></i> ${article.Views}</small>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                if(grid) grid.innerHTML += cardHTML;
            });
        } else {
            if(grid) grid.innerHTML = `<div class="col-12 text-center text-muted py-5"><h4>لا توجد مقالات منشورة في هذا القسم بعد.</h4></div>`;
        }

    } catch (error) { console.error("Error:", error); }
});

function extractFirstImage(htmlContent) {
    if (!htmlContent) return null;
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}

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
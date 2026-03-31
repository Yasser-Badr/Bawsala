// المسار: frontend/js/public_category.js

const calmColors = ['#f0fdf4', '#eff6ff', '#fdf2f8', '#fffbeb', '#f5f3ff', '#ecfdf5', '#f8fafc'];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    const grid = document.getElementById('categoryArticlesGrid');
    const catName = document.getElementById('categoryNameTitle');
    const catDesc = document.getElementById('categoryDescTitle');

    if (!slug) {
        catName.innerText = "القسم غير موجود";
        return;
    }

    try {
        const response = await fetch(`/api/categories/${slug}`);
        const data = await response.json();

        if (!response.ok) {
            catName.innerText = "القسم غير موجود";
            return;
        }

        const category = data.category;
        catName.innerHTML = `${category.Name} <i class="bi bi-folder2-open"></i>`;
        catDesc.innerText = category.Description || "تصفح أحدث المقالات والمواضيع المتميزة في هذا القسم.";
        document.title = `${category.Name} - بوصلة`;

        grid.innerHTML = ''; 

        if (category.Articles && category.Articles.length > 0) {
            category.Articles.forEach(article => {
                const date = new Date(article.CreatedAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' });
                const coverImg = extractFirstImage(article.Content);
                const randomColor = calmColors[Math.floor(Math.random() * calmColors.length)];

                let imageElement = '';
                if (coverImg) {
                    imageElement = `<img src="${coverImg}" class="card-img-top border-bottom" alt="${article.Title}" style="height: 220px; object-fit: cover;">`;
                } else {
                    imageElement = `<div class="card-img-top border-bottom d-flex align-items-center justify-content-center" style="height: 220px; background-color: rgba(255,255,255,0.5);">
                                        <i class="bi bi-journal-text text-secondary" style="font-size: 5rem; opacity: 0.2;"></i>
                                    </div>`;
                }

                const cardHTML = `
                    <div class="col">
                        <a href="article.html?slug=${article.Slug}" class="text-decoration-none">
                            <div class="card h-100 shadow-sm border-0 rounded-4 overflow-hidden article-card-hover" style="background-color: ${randomColor};">
                                ${imageElement}
                                <div class="card-body p-4 d-flex flex-column">
                                    <span class="badge bg-white text-primary mb-3 rounded-pill align-self-start fs-6 px-3 py-2 shadow-sm">${category.Name}</span>
                                    <h4 class="card-title fw-bold mb-3 text-dark" style="line-height: 1.4;">${article.Title}</h4>
                                    <div class="mt-auto d-flex justify-content-between align-items-center text-muted border-top pt-3 mt-3 border-secondary border-opacity-10">
                                        <small><i class="bi bi-calendar3"></i> ${date}</small>
                                        <small><i class="bi bi-eye"></i> ${article.Views}</small>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                grid.innerHTML += cardHTML;
            });
        } else {
            grid.innerHTML = `<div class="col-12 text-center text-muted py-5"><h4>لا توجد مقالات منشورة في هذا القسم بعد.</h4></div>`;
        }

    } catch (error) { console.error("Error:", error); }
});

function extractFirstImage(htmlContent) {
    if (!htmlContent) return null;
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
}
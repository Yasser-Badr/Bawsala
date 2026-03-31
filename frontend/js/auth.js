// المسار: frontend/js/auth.js

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const submitBtn = document.querySelector('.btn-full');

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "جاري الدخول...";
    submitBtn.disabled = true;

    try {
        // تم تغيير الرابط ليكون نسبياً للعمل على السيرفر المحلي أو الحقيقي
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.innerText = data.error || "حدث خطأ أثناء تسجيل الدخول";
            errorDiv.style.display = 'block';
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        } else {
            localStorage.setItem('bawsala_token', data.token);
            localStorage.setItem('bawsala_name', data.name);
            localStorage.setItem('bawsala_role', data.role);
            
            window.location.href = 'admin.html';
        }
    } catch (error) {
        errorDiv.innerText = "لا يمكن الاتصال بالخادم. تأكد من تشغيل الباك إند.";
        errorDiv.style.display = 'block';
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
});

function logoutAdmin() {
    const confirmLogout = confirm("هل تريد تسجيل الخروج من لوحة التحكم؟");
    if (confirmLogout) {
        localStorage.removeItem('bawsala_token');
        localStorage.removeItem('bawsala_name');
        localStorage.removeItem('bawsala_role');
        
        window.location.href = 'login.html';
    }
}
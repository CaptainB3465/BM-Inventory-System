document.addEventListener('DOMContentLoaded', () => {
    const views = {
        login: document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        forgot: document.getElementById('forgot-view'),
        reset: document.getElementById('reset-view')
    };

    function showView(viewId) {
        Object.values(views).forEach(v => {
            v.classList.add('hidden');
        });
        
        const targetView = views[viewId];
        targetView.classList.remove('hidden');
        
        // Clear errors
        document.querySelectorAll('.error-message, .success-message').forEach(m => m.style.display = 'none');
    }

    function setBtnLoading(btnId, isLoading) {
        const btn = document.getElementById(btnId);
        if (isLoading) {
            btn.dataset.original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.style.cursor = 'not-allowed';
        } else {
            btn.innerHTML = btn.dataset.original;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    }

    // Navigation
    document.getElementById('to-register').onclick = (e) => { e.preventDefault(); showView('register'); };
    document.getElementById('to-login').onclick = (e) => { e.preventDefault(); showView('login'); };
    document.getElementById('to-login-2').onclick = (e) => { e.preventDefault(); showView('login'); };
    document.getElementById('to-login-3').onclick = (e) => { e.preventDefault(); showView('login'); };
    document.getElementById('to-forgot').onclick = (e) => { e.preventDefault(); showView('forgot'); };

    // Registration
    document.getElementById('register-btn').onclick = async () => {
        const fullName = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const passcode = document.getElementById('reg-passcode').value;
        const confirmPasscode = document.getElementById('reg-confirm').value;
        const errorEl = document.getElementById('reg-error');

        if (!fullName || !email || !passcode) {
            errorEl.innerText = "Please fill in all fields.";
            errorEl.style.display = 'block';
            return;
        }

        if (passcode.length < 6) {
            errorEl.innerText = "Passcode must be at least 6 characters.";
            errorEl.style.display = 'block';
            return;
        }

        if (passcode !== confirmPasscode) {
            errorEl.innerText = "Passcodes do not match.";
            errorEl.style.display = 'block';
            return;
        }

        setBtnLoading('register-btn', true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, passcode, confirmPasscode })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Registration successful! Please login.');
                showView('login');
            } else {
                errorEl.innerText = data.message || data;
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = "Connection error.";
            errorEl.style.display = 'block';
        } finally {
            setBtnLoading('register-btn', false);
        }
    };

    // Login
    document.getElementById('login-btn').onclick = async () => {
        const email = document.getElementById('login-email').value;
        const passcode = document.getElementById('login-passcode').value;
        const errorEl = document.getElementById('login-error');

        if (!email || !passcode) {
            errorEl.innerText = "Please enter both email and passcode.";
            errorEl.style.display = 'block';
            return;
        }

        setBtnLoading('login-btn', true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, passcode })
            });
            const data = await res.json();
            if (res.ok && data.status === 'SUCCESS') {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/index.html';
            } else {
                errorEl.innerText = "Invalid credentials.";
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = "Connection error.";
            errorEl.style.display = 'block';
        } finally {
            setBtnLoading('login-btn', false);
        }
    };

    // Forgot
    document.getElementById('forgot-btn').onclick = async () => {
        const email = document.getElementById('forgot-email').value;
        const errorEl = document.getElementById('forgot-error');
        const successEl = document.getElementById('forgot-success');

        if (!email) {
            errorEl.innerText = "Please enter your email.";
            errorEl.style.display = 'block';
            return;
        }

        setBtnLoading('forgot-btn', true);
        try {
            const res = await fetch('/api/auth/forgot-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                successEl.innerText = "Reset code sent! Check your email.";
                successEl.style.display = 'block';
                setTimeout(() => {
                    document.getElementById('reset-email').value = email;
                    showView('reset');
                }, 2000);
            } else {
                const data = await res.text();
                errorEl.innerText = data;
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = "Connection error.";
            errorEl.style.display = 'block';
        } finally {
            setBtnLoading('forgot-btn', false);
        }
    };

    // Reset
    document.getElementById('reset-btn').onclick = async () => {
        const email = document.getElementById('reset-email').value;
        const resetCode = document.getElementById('reset-code').value;
        const newPasscode = document.getElementById('reset-passcode').value;
        const confirmPasscode = document.getElementById('reset-confirm').value;
        const errorEl = document.getElementById('reset-error');

        if (!resetCode || !newPasscode) {
            errorEl.innerText = "Please fill in all fields.";
            errorEl.style.display = 'block';
            return;
        }

        setBtnLoading('reset-btn', true);
        try {
            const res = await fetch('/api/auth/reset-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, resetCode, newPasscode, confirmPasscode })
            });
            if (res.ok) {
                alert('Passcode reset success! Please login.');
                showView('login');
            } else {
                const data = await res.text();
                errorEl.innerText = data;
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.innerText = "Connection error.";
            errorEl.style.display = 'block';
        } finally {
            setBtnLoading('reset-btn', false);
        }
    };
});


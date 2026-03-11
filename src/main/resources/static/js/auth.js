/**
 * =============================================================
 * B-MIS AUTH PAGE — JavaScript
 * Handles: view navigation, form validation, API calls,
 *          show/hide password, loading states, alert display.
 * =============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------
    // VIEW REFERENCES
    // -------------------------------------------------------
    const views = {
        login:    document.getElementById('login-view'),
        register: document.getElementById('register-view'),
        forgot:   document.getElementById('forgot-view'),
        reset:    document.getElementById('reset-view'),
    };

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    /** Switch the visible auth card */
    function showView(viewId) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewId].classList.remove('hidden');

        // Clear all alert boxes when switching views
        document.querySelectorAll('.alert-box').forEach(el => {
            el.classList.remove('visible');
            el.textContent = '';
        });
    }

    /** Show an error or success alert in a given element */
    function showAlert(elId, message, type = 'error') {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = message;
        el.classList.remove('alert-error', 'alert-success');
        el.classList.add(type === 'success' ? 'alert-success' : 'alert-error');
        el.classList.add('visible');
    }

    function hideAlert(elId) {
        const el = document.getElementById(elId);
        if (el) el.classList.remove('visible');
    }

    /** Set a button into loading/normal state */
    function setBtnLoading(btnId, isLoading) {
        const btn = document.getElementById(btnId);
        if (!btn) return;
        if (isLoading) {
            btn.dataset.originalHtml = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing…';
            btn.classList.add('loading');
        } else {
            btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
            btn.classList.remove('loading');
        }
    }

    /** Simple email format check */
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // -------------------------------------------------------
    // SHOW / HIDE PASSWORD TOGGLE
    // -------------------------------------------------------
    const pwdToggle = document.getElementById('pwd-toggle');
    const pwdInput  = document.getElementById('login-passcode');
    const pwdIcon   = document.getElementById('pwd-icon');

    if (pwdToggle) {
        pwdToggle.addEventListener('click', () => {
            const isHidden = pwdInput.type === 'password';
            pwdInput.type  = isHidden ? 'text' : 'password';
            pwdIcon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        });
    }

    // -------------------------------------------------------
    // NAVIGATION LINKS
    // -------------------------------------------------------
    document.getElementById('to-register')?.addEventListener('click', e => { e.preventDefault(); showView('register'); });
    document.getElementById('to-login')?.addEventListener('click',    e => { e.preventDefault(); showView('login'); });
    document.getElementById('to-login-2')?.addEventListener('click',  e => { e.preventDefault(); showView('login'); });
    document.getElementById('to-login-3')?.addEventListener('click',  e => { e.preventDefault(); showView('login'); });
    document.getElementById('to-forgot')?.addEventListener('click',   e => { e.preventDefault(); showView('forgot'); });

    // -------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('login-error');

        const email   = document.getElementById('login-email').value.trim();
        const passcode = document.getElementById('login-passcode').value;

        // Client-side validation
        if (!email || !passcode) {
            showAlert('login-error', 'Please fill in both fields.'); return;
        }
        if (!isValidEmail(email)) {
            showAlert('login-error', 'Please enter a valid email address.'); return;
        }

        setBtnLoading('login-btn', true);
        try {
            const res  = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, passcode }),
            });
            const data = await res.json();

            if (res.ok && data.status === 'SUCCESS') {
                // Persist session and navigate to dashboard
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = '/index.html';
            } else {
                showAlert('login-error', 'Invalid email or passcode. Please try again.');
            }
        } catch {
            showAlert('login-error', 'Unable to connect. Please check your network.');
        } finally {
            setBtnLoading('login-btn', false);
        }
    });

    // -------------------------------------------------------
    // REGISTER
    // -------------------------------------------------------
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('reg-error');
        hideAlert('reg-success');

        const fullName       = document.getElementById('reg-name').value.trim();
        const email          = document.getElementById('reg-email').value.trim();
        const passcode       = document.getElementById('reg-passcode').value;
        const confirmPasscode = document.getElementById('reg-confirm').value;

        // Validation
        if (!fullName || !email || !passcode || !confirmPasscode) {
            showAlert('reg-error', 'Please fill in all fields.'); return;
        }
        if (!isValidEmail(email)) {
            showAlert('reg-error', 'Please enter a valid email address.'); return;
        }
        if (passcode.length < 6) {
            showAlert('reg-error', 'Passcode must be at least 6 characters.'); return;
        }
        if (passcode !== confirmPasscode) {
            showAlert('reg-error', 'Passcodes do not match.'); return;
        }

        setBtnLoading('register-btn', true);
        try {
            const res  = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, passcode, confirmPasscode }),
            });
            const data = await res.json();

            if (res.ok) {
                showAlert('reg-success', 'Account created! Redirecting to login…', 'success');
                setTimeout(() => showView('login'), 2000);
            } else {
                showAlert('reg-error', data.message || data || 'Registration failed.');
            }
        } catch {
            showAlert('reg-error', 'Unable to connect. Please check your network.');
        } finally {
            setBtnLoading('register-btn', false);
        }
    });

    // -------------------------------------------------------
    // FORGOT PASSCODE
    // -------------------------------------------------------
    document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('forgot-error');
        hideAlert('forgot-success');

        const email = document.getElementById('forgot-email').value.trim();

        if (!email || !isValidEmail(email)) {
            showAlert('forgot-error', 'Please enter a valid registered email.'); return;
        }

        setBtnLoading('forgot-btn', true);
        try {
            const res = await fetch('/api/auth/forgot-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                showAlert('forgot-success', 'Reset code sent! Check your inbox.', 'success');
                setTimeout(() => {
                    document.getElementById('reset-email').value = email;
                    showView('reset');
                }, 2200);
            } else {
                const text = await res.text();
                showAlert('forgot-error', text || 'Email not found in our records.');
            }
        } catch {
            showAlert('forgot-error', 'Unable to connect. Please check your network.');
        } finally {
            setBtnLoading('forgot-btn', false);
        }
    });

    // -------------------------------------------------------
    // RESET PASSCODE
    // -------------------------------------------------------
    document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('reset-error');

        const email          = document.getElementById('reset-email').value;
        const resetCode      = document.getElementById('reset-code').value.trim();
        const newPasscode    = document.getElementById('reset-passcode').value;
        const confirmPasscode = document.getElementById('reset-confirm').value;

        if (!resetCode || !newPasscode || !confirmPasscode) {
            showAlert('reset-error', 'Please fill in all fields.'); return;
        }
        if (newPasscode.length < 6) {
            showAlert('reset-error', 'New passcode must be at least 6 characters.'); return;
        }
        if (newPasscode !== confirmPasscode) {
            showAlert('reset-error', 'Passcodes do not match.'); return;
        }

        setBtnLoading('reset-btn', true);
        try {
            const res = await fetch('/api/auth/reset-passcode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, resetCode, newPasscode, confirmPasscode }),
            });

            if (res.ok) {
                alert('Passcode updated! Please login with your new passcode.');
                showView('login');
            } else {
                const text = await res.text();
                showAlert('reset-error', text || 'Invalid or expired reset code.');
            }
        } catch {
            showAlert('reset-error', 'Unable to connect. Please check your network.');
        } finally {
            setBtnLoading('reset-btn', false);
        }
    });

}); // end DOMContentLoaded

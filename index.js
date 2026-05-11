import { renderExtensionTemplateAsync } from '/scripts/extensions.js';
import { eventSource, event_types } from '../../../events.js';

let phoneOverlay = null;
let currentApp = null;
let clockInterval = null;

function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('phone-status-time');
    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes}`;
    }
}

function openPhone() {
    if (!phoneOverlay) return;
    phoneOverlay.classList.add('active');
    updateTime();
    if (!clockInterval) {
        clockInterval = setInterval(updateTime, 1000);
    }
}

function closePhone() {
    if (!phoneOverlay) return;
    phoneOverlay.classList.remove('active');
    goHome();
    if (clockInterval) {
        clearInterval(clockInterval);
        clockInterval = null;
    }
}

function goHome() {
    const home = document.getElementById('phone-home');
    const appContent = document.getElementById('phone-app-content');
    if (home) home.style.display = 'block';
    if (appContent) appContent.classList.remove('active');
    currentApp = null;
}

function openApp(appName) {
    const home = document.getElementById('phone-home');
    const appContent = document.getElementById('phone-app-content');
    const appTitle = document.getElementById('app-title');
    const appBody = document.getElementById('app-body');

    if (!home || !appContent || !appTitle || !appBody) return;

    home.style.display = 'none';
    appContent.classList.add('active');
    currentApp = appName;

    const appConfig = getAppConfig(appName);
    appTitle.textContent = appConfig.title;
    appBody.innerHTML = appConfig.content;

    if (appConfig.onInit) {
        appConfig.onInit();
    }
}

function calculate(a, b, op) {
    switch (op) {
        case 'add': return a + b;
        case 'subtract': return a - b;
        case 'multiply': return a * b;
        case 'divide': return b !== 0 ? a / b : 'Error';
        default: return b;
    }
}

function getAppConfig(appName) {
    const configs = {
        wechat: {
            title: '微信',
            content: `
                <div class="wechat-content">
                    <div class="wechat-chat-list">
                        <div class="chat-item">
                            <div class="chat-avatar">👤</div>
                            <div class="chat-info">
                                <div class="chat-name">小明</div>
                                <div class="chat-preview">你好！最近怎么样？</div>
                            </div>
                        </div>
                        <div class="chat-item">
                            <div class="chat-avatar">👥</div>
                            <div class="chat-info">
                                <div class="chat-name">工作群</div>
                                <div class="chat-preview">明天开会，请大家准时参加</div>
                            </div>
                        </div>
                        <div class="chat-item">
                            <div class="chat-avatar">👩</div>
                            <div class="chat-info">
                                <div class="chat-name">小红</div>
                                <div class="chat-preview">周末一起吃饭吗？</div>
                            </div>
                        </div>
                        <div class="chat-item">
                            <div class="chat-avatar">🤖</div>
                            <div class="chat-info">
                                <div class="chat-name">订阅号</div>
                                <div class="chat-preview">今日热点新闻...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        calendar: {
            title: '日历',
            content: (() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const today = now.getDate();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const daysInPrevMonth = new Date(year, month, 0).getDate();

                const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                let html = `<div style="text-align:center;font-size:18px;font-weight:600;margin:16px 0;">${year}年${month + 1}月</div>`;
                html += '<div class="calendar-grid">';

                weekdays.forEach(day => {
                    html += `<div class="calendar-header">${day}</div>`;
                });

                for (let i = firstDay - 1; i >= 0; i--) {
                    html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
                }

                for (let day = 1; day <= daysInMonth; day++) {
                    const isToday = day === today ? ' today' : '';
                    html += `<div class="calendar-day${isToday}">${day}</div>`;
                }

                const remaining = 42 - (firstDay + daysInMonth);
                for (let day = 1; day <= remaining && day <= 14; day++) {
                    html += `<div class="calendar-day other-month">${day}</div>`;
                }

                html += '</div>';
                return html;
            })()
        },
        photos: {
            title: '相册',
            content: `
                <div class="photos-content">
                    <div class="photos-grid">
                        <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:4px;">🌅</div>
                        <div style="background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:4px;">🌄</div>
                        <div style="background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:4px;">🌊</div>
                        <div style="background:linear-gradient(135deg,#43e97b,#38f9d7);border-radius:4px;">🌳</div>
                        <div style="background:linear-gradient(135deg,#fa709a,#fee140);border-radius:4px;">🌸</div>
                        <div style="background:linear-gradient(135deg,#a8edea,#fed6e3);border-radius:4px;">🌺</div>
                    </div>
                </div>
            `
        },
        notes: {
            title: '备忘录',
            content: `
                <div class="notes-content">
                    <div class="note-item">
                        <div class="note-title">购物清单</div>
                        <div class="note-preview">牛奶、面包、鸡蛋、水果...</div>
                    </div>
                    <div class="note-item">
                        <div class="note-title">工作计划</div>
                        <div class="note-preview">1. 完成项目报告 2. 开会讨论...</div>
                    </div>
                </div>
            `
        },
        weather: {
            title: '天气',
            content: `
                <div class="weather-content">
                    <div class="weather-display">
                        <div style="font-size:64px;margin-bottom:16px;">☀️</div>
                        <div class="weather-temp">26°</div>
                        <div class="weather-condition">晴天</div>
                    </div>
                </div>
            `
        },
        music: {
            title: '音乐',
            content: `
                <div class="music-content">
                    <div class="music-cover">🎵</div>
                    <div class="music-info">
                        <div class="music-title">晴天</div>
                        <div class="music-artist">周杰伦</div>
                    </div>
                </div>
            `
        },
        settings: {
            title: '设置',
            content: `
                <div class="settings-content">
                    <div class="settings-item">
                        <div class="settings-icon-small" style="background:#007aff;">📶</div>
                        <span>Wi-Fi</span>
                        <span class="settings-arrow">›</span>
                    </div>
                    <div class="settings-item">
                        <div class="settings-icon-small" style="background:#007aff;">📱</div>
                        <span>蓝牙</span>
                        <span class="settings-arrow">›</span>
                    </div>
                    <div class="settings-item">
                        <div class="settings-icon-small" style="background:#34c759;">🔔</div>
                        <span>通知</span>
                        <span class="settings-arrow">›</span>
                    </div>
                </div>
            `
        },
        calculator: {
            title: '计算器',
            content: `
                <div class="calculator-content">
                    <div class="calculator-display">
                        <div class="calc-result" id="calc-result">0</div>
                        <div class="calc-buttons">
                            <button class="calc-btn function" data-action="clear">AC</button>
                            <button class="calc-btn function" data-action="negate">+/-</button>
                            <button class="calc-btn function" data-action="percent">%</button>
                            <button class="calc-btn operator" data-action="divide">÷</button>
                            <button class="calc-btn number" data-value="7">7</button>
                            <button class="calc-btn number" data-value="8">8</button>
                            <button class="calc-btn number" data-value="9">9</button>
                            <button class="calc-btn operator" data-action="multiply">×</button>
                            <button class="calc-btn number" data-value="4">4</button>
                            <button class="calc-btn number" data-value="5">5</button>
                            <button class="calc-btn number" data-value="6">6</button>
                            <button class="calc-btn operator" data-action="subtract">−</button>
                            <button class="calc-btn number" data-value="1">1</button>
                            <button class="calc-btn number" data-value="2">2</button>
                            <button class="calc-btn number" data-value="3">3</button>
                            <button class="calc-btn operator" data-action="add">+</button>
                            <button class="calc-btn number zero" data-value="0">0</button>
                            <button class="calc-btn number" data-value=".">.</button>
                            <button class="calc-btn operator" data-action="equals">=</button>
                        </div>
                    </div>
                </div>
            `,
            onInit: () => {
                let display = '0';
                let previous = null;
                let operation = null;
                let shouldReset = false;

                const resultEl = document.getElementById('calc-result');
                if (!resultEl) return;

                document.querySelectorAll('.calc-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const value = btn.dataset.value;
                        const action = btn.dataset.action;

                        if (value !== undefined) {
                            if (shouldReset) { display = ''; shouldReset = false; }
                            if (value === '.' && display.includes('.')) return;
                            display = (display === '0' && value !== '.') ? value : display + value;
                        } else if (action) {
                            switch (action) {
                                case 'clear':
                                    display = '0'; previous = null; operation = null; shouldReset = false;
                                    break;
                                case 'negate':
                                    display = String(-parseFloat(display));
                                    break;
                                case 'percent':
                                    display = String(parseFloat(display) / 100);
                                    break;
                                case 'add': case 'subtract': case 'multiply': case 'divide':
                                    if (previous !== null && operation && !shouldReset) {
                                        display = String(calculate(previous, parseFloat(display), operation));
                                    }
                                    previous = parseFloat(display);
                                    operation = action;
                                    shouldReset = true;
                                    break;
                                case 'equals':
                                    if (previous !== null && operation) {
                                        display = String(calculate(previous, parseFloat(display), operation));
                                        previous = null; operation = null; shouldReset = true;
                                    }
                                    break;
                            }
                        }
                        resultEl.textContent = display;
                    });
                });
            }
        }
    };

    return configs[appName] || { title: appName, content: '<div>应用未找到</div>' };
}

function registerMenu() {
    const addMenuItem = () => {
        const container = document.getElementById('phone_wand_container');
        if (!container) return;

        if (document.getElementById('phone-toggle')) return;

        const item = document.createElement('div');
        item.id = 'phone-toggle';
        item.className = 'list-group-item flex-container flexGap5';
        item.innerHTML = `
            <div class="fa-solid fa-mobile-screen-button extensionsMenuExtensionButton"></div>
            <span>小手机</span>
        `;

        item.addEventListener('click', () => {
            if (phoneOverlay?.classList.contains('active')) {
                closePhone();
            } else {
                openPhone();
            }
        });

        container.appendChild(item);
        console.log('[小手机插件] 菜单注册成功');
    };

    addMenuItem();

    eventSource.on(event_types.APP_READY, () => {
        setTimeout(addMenuItem, 100);
    });

    const observer = new MutationObserver(() => {
        addMenuItem();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
        observer.disconnect();
        if (!document.getElementById('phone-toggle')) {
            console.warn('[小手机插件] 菜单注册超时，尝试直接创建容器');
            createContainerAndAddMenu();
        }
    }, 10000);
}

function createContainerAndAddMenu() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu) return;

    const container = document.createElement('div');
    container.id = 'phone_wand_container';
    container.className = 'extension_container';
    menu.appendChild(container);

    const item = document.createElement('div');
    item.id = 'phone-toggle';
    item.className = 'list-group-item flex-container flexGap5';
    item.innerHTML = `
        <div class="fa-solid fa-mobile-screen-button extensionsMenuExtensionButton"></div>
        <span>小手机</span>
    `;

    item.addEventListener('click', () => {
        if (phoneOverlay?.classList.contains('active')) {
            closePhone();
        } else {
            openPhone();
        }
    });

    container.appendChild(item);
    console.log('[小手机插件] 通过创建容器注册菜单成功');
}

function setupEvents() {
    if (!phoneOverlay) return;

    phoneOverlay.addEventListener('click', (e) => {
        if (e.target === phoneOverlay) closePhone();
    });

    const homeBtn = document.getElementById('home-button');
    if (homeBtn) homeBtn.addEventListener('click', goHome);

    const backBtn = document.getElementById('back-button');
    if (backBtn) backBtn.addEventListener('click', goHome);

    document.addEventListener('click', (e) => {
        const appItem = e.target.closest('.app-item, .dock-item');
        if (appItem && appItem.dataset.app) {
            openApp(appItem.dataset.app);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && phoneOverlay?.classList.contains('active')) {
            closePhone();
        }
    });
}

export async function init() {
    try {
        const html = await renderExtensionTemplateAsync('third-party/qwq', 'phone');
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        phoneOverlay = tempContainer.firstChild;
        document.body.appendChild(phoneOverlay);

        registerMenu();
        setupEvents();
    } catch (error) {
        console.error('[小手机插件] 初始化失败:', error);
    }
}
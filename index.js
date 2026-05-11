import { eventSource, event_types } from '../../../script.js';

let phoneOverlay = null;
let clockTimer = null;

function updateClock() {
    const el = document.getElementById('qwq-clock');
    if (!el) return;
    const now = new Date();
    el.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
}

function openPhone() {
    if (!phoneOverlay) return;
    phoneOverlay.classList.add('active');
    updateClock();
    if (!clockTimer) clockTimer = setInterval(updateClock, 1000);
}

function closePhone() {
    if (!phoneOverlay) return;
    phoneOverlay.classList.remove('active');
    goHome();
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
}

function goHome() {
    const home = document.getElementById('qwq-home');
    const view = document.getElementById('qwq-app-view');
    if (home) home.style.display = 'flex';
    if (view) view.classList.remove('active');
}

function openApp(name) {
    const home = document.getElementById('qwq-home');
    const view = document.getElementById('qwq-app-view');
    const title = document.getElementById('qwq-app-title');
    const body = document.getElementById('qwq-app-body');
    if (!home || !view || !title || !body) return;

    home.style.display = 'none';
    view.classList.add('active');

    const app = APPS[name];
    title.textContent = app ? app.title : name;
    body.innerHTML = app ? app.render() : '<div style="padding:24px;color:#999;">应用未找到</div>';
    if (app && app.init) app.init(body);
}

function buildCalendar() {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const prev = new Date(y, m, 0).getDate();
    const weeks = ['日', '一', '二', '三', '四', '五', '六'];

    let h = '<div class="qwq-calendar-month">' + y + '年' + (m + 1) + '月</div>';
    h += '<div class="qwq-calendar-grid">';
    weeks.forEach(w => { h += '<div class="qwq-calendar-weekday">' + w + '</div>'; });
    for (let i = first - 1; i >= 0; i--) { h += '<div class="qwq-calendar-day other">' + (prev - i) + '</div>'; }
    for (let d = 1; d <= days; d++) {
        h += '<div class="qwq-calendar-day' + (d === today ? ' today' : '') + '">' + d + '</div>';
    }
    const rem = 42 - (first + days);
    for (let d = 1; d <= rem && d <= 14; d++) { h += '<div class="qwq-calendar-day other">' + d + '</div>'; }
    h += '</div>';
    return h;
}

function initCalculator(container) {
    let display = '0', prev = null, op = null, reset = false;
    const result = container.querySelector('#qwq-calc-result');
    if (!result) return;

    container.querySelectorAll('.qwq-calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.dataset.value;
            const a = btn.dataset.action;

            if (v !== undefined) {
                if (reset) { display = ''; reset = false; }
                if (v === '.' && display.includes('.')) return;
                display = (display === '0' && v !== '.') ? v : display + v;
            } else if (a) {
                const calc = (x, y, o) => {
                    switch (o) {
                        case 'add': return x + y;
                        case 'sub': return x - y;
                        case 'mul': return x * y;
                        case 'div': return y !== 0 ? x / y : 'Error';
                        default: return y;
                    }
                };
                switch (a) {
                    case 'clear': display = '0'; prev = null; op = null; reset = false; break;
                    case 'neg': display = String(-parseFloat(display)); break;
                    case 'pct': display = String(parseFloat(display) / 100); break;
                    case 'add': case 'sub': case 'mul': case 'div':
                        if (prev !== null && op && !reset) display = String(calc(prev, parseFloat(display), op));
                        prev = parseFloat(display); op = a; reset = true; break;
                    case 'eq':
                        if (prev !== null && op) { display = String(calc(prev, parseFloat(display), op)); prev = null; op = null; reset = true; }
                        break;
                }
            }
            result.textContent = display;
        });
    });
}

const APPS = {
    wechat: {
        title: '微信',
        render: () => `<div class="qwq-wechat-list">
            <div class="qwq-chat-item"><div class="qwq-chat-avatar">👤</div><div class="qwq-chat-info"><div class="qwq-chat-name">小明</div><div class="qwq-chat-preview">你好！最近怎么样？</div></div></div>
            <div class="qwq-chat-item"><div class="qwq-chat-avatar">👥</div><div class="qwq-chat-info"><div class="qwq-chat-name">工作群</div><div class="qwq-chat-preview">明天开会，请大家准时参加</div></div></div>
            <div class="qwq-chat-item"><div class="qwq-chat-avatar">👩</div><div class="qwq-chat-info"><div class="qwq-chat-name">小红</div><div class="qwq-chat-preview">周末一起吃饭吗？</div></div></div>
            <div class="qwq-chat-item"><div class="qwq-chat-avatar">🤖</div><div class="qwq-chat-info"><div class="qwq-chat-name">订阅号</div><div class="qwq-chat-preview">今日热点新闻...</div></div></div>
        </div>`
    },
    calendar: {
        title: '日历',
        render: () => buildCalendar()
    },
    photos: {
        title: '相册',
        render: () => `<div class="qwq-photos-grid">
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#667eea,#764ba2)">🌅</div>
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#f093fb,#f5576c)">🌄</div>
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">🌊</div>
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">🌳</div>
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#fa709a,#fee140)">🌸</div>
            <div class="qwq-photos-item" style="background:linear-gradient(135deg,#a8edea,#fed6e3)">🌺</div>
        </div>`
    },
    notes: {
        title: '备忘录',
        render: () => `<div class="qwq-notes-list">
            <div class="qwq-note-card"><div class="qwq-note-title">购物清单</div><div class="qwq-note-text">牛奶、面包、鸡蛋、水果...</div></div>
            <div class="qwq-note-card"><div class="qwq-note-title">工作计划</div><div class="qwq-note-text">1. 完成项目报告 2. 开会讨论...</div></div>
        </div>`
    },
    weather: {
        title: '天气',
        render: () => `<div class="qwq-weather-hero">
            <div class="qwq-weather-icon">☀️</div>
            <div class="qwq-weather-temp">26°</div>
            <div class="qwq-weather-desc">晴天</div>
        </div>`
    },
    music: {
        title: '音乐',
        render: () => `<div class="qwq-music-player">
            <div class="qwq-music-cover">🎵</div>
            <div class="qwq-music-title">晴天</div>
            <div class="qwq-music-artist">周杰伦</div>
        </div>`
    },
    settings: {
        title: '设置',
        render: () => `<div class="qwq-settings-list">
            <div class="qwq-settings-item"><div class="qwq-settings-icon" style="background:#007aff">📶</div><span>Wi-Fi</span><span class="qwq-settings-arrow">›</span></div>
            <div class="qwq-settings-item"><div class="qwq-settings-icon" style="background:#007aff">📱</div><span>蓝牙</span><span class="qwq-settings-arrow">›</span></div>
            <div class="qwq-settings-item"><div class="qwq-settings-icon" style="background:#34c759">🔔</div><span>通知</span><span class="qwq-settings-arrow">›</span></div>
        </div>`
    },
    calculator: {
        title: '计算器',
        render: () => `<div style="display:flex;flex-direction:column;height:100%;background:#1c1c1e">
            <div class="qwq-calc-display"><div class="qwq-calc-result" id="qwq-calc-result">0</div></div>
            <div class="qwq-calc-buttons">
                <button class="qwq-calc-btn fn" data-action="clear">AC</button>
                <button class="qwq-calc-btn fn" data-action="neg">+/-</button>
                <button class="qwq-calc-btn fn" data-action="pct">%</button>
                <button class="qwq-calc-btn op" data-action="div">÷</button>
                <button class="qwq-calc-btn num" data-value="7">7</button>
                <button class="qwq-calc-btn num" data-value="8">8</button>
                <button class="qwq-calc-btn num" data-value="9">9</button>
                <button class="qwq-calc-btn op" data-action="mul">×</button>
                <button class="qwq-calc-btn num" data-value="4">4</button>
                <button class="qwq-calc-btn num" data-value="5">5</button>
                <button class="qwq-calc-btn num" data-value="6">6</button>
                <button class="qwq-calc-btn op" data-action="sub">−</button>
                <button class="qwq-calc-btn num" data-value="1">1</button>
                <button class="qwq-calc-btn num" data-value="2">2</button>
                <button class="qwq-calc-btn num" data-value="3">3</button>
                <button class="qwq-calc-btn op" data-action="add">+</button>
                <button class="qwq-calc-btn num zero" data-value="0">0</button>
                <button class="qwq-calc-btn num" data-value=".">.</button>
                <button class="qwq-calc-btn op" data-action="eq">=</button>
            </div>
        </div>`,
        init: initCalculator
    }
};

function createPhoneUI() {
    if (document.querySelector('.qwq-phone-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'qwq-phone-overlay';
    overlay.innerHTML = `
        <div class="qwq-phone-frame">
            <div class="qwq-phone-notch"></div>
            <div class="qwq-phone-statusbar">
                <span id="qwq-clock">12:00</span>
                <div class="qwq-phone-statusbar-icons"><span>📶</span><span>🔋</span></div>
            </div>
            <div class="qwq-phone-screen">
                <div class="qwq-phone-home" id="qwq-home">
                    <div class="qwq-phone-wallpaper"></div>
                    <div class="qwq-phone-apps">
                        <div class="qwq-app-grid">
                            <div class="qwq-app-item" data-app="wechat"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#07c160,#05a650)">💬</div><div class="qwq-app-name">微信</div></div>
                            <div class="qwq-app-item" data-app="calendar"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#ff6b6b,#ee5a52)">📅</div><div class="qwq-app-name">日历</div></div>
                            <div class="qwq-app-item" data-app="photos"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#ff9ff3,#f368e0)">🖼️</div><div class="qwq-app-name">相册</div></div>
                            <div class="qwq-app-item" data-app="notes"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#feca57,#ff9f43)">📝</div><div class="qwq-app-name">备忘录</div></div>
                            <div class="qwq-app-item" data-app="weather"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#48dbfb,#0abde3)">🌤️</div><div class="qwq-app-name">天气</div></div>
                            <div class="qwq-app-item" data-app="music"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#ff6348,#ff4757)">🎵</div><div class="qwq-app-name">音乐</div></div>
                            <div class="qwq-app-item" data-app="settings"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#8395a7,#636e72)">⚙️</div><div class="qwq-app-name">设置</div></div>
                            <div class="qwq-app-item" data-app="calculator"><div class="qwq-app-icon" style="background:linear-gradient(135deg,#5f27cd,#341f97)">🔢</div><div class="qwq-app-name">计算器</div></div>
                        </div>
                    </div>
                    <div class="qwq-phone-dock">
                        <div class="qwq-dock-items">
                            <div class="qwq-dock-item" data-app="wechat"><div class="qwq-dock-icon" style="background:linear-gradient(135deg,#07c160,#05a650)">💬</div></div>
                            <div class="qwq-dock-item" data-app="photos"><div class="qwq-dock-icon" style="background:linear-gradient(135deg,#ff9ff3,#f368e0)">🖼️</div></div>
                            <div class="qwq-dock-item" data-app="music"><div class="qwq-dock-icon" style="background:linear-gradient(135deg,#ff6348,#ff4757)">🎵</div></div>
                            <div class="qwq-dock-item" data-app="settings"><div class="qwq-dock-icon" style="background:linear-gradient(135deg,#8395a7,#636e72)">⚙️</div></div>
                        </div>
                    </div>
                </div>
                <div class="qwq-app-view" id="qwq-app-view">
                    <div class="qwq-app-header">
                        <button class="qwq-back-btn" id="qwq-back-btn">←</button>
                        <span class="qwq-app-title" id="qwq-app-title"></span>
                    </div>
                    <div class="qwq-app-body" id="qwq-app-body"></div>
                </div>
            </div>
            <div class="qwq-phone-homebar">
                <button class="qwq-home-btn" id="qwq-home-btn"></button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    phoneOverlay = overlay;

    overlay.addEventListener('click', e => { if (e.target === overlay) closePhone(); });
    document.getElementById('qwq-home-btn').addEventListener('click', goHome);
    document.getElementById('qwq-back-btn').addEventListener('click', goHome);

    overlay.addEventListener('click', e => {
        const item = e.target.closest('[data-app]');
        if (item) openApp(item.dataset.app);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && phoneOverlay && phoneOverlay.classList.contains('active')) closePhone();
    });
}

function registerMenu() {
    const menu = document.querySelector('#extensionsMenu');
    if (!menu) return;

    if (document.getElementById('qwq-menu-item')) return;

    const item = document.createElement('div');
    item.id = 'qwq-menu-item';
    item.className = 'list-group-item flex-container flexGap5';
    item.innerHTML = '<div class="fa-solid fa-mobile-screen-button extensionsMenuExtensionButton"></div><span>小手机</span>';

    item.addEventListener('click', () => {
        if (phoneOverlay && phoneOverlay.classList.contains('active')) {
            closePhone();
        } else {
            openPhone();
        }
    });

    menu.appendChild(item);
    console.log('[小手机] 菜单注册成功');
}

export async function init() {
    try {
        createPhoneUI();

        eventSource.on(event_types.APP_READY, () => {
            registerMenu();
        });

        registerMenu();
    } catch (err) {
        console.error('[小手机] 初始化失败:', err);
    }
}
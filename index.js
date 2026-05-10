import { renderExtensionTemplateAsync } from '/scripts/extensions.js';
import { eventSource, event_types } from '/scripts/script.js';

let phoneOverlay = null;
let currentApp = null;
let clockInterval = null;
let phoneInitialized = false;

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
    if (phoneOverlay) {
        phoneOverlay.addClass('active');
        updateTime();
        if (!clockInterval) {
            clockInterval = setInterval(updateTime, 1000);
        }
    }
}

function closePhone() {
    if (phoneOverlay) {
        phoneOverlay.removeClass('active');
        goHome();
        if (clockInterval) {
            clearInterval(clockInterval);
            clockInterval = null;
        }
    }
}

function goHome() {
    const home = document.getElementById('phone-home');
    const appContent = document.getElementById('phone-app-content');
    if (home) home.style.display = 'block';
    if (appContent) {
        appContent.classList.remove('active', 'slide-in');
        appContent.classList.add('slide-out');
        setTimeout(() => {
            appContent.classList.remove('slide-out');
        }, 300);
    }
    currentApp = null;
}

function openApp(appName) {
    const home = document.getElementById('phone-home');
    const appContent = document.getElementById('phone-app-content');
    const appTitle = document.getElementById('app-title');
    const appBody = document.getElementById('app-body');

    if (!home || !appContent || !appTitle || !appBody) return;

    home.style.display = 'none';
    appContent.classList.add('active', 'slide-in');
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
                            <div class="chat-avatar group">👥</div>
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
                            <div class="chat-avatar official">🤖</div>
                            <div class="chat-info">
                                <div class="chat-name">订阅号消息</div>
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
                let html = `<div style="text-align:center;font-size:18px;font-weight:600;margin-bottom:16px;">${year}年${month + 1}月</div>`;
                html += '<div class="calendar-grid">';

                weekdays.forEach(day => {
                    html += `<div class="calendar-header-row">${day}</div>`;
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
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px;">
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#43e97b,#38f9d7);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#fa709a,#fee140);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#a8edea,#fed6e3);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#ffecd2,#fcb69f);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#ff9a9e,#fecfef);border-radius:4px;"></div>
                        <div style="aspect-ratio:1;background:linear-gradient(135deg,#a18cd1,#fbc2eb);border-radius:4px;"></div>
                    </div>
                </div>
            `
        },
        notes: {
            title: '备忘录',
            content: `
                <div class="notes-content">
                    <div class="notes-list">
                        <div class="note-item">
                            <div class="note-title">购物清单</div>
                            <div class="note-preview">牛奶、面包、鸡蛋、水果...</div>
                            <div class="note-date">今天 上午9:30</div>
                        </div>
                        <div class="note-item">
                            <div class="note-title">工作计划</div>
                            <div class="note-preview">1. 完成项目报告 2. 开会讨论...</div>
                            <div class="note-date">昨天 下午3:15</div>
                        </div>
                        <div class="note-item">
                            <div class="note-title">读书笔记</div>
                            <div class="note-preview">《活着》- 余华，人生就像一场旅程...</div>
                            <div class="note-date">3天前</div>
                        </div>
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
                        <div class="weather-details">
                            <div class="weather-detail">
                                <div class="weather-detail-label">湿度</div>
                                <div class="weather-detail-value">45%</div>
                            </div>
                            <div class="weather-detail">
                                <div class="weather-detail-label">风速</div>
                                <div class="weather-detail-value">12km/h</div>
                            </div>
                            <div class="weather-detail">
                                <div class="weather-detail-label">紫外线</div>
                                <div class="weather-detail-value">中等</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        music: {
            title: '音乐',
            content: `
                <div class="music-content">
                    <div class="music-player">
                        <div class="music-cover">🎵</div>
                        <div class="music-info">
                            <div class="music-title">晴天</div>
                            <div class="music-artist">周杰伦</div>
                        </div>
                        <div style="background:#e5e5ea;height:4px;border-radius:2px;margin-bottom:24px;">
                            <div style="background:#007aff;height:100%;width:35%;border-radius:2px;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#8e8e93;margin-bottom:24px;">
                            <span>1:23</span>
                            <span>4:29</span>
                        </div>
                        <div class="music-controls">
                            <button class="music-btn">⏮</button>
                            <button class="music-btn play">▶</button>
                            <button class="music-btn">⏭</button>
                        </div>
                    </div>
                </div>
            `
        },
        settings: {
            title: '设置',
            content: `
                <div class="settings-content">
                    <div class="settings-list">
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#007aff;">📶</div>
                                <span>Wi-Fi</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#007aff;">📱</div>
                                <span>蓝牙</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#34c759;">🔔</div>
                                <span>通知</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#ff9500;">🔊</div>
                                <span>声音</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#5856d6;">🌙</div>
                                <span>显示与亮度</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                        <div class="settings-item">
                            <div class="settings-item-left">
                                <div class="settings-icon-small" style="background:#ff3b30;">🔋</div>
                                <span>电池</span>
                            </div>
                            <span class="settings-arrow">›</span>
                        </div>
                    </div>
                </div>
            `
        },
        clock: {
            title: '时钟',
            content: (() => {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                return `
                    <div class="clock-content">
                        <div class="clock-display">
                            <div class="clock-time">${hours}:${minutes}:${seconds}</div>
                            <div class="clock-date">${dateStr}</div>
                        </div>
                    </div>
                `;
            })(),
            onInit: () => {
                const updateClock = () => {
                    if (currentApp !== 'clock') return;
                    const now = new Date();
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
                    const timeEl = document.querySelector('.clock-time');
                    const dateEl = document.querySelector('.clock-date');
                    if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;
                    if (dateEl) dateEl.textContent = dateStr;
                };
                setInterval(updateClock, 1000);
            }
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
                let calcDisplay = '0';
                let calcPrevious = null;
                let calcOperation = null;
                let calcReset = false;

                const resultEl = document.getElementById('calc-result');
                const buttons = document.querySelectorAll('.calc-btn');

                buttons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const value = btn.dataset.value;
                        const action = btn.dataset.action;

                        if (value !== undefined) {
                            if (calcReset) {
                                calcDisplay = '';
                                calcReset = false;
                            }
                            if (value === '.' && calcDisplay.includes('.')) return;
                            if (calcDisplay === '0' && value !== '.') {
                                calcDisplay = value;
                            } else {
                                calcDisplay += value;
                            }
                        } else if (action) {
                            switch (action) {
                                case 'clear':
                                    calcDisplay = '0';
                                    calcPrevious = null;
                                    calcOperation = null;
                                    calcReset = false;
                                    break;
                                case 'negate':
                                    calcDisplay = String(-parseFloat(calcDisplay));
                                    break;
                                case 'percent':
                                    calcDisplay = String(parseFloat(calcDisplay) / 100);
                                    break;
                                case 'add':
                                case 'subtract':
                                case 'multiply':
                                case 'divide':
                                    if (calcPrevious !== null && calcOperation && !calcReset) {
                                        calcDisplay = String(calculate(calcPrevious, parseFloat(calcDisplay), calcOperation));
                                    }
                                    calcPrevious = parseFloat(calcDisplay);
                                    calcOperation = action;
                                    calcReset = true;
                                    break;
                                case 'equals':
                                    if (calcPrevious !== null && calcOperation) {
                                        calcDisplay = String(calculate(calcPrevious, parseFloat(calcDisplay), calcOperation));
                                        calcPrevious = null;
                                        calcOperation = null;
                                        calcReset = true;
                                    }
                                    break;
                            }
                        }

                        if (resultEl) {
                            resultEl.textContent = calcDisplay;
                        }
                    });
                });
            }
        },
        browser: {
            title: '浏览器',
            content: `
                <div class="browser-content">
                    <div class="browser-nav">
                        <div class="browser-url-bar">
                            <span class="browser-url-icon">🔍</span>
                            <input type="text" class="browser-url-input" placeholder="搜索或输入网址" value="www.google.com">
                        </div>
                    </div>
                    <div class="browser-body">
                        <div class="browser-home-icon">🌐</div>
                        <div class="browser-title">欢迎使用浏览器</div>
                        <div class="browser-subtitle">输入网址开始浏览</div>
                    </div>
                </div>
            `
        },
        camera: {
            title: '相机',
            content: `
                <div class="camera-content">
                    <div class="camera-viewfinder">
                        <div class="camera-overlay">
                            <span class="camera-mode">拍照</span>
                            <span class="camera-flash">⚡</span>
                        </div>
                        📷
                    </div>
                    <div class="camera-controls">
                        <div class="camera-gallery">�</div>
                        <div class="camera-shutter"></div>
                        <div class="camera-flash">⚡</div>
                    </div>
                </div>
            `
        },
        maps: {
            title: '地图',
            content: `
                <div class="maps-content">
                    <div class="maps-search-bar">
                        <div class="maps-search">
                            <span class="maps-search-icon">🔍</span>
                            <input type="text" class="maps-search-input" placeholder="搜索地点" value="北京市">
                        </div>
                    </div>
                    <div class="maps-map">
                        <div class="maps-compass">🧭</div>
                        <div class="maps-location">
                            <span class="maps-location-icon">📍</span>
                            <span class="maps-location-text">北京市朝阳区</span>
                        </div>
                        �️
                    </div>
                </div>
            `
        },
        messages: {
            title: '信息',
            content: `
                <div class="messages-content">
                    <div class="messages-list">
                        <div class="message-item">
                            <div class="message-avatar">👤</div>
                            <div class="message-info">
                                <div class="message-name">小明</div>
                                <div class="message-preview">好的，明天见！</div>
                            </div>
                        </div>
                        <div class="message-item">
                            <div class="message-avatar">👩</div>
                            <div class="message-info">
                                <div class="message-name">妈妈</div>
                                <div class="message-preview">记得吃饭哦</div>
                            </div>
                        </div>
                        <div class="message-item">
                            <div class="message-avatar">🏢</div>
                            <div class="message-info">
                                <div class="message-name">10086</div>
                                <div class="message-preview">您的话费余额不足...</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    };

    return configs[appName] || { title: appName, content: '<div>应用未找到</div>' };
}

function createPhoneButton() {
    eventSource.on(event_types.APP_READY, () => {
        try {
            const extensionsMenu = document.querySelector('#extensionsMenu');
            if (!extensionsMenu) {
                console.warn('[qwq Plugin] #extensionsMenu not found');
                return;
            }

            const menuItem = document.createElement('div');
            menuItem.className = 'list-group-item flex-container flexGap5';
            menuItem.id = 'qwq-toggle';
            menuItem.innerHTML = `
                <div class="fa-solid fa-gamepad extensionsMenuExtensionButton"></div>
                <span>qwq</span>
            `;

            menuItem.addEventListener('click', () => {
                if (phoneOverlay && phoneOverlay.hasClass('active')) {
                    closePhone();
                } else {
                    openPhone();
                }
            });

            extensionsMenu.appendChild(menuItem);
            console.log('[qwq Plugin] Menu entry registered');
        } catch (error) {
            console.error('[qwq Plugin] Failed to register menu:', error);
        }
    });
}

function setupEventListeners() {
    phoneOverlay.on('click', (e) => {
        if (e.target === phoneOverlay[0]) {
            closePhone();
        }
    });

    const homeBtn = document.getElementById('home-button');
    if (homeBtn) {
        homeBtn.addEventListener('click', goHome);
    }

    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.addEventListener('click', goHome);
    }

    document.addEventListener('click', (e) => {
        const appItem = e.target.closest('.app-item, .dock-item');
        if (appItem) {
            const appName = appItem.dataset.app;
            if (appName) {
                openApp(appName);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && phoneOverlay && phoneOverlay.hasClass('active')) {
            closePhone();
        }
    });
}

export async function init() {
    try {
        const html = await renderExtensionTemplateAsync('third-party/qwq', 'phone');
        phoneOverlay = $(html);
        $('body').append(phoneOverlay);

        createPhoneButton();
        setupEventListeners();

        phoneInitialized = true;
        console.log('[Phone Plugin] Initialized successfully');
    } catch (error) {
        console.error('[Phone Plugin] Initialization failed:', error);
    }
}

// Меню
const openMenuBtn = document.getElementById('openMenu');
const closeMenuBtn = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

openMenuBtn.onclick = () => {
    sideMenu.classList.add('open');
    overlay.classList.add('active');
};
closeMenuBtn.onclick = closeMenu;
overlay.onclick = closeMenu;
function closeMenu() {
    sideMenu.classList.remove('open');
    overlay.classList.remove('active');
    closeModal('registerModal');
    closeModal('loginModal');
}

// Модальные окна
const openRegisterBtn = document.getElementById('openRegister');
const openLoginBtn = document.getElementById('openLogin');
const registerModal = document.getElementById('registerModal');
const loginModal = document.getElementById('loginModal');
const closeModalBtns = document.querySelectorAll('.close-modal');

// Удаляю обработчики для openRegisterBtn и openLoginBtn, чтобы переход был только по ссылке

closeModalBtns.forEach(btn => {
    btn.onclick = (e) => {
        const modalId = btn.getAttribute('data-close');
        closeModal(modalId);
        overlay.classList.remove('active');
    };
});
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Регистрация
const registerForm = document.getElementById('registerForm');
registerForm.onsubmit = function(e) {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;
    if (!username || !password) return;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('Пользователь уже существует!');
        return;
    }
    users[username] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна! Теперь войдите.');
    closeModal('registerModal');
    registerForm.reset();
};

// Вход
const loginForm = document.getElementById('loginForm');
loginForm.onsubmit = function(e) {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[username] || users[username].password !== password) {
        alert('Неверный логин или пароль!');
        return;
    }
    localStorage.setItem('currentUser', username);
    alert('Вход выполнен!');
    closeModal('loginModal');
    loginForm.reset();
    showLoggedIn(username);
};

// Отображение состояния входа
function showLoggedIn(username) {
    openRegisterBtn.style.display = 'none';
    openLoginBtn.style.display = 'none';
    let userBlock = document.getElementById('userBlock');
    if (!userBlock) {
        userBlock = document.createElement('div');
        userBlock.id = 'userBlock';
        userBlock.style.margin = '1rem 0';
        userBlock.style.color = '#6cf';
        userBlock.style.fontWeight = 'bold';
        userBlock.style.textAlign = 'center';
        userBlock.style.cursor = 'pointer';
        sideMenu.insertBefore(userBlock, sideMenu.children[3]);
    }
    // Получаем аватарку
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    let user = users[username];
    let avatar = user && user.avatar ? user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6cf&color=181830&rounded=true&size=48`;
    userBlock.innerHTML = `<img src="${avatar}" alt="avatar" style="width:36px;height:36px;border-radius:50%;vertical-align:middle;margin-right:0.5rem;border:2px solid #6cf;box-shadow:0 1px 6px #0004;object-fit:cover;cursor:pointer;"> <span style="vertical-align:middle;">${username}</span>`;
    // Добавляем кнопку "Профиль" под аватаркой
    const profileBtn = document.createElement('button');
    profileBtn.textContent = 'Профиль';
    profileBtn.className = 'profile-menu-btn';
    profileBtn.style = 'display:block;width:100%;margin:0.7rem 0 0.5rem 0;padding:0.5rem 0.7rem;border-radius:8px;border:none;background:linear-gradient(90deg,#2fffd6 0%,#ff2fd6 100%);color:#181830;font-weight:bold;font-size:1rem;cursor:pointer;box-shadow:0 2px 12px #2fffd655;transition:background 0.2s,color 0.2s,box-shadow 0.2s;letter-spacing:1px;';
    profileBtn.onclick = function() {
        window.location.href = 'profile.html';
    };
    userBlock.appendChild(document.createElement('br'));
    userBlock.appendChild(profileBtn);
}
function logout() {
    localStorage.removeItem('currentUser');
    let userBlock = document.getElementById('userBlock');
    if (userBlock) userBlock.remove();
    openRegisterBtn.style.display = '';
    openLoginBtn.style.display = '';
}
// Проверка входа при загрузке
window.onload = function() {
    const username = localStorage.getItem('currentUser');
    if (username) showLoggedIn(username);
};

// Анимация появления fade-in
function handleFadeIn() {
    const fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
            el.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', handleFadeIn);
window.addEventListener('load', handleFadeIn);

// Подсветка активного пункта меню
if (sideMenu) {
    const menuLinks = sideMenu.querySelectorAll('ul li');
    menuLinks.forEach(li => {
        li.onclick = function() {
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        };
    });
}

// Подсветка активного пункта меню в .main-nav по URL
const mainNav = document.querySelector('.main-nav');
if (mainNav) {
    const navLinks = mainNav.querySelectorAll('a');
    const path = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        if (link.getAttribute('href') === path || (path === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Панель разработчика (скрытая иконка)
function showDevPanelIcon() {
    const username = localStorage.getItem('currentUser');
    if (username === '1235612356') {
        if (!document.getElementById('devPanelIcon')) {
            const icon = document.createElement('div');
            icon.id = 'devPanelIcon';
            icon.innerHTML = '🛠';
            icon.title = 'Панель разработчика';
            icon.style = 'position:fixed;bottom:32px;right:32px;z-index:9999;font-size:2.2rem;cursor:pointer;color:#2fffd6;text-shadow:0 0 16px #2fffd6,0 0 32px #ff2fd6;transition:transform 0.2s;';
            icon.onmouseenter = () => icon.style.transform = 'scale(1.15)';
            icon.onmouseleave = () => icon.style.transform = '';
            icon.onclick = openDevPanel;
            document.body.appendChild(icon);
        }
    } else {
        const icon = document.getElementById('devPanelIcon');
        if (icon) icon.remove();
    }
}
function openDevPanel() {
    if (document.getElementById('devPanelModal')) return;
    const modal = document.createElement('div');
    modal.id = 'devPanelModal';
    modal.style = `
        position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:10000;
        background:rgba(10,16,32,0.92);backdrop-filter:blur(4px);
        display:flex;align-items:center;justify-content:center;`;
    modal.innerHTML = `
        <div style="background:#181830;border-radius:18px;box-shadow:0 4px 32px #2fffd655,0 0 0 2px #ff2fd655;padding:2.2rem 2rem 1.5rem 2rem;max-width:480px;width:100%;position:relative;">
            <button id="devPanelClose" style="position:absolute;top:1rem;right:1rem;font-size:1.5rem;background:none;border:none;color:#2fffd6;cursor:pointer;">×</button>
            <h2 style="color:#2fffd6;text-align:center;margin-bottom:1.2rem;">Панель разработчика</h2>
            <div id="devPanelTabs" style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.2rem;">
                <button class="dev-tab-btn" data-tab="stats">Статистика</button>
                <button class="dev-tab-btn" data-tab="users">Пользователи</button>
                <button class="dev-tab-btn" data-tab="reviews">Отзывы</button>
                <button class="dev-tab-btn" data-tab="danger">Опасно</button>
            </div>
            <div id="devPanelContent"></div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('devPanelClose').onclick = () => modal.remove();
    // Вкладки
    const tabs = modal.querySelectorAll('.dev-tab-btn');
    tabs.forEach(btn => btn.onclick = function() {
        tabs.forEach(b => b.style.background = '');
        this.style.background = 'linear-gradient(90deg,#2fffd6 0%,#ff2fd6 100%)';
        showDevTab(this.dataset.tab);
    });
    tabs[0].click(); // по умолчанию статистика
}
function showDevTab(tab) {
    const content = document.getElementById('devPanelContent');
    if (!content) return;
    if (tab === 'stats') {
        // Статистика
        let users = JSON.parse(localStorage.getItem('users')||'{}');
        let reviews = JSON.parse(localStorage.getItem('reviews')||'[]');
        let currentUser = localStorage.getItem('currentUser');
        content.innerHTML = `
            <div style='color:#fff;'>
                <b>Пользователей:</b> ${Object.keys(users).length}<br>
                <b>Отзывов:</b> ${reviews.length}<br>
                <b>Текущий пользователь:</b> <span style='color:#2fffd6;'>${currentUser||'-'}</span>
            </div>
        `;
    } else if (tab === 'users') {
        // Пользователи
        let users = JSON.parse(localStorage.getItem('users')||'{}');
        let html = `<div style='max-height:180px;overflow-y:auto;'>`;
        for (let u in users) {
            html += `<div style='color:#fff;margin-bottom:0.5rem;'><b>${u}</b> <span style='color:#6cf;'>${users[u].email||''}</span> <button data-user='${u}' class='dev-del-user' style='background:#ff2fd6;color:#fff;border:none;border-radius:6px;padding:0.2rem 0.7rem;margin-left:0.7rem;cursor:pointer;'>Удалить</button></div>`;
        }
        html += `</div>`;
        content.innerHTML = html;
        content.querySelectorAll('.dev-del-user').forEach(btn => {
            btn.onclick = function() {
                if (confirm('Удалить пользователя '+btn.dataset.user+'?')) {
                    let users = JSON.parse(localStorage.getItem('users')||'{}');
                    delete users[btn.dataset.user];
                    localStorage.setItem('users', JSON.stringify(users));
                    showDevTab('users');
                }
            };
        });
    } else if (tab === 'reviews') {
        // Отзывы
        let reviews = JSON.parse(localStorage.getItem('reviews')||'[]');
        let html = `<div style='max-height:180px;overflow-y:auto;'>`;
        reviews.forEach((r,i) => {
            html += `<div style='color:#fff;margin-bottom:0.7rem;'><b>${r.name||'Аноним'}</b> <span style='color:#ff2fd6;'>${'★'.repeat(r.rating||5)}</span><br>${r.text}<br><button data-idx='${i}' class='dev-del-review' style='background:#ff2fd6;color:#fff;border:none;border-radius:6px;padding:0.2rem 0.7rem;margin-top:0.3rem;cursor:pointer;'>Удалить</button></div>`;
        });
        html += `</div>`;
        content.innerHTML = html;
        content.querySelectorAll('.dev-del-review').forEach(btn => {
            btn.onclick = function() {
                if (confirm('Удалить отзыв?')) {
                    let reviews = JSON.parse(localStorage.getItem('reviews')||'[]');
                    reviews.splice(btn.dataset.idx,1);
                    localStorage.setItem('reviews', JSON.stringify(reviews));
                    showDevTab('reviews');
                }
            };
        });
    } else if (tab === 'danger') {
        // Опасные действия
        content.innerHTML = `<button id='devDelAll' style='background:#ff2fd6;color:#fff;border:none;border-radius:8px;padding:0.7rem 1.5rem;font-size:1.1rem;font-weight:bold;box-shadow:0 0 16px #ff2fd6cc;margin-top:1.2rem;cursor:pointer;'>Удалить ВСЕ данные (LocalStorage)</button><div style='color:#ff2fd6;margin-top:1rem;font-size:0.98rem;'>Внимание: действие необратимо!</div>`;
        document.getElementById('devDelAll').onclick = function() {
            if (confirm('Удалить ВСЕ данные?')) {
                localStorage.clear();
                alert('Все данные удалены!');
                location.reload();
            }
        };
    }
}
window.addEventListener('load', showDevPanelIcon);
window.addEventListener('storage', showDevPanelIcon); 
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
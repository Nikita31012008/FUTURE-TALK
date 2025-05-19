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

openRegisterBtn.onclick = () => {
    registerModal.classList.add('active');
    overlay.classList.add('active');
};
openLoginBtn.onclick = () => {
    loginModal.classList.add('active');
    overlay.classList.add('active');
};
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
        sideMenu.insertBefore(userBlock, sideMenu.children[3]);
    }
    userBlock.innerHTML = `Вы вошли как <b>${username}</b> <button id="logoutBtn" style="margin-left:1rem;background:#222244;color:#fff;border:none;padding:0.3rem 0.7rem;border-radius:5px;cursor:pointer;">Выйти</button>`;
    document.getElementById('logoutBtn').onclick = logout;
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
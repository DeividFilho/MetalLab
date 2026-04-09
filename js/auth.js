// js/auth.js
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase.js';

export function initAuth(onLoginSuccess, onLogoutSuccess, showToast) {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');
  const userBadge = document.getElementById('userBadge');
  const btnLogin = document.getElementById('btnLogin');
  const btnLogout = document.getElementById('btnLogout');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // USUÁRIO LOGADO
      loginScreen.classList.add('hidden');
      appContainer.style.display = 'block';
      userBadge.innerText = user.email.split('@')[0];
      onLoginSuccess(user); // Avisa o main.js que pode carregar o banco
    } else {
      // USUÁRIO DESLOGADO
      loginScreen.classList.remove('hidden');
      appContainer.style.display = 'none';
      userBadge.innerText = '';
      onLogoutSuccess(); // Avisa o main.js para cortar a internet do banco
    }
  });

  btnLogin.addEventListener('click', async (e) => {
    const email = document.getElementById('emailInput').value;
    const senha = document.getElementById('senhaInput').value;
    const btn = e.currentTarget;

    if(!email || !senha) { showToast('Preencha e-mail e senha!', 'warning'); return; }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
    btn.disabled = true;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
    } catch (error) {
      console.error(error);
      showToast('Credenciais inválidas.', 'error');
    } finally {
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> AUTENTICAR';
      btn.disabled = false;
    }
  });

  btnLogout.addEventListener('click', async () => {
    if(confirm("Encerrar sessão no Mission Control?")) {
      try { await signOut(auth); } 
      catch (error) { showToast('Erro ao sair.', 'error'); }
    }
  });
}
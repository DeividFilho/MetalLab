// js/auth.js
import { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from './firebase.js';
import { initDatabaseListeners, stopDatabaseListeners } from './main.js';
import { showToast, hideGlobalSpinner } from './ui.js';

const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app-container');
const userBadge = document.getElementById('userBadge');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');

const logoutModalOverlay = document.getElementById('logoutModalOverlay');
const logoutModal = document.getElementById('logoutModal');
const btnCancelLogout = document.getElementById('btnCancelLogout');
const btnConfirmLogout = document.getElementById('btnConfirmLogout');

let dbInitialized = false;

export function initAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if(loginScreen) {
        loginScreen.classList.add('hidden');
        loginScreen.style.display = 'none'; 
      }
      if(appContainer) appContainer.style.display = 'block';
      
      if(userBadge) userBadge.innerText = user.email?.split('@')[0] || 'Operador';
      
      if(!dbInitialized) {
        initDatabaseListeners();
        dbInitialized = true;
        showToast(`Sessão iniciada como ${user.email?.split('@')[0] || 'Operador'}`, 'success');

        // ====== NOVA LÓGICA DE PRIMEIRO LOGIN ======
        if (!localStorage.getItem('hasSeenWelcomeModal')) {
          const welcomeOverlay = document.getElementById('welcomeModalOverlay');
          const welcomeModal = document.getElementById('welcomeModal');
          
          if (welcomeOverlay && welcomeModal) {
            setTimeout(() => {
              welcomeOverlay.classList.add('show');
              welcomeModal.classList.add('show');
            }, 800);
          }
        }
        // ===========================================
      }
    } else {
      hideGlobalSpinner(); 

      if(loginScreen) {
        loginScreen.classList.remove('hidden');
        loginScreen.style.display = 'flex'; 
      }
      if(appContainer) appContainer.style.display = 'none';
      if(userBadge) userBadge.innerText = '';
      
      if(dbInitialized) {
        stopDatabaseListeners();
        dbInitialized = false;
      }
    }
  });

  if(btnLogin) {
    btnLogin.addEventListener('click', async (e) => {
      const email = document.getElementById('emailInput')?.value;
      const senha = document.getElementById('senhaInput')?.value;
      const btn = e.currentTarget;

      if(!email || !senha) { showToast('Preencha e-mail e senha!', 'warning'); return; }

      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...';
      btn.disabled = true;

      try {
        await signInWithEmailAndPassword(auth, email, senha);
      } catch (error) {
        console.error(error.code);
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            showToast('E-mail ou senha incorretos.', 'error');
            break;
          case 'auth/invalid-email':
            showToast('Formato de e-mail inválido.', 'error');
            break;
          case 'auth/too-many-requests':
            showToast('Muitas tentativas. Tente mais tarde.', 'error');
            break;
          default:
            showToast('Erro ao autenticar. Verifique a conexão.', 'error');
        }
      } finally {
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> AUTENTICAR';
        btn.disabled = false;
      }
    });
  }

  const closeModal = () => {
    if(logoutModal) logoutModal.classList.remove('show');
    if(logoutModalOverlay) setTimeout(() => logoutModalOverlay.classList.remove('show'), 200);
  };

  if(btnLogout) {
    btnLogout.addEventListener('click', () => {
      if(logoutModalOverlay) logoutModalOverlay.classList.add('show');
      if(logoutModal) setTimeout(() => logoutModal.classList.add('show'), 10);
    });
  }

  if(btnCancelLogout) btnCancelLogout.addEventListener('click', closeModal);

  // Fechar Modal Logout com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && logoutModalOverlay?.classList.contains('show')) {
      closeModal();
    }
  });

  // Fechar clicando fora (Logout)
  if(logoutModalOverlay) {
    logoutModalOverlay.addEventListener('click', (e) => {
      if (e.target === logoutModalOverlay) closeModal();
    });
  }

  if(btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', async () => {
      closeModal();
      try { await signOut(auth); } 
      catch (error) { showToast('Erro ao sair do sistema.', 'error'); }
    });
  }

  // ====== EVENTOS DO MODAL DE BOAS-VINDAS ======
  const btnAckWelcome = document.getElementById('btnAcknowledgeWelcome');
  const welcomeOverlay = document.getElementById('welcomeModalOverlay');
  const welcomeModal = document.getElementById('welcomeModal');

  if(btnAckWelcome) {
    btnAckWelcome.addEventListener('click', () => {
      // Salva no navegador que já foi visto
      localStorage.setItem('hasSeenWelcomeModal', 'true');
      
      // Fecha a janela
      if(welcomeModal) welcomeModal.classList.remove('show');
      if(welcomeOverlay) setTimeout(() => welcomeOverlay.classList.remove('show'), 200);
    });
  }
}
'use strict';

// Sobrescrevendo console.log para evitar logs no console
console.log = function() {};

// Resto do código...
document.addEventListener('DOMContentLoaded', function() {
    // 1. Criação do container para notificações (toast)
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 2. Funções de Toast para mensagens padronizadas
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        const icon = document.createElement('i');
        // Usando Font Awesome para ícones modernos com contraste
        icon.className = type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
        icon.setAttribute('aria-hidden', 'true');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'toast-message';
        messageDiv.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.setAttribute('aria-label', 'Fechar notificação');
        closeButton.innerHTML = '&times;';

        toast.appendChild(icon);
        toast.appendChild(messageDiv);
        toast.appendChild(closeButton);

        toastContainer.appendChild(toast);

        // Fechamento do container de notificações ao clicar no botão fechar
        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 500);
        });

        // Remoção automática do toast após 5 segundos
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toast.style.animation = 'fadeOut 0.5s ease forwards';
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            }
        }, 5000);
    }

    // 3. Função para obter o usuário autenticado do localStorage
    function getAuthenticatedUser() {
        try {
            if (!window.localStorage) {
                showToast('Erro: Seu navegador não suporta armazenamento local.', 'error');
                return null;
            }

            const userData = localStorage.getItem('userData'); 
            
            if (!userData) {
                return null;
            }

            const user = JSON.parse(userData);
            
            if (!user || typeof user !== 'object' || (!user.id && !user.id_usuario)) { 
                return null;
            }

            return user;

        } catch (error) {
            showToast('Erro ao carregar dados do usuário. Faça login novamente.', 'error');
            return null;
        }
    }

    // 4. Função para mostrar erro de sessão e redirecionar
    function showSessionError() {
        showToast('Sessão expirada ou inválida. Você será redirecionado para o login.', 'error');
        setTimeout(() => {
            window.location.href = '../../index.html'; 
        }, 2000);
    }

    // 5. Validação dos dados da receita
    function validateRecipeData(data) {
        const required = ['titulo', 'tempo_preparo', 'ingrediente', 'modo_preparo', 'dificuldade', 'foto_receita'];
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                showToast(`O campo "${field.replace('_', ' ')}" é obrigatório!`, 'error');
                return false;
            }
        }
        return true;
    }

    // --- Lógica Principal ---

    const user = getAuthenticatedUser();
    
    if (!user) {
        showSessionError();
        return;
    }

    const userId = user.id || user.id_usuario; 
    if (!userId) {
        showSessionError();
        return;
    }

    const form = document.getElementById('recipeForm');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
    
        const recipeData = {
            titulo: form.titulo.value.trim(),
            tempo_preparo: form.tempo_preparo.value.trim(),
            foto_receita: form.foto_receita.value.trim(),
            ingrediente: form.ingrediente.value.trim(),
            modo_preparo: form.modo_preparo.value.trim(),
            dificuldade: form.dificuldade.value.trim(),
            id_usuario: userId
        };
    
        if (!validateRecipeData(recipeData)) {
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/receita', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData)
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                showToast(result.message || 'Erro ao publicar receita. Verifique os dados.', 'error');
                return;
            }
    
            if (result.status) {
                showToast('Receita publicada com sucesso!', 'success');
                form.reset();

                setTimeout(() => {
                    window.location.href = '../src/perfil.html'; 
                }, 1500);

            } else {
                showToast(result.message || 'Erro desconhecido ao publicar receita.', 'error');
            }
        } catch (error) {
            showToast('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'error');
        }
    });
});
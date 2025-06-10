'use strict';

// Importações do Firebase (necessário para upload de foto de perfil)
// Certifique-se de que o caminho para firebaseConfig.js está correto
import { storage } from './firebaseConfig.js'; 
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

document.addEventListener('DOMContentLoaded', function() {
    // 1. Referências aos Elementos do DOM
    const profileImageInput = document.getElementById('profileImageInput');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const updateProfileForm = document.getElementById('updateProfileForm');
    const nomeUsuarioInput = document.getElementById('nome_usuario');
    const emailInput = document.getElementById('email');
    const senhaInput = document.getElementById('senha'); // Campo de nova senha
    const palavraChaveInput = document.getElementById('palavra_chave');

    // Elementos do Toast
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Elementos do Header/Menu (reutilizados)
    const menuButton = document.getElementById("menuButton");
    const menuDropdown = document.getElementById("menuDropdown");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");
    const logoutLink = document.getElementById('logoutButton');


    // Variável para armazenar o URL da foto de perfil atual ou nova
    let currentProfilePhotoURL = '../src/img/low-profile.webp'; // Imagem padrão
    let newProfilePhotoFile = null; // Para armazenar a nova imagem selecionada

    // 2. Função para exibir toast (tipo: error, success, info) - Reutilizada
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        const icon = document.createElement('i');
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                break;
            case 'info':
                icon.className = 'fas fa-info-circle';
                break;
            default: // Para 'error'
                icon.className = 'fas fa-exclamation-triangle';
        }
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

        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 500);
        });

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

    // 3. Obter usuário autenticado do localStorage (Reutilizada)
    function getAuthenticatedUser() {
        try {
            if (!window.localStorage) {
                showToast('Erro: Seu navegador não suporta armazenamento local.', 'error');
                return null;
            }
            const userData = localStorage.getItem('accessToken');
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
            console.error("Erro ao parsear dados do usuário do localStorage:", error);
            return null;
        }
    }

    // 4. Mostrar erro de sessão e redirecionar (Reutilizada)
    function showSessionError() {
        showToast('Sessão expirada ou inválida. Você será redirecionado para o login.', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }

    // Obter o usuário logado
    const currentUser = getAuthenticatedUser();
    if (!currentUser) {
        showSessionError();
        return;
    }

    // ID do usuário para a requisição da API
    const userId = currentUser.id || currentUser.id_usuario;
    if (!userId) {
        showSessionError();
        return;
    }

    // 5. Carregar dados atuais do usuário no formulário
    async function loadUserData() {
        try {
            // Se o user já estiver no localStorage, preenchemos os campos
            if (currentUser) {
                nomeUsuarioInput.value = currentUser.nome_usuario || '';
                emailInput.value = currentUser.email || '';
                palavraChaveInput.value = currentUser.palavra_chave || '';
                
                // Exibe a foto de perfil atual
                if (currentUser.foto_perfil && currentUser.foto_perfil !== "undefined" && currentUser.foto_perfil !== "") {
                    profileImagePreview.src = currentUser.foto_perfil;
                    currentProfilePhotoURL = currentUser.foto_perfil; // Armazena o URL atual
                    menuButton.src = currentUser.foto_perfil; // Atualiza a foto no header
                } else {
                    profileImagePreview.src = '../src/img/low-profile.webp';
                    menuButton.src = '../src/img/low-profile.webp';
                }
            } else {
                showSessionError(); 
            }
        } catch (error) {
            showToast('Erro ao carregar dados do perfil.', 'error');
            console.error('Erro ao carregar dados do perfil:', error);
        }
    }

    // 6. Pré-visualização da nova imagem de perfil
    profileImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            newProfilePhotoFile = file; // Armazena o novo arquivo
            const reader = new FileReader();
            reader.onload = e => {
                profileImagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            newProfilePhotoFile = null; // Limpa o arquivo se nada for selecionado
            profileImagePreview.src = currentProfilePhotoURL; // Volta para a foto atual
        }
    });

    // 7. Envio do formulário de atualização
    updateProfileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let fotoPerfilUrl = currentProfilePhotoURL; // Começa com o URL atual

        // Se uma nova foto foi selecionada, faz o upload para o Firebase
        if (newProfilePhotoFile) {
            try {
                showToast('Carregando nova foto de perfil...', 'info');
                const timestamp = Date.now();
                const fileName = `${userId}_${timestamp}_${newProfilePhotoFile.name}`;
                const storageRef = ref(storage, 'fotos_perfil/' + fileName);

                const snapshot = await uploadBytes(storageRef, newProfilePhotoFile);
                fotoPerfilUrl = await getDownloadURL(snapshot.ref);
                showToast('Foto de perfil carregada com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao fazer upload da nova foto de perfil: ' + error.message, 'error');
                console.error('Erro upload foto perfil:', error);
                return; // Impede o envio do formulário se o upload falhar
            }
        }

        const updatedData = {
            nome_usuario: nomeUsuarioInput.value.trim(),
            email: emailInput.value.trim(),
            // Inclui a senha apenas se o campo não estiver vazio
            ...(senhaInput.value.trim() !== '' && { senha: senhaInput.value.trim() }),
            palavra_chave: palavraChaveInput.value.trim(),
            foto_perfil: fotoPerfilUrl
        };

        // VALIDAÇÃO TEMPORÁRIA PARA DEBUG:
        console.log("Dados que serão enviados para a API:", updatedData);
        if (!updatedData.nome_usuario || updatedData.nome_usuario.length === 0) {
            showToast("DEBUG: Nome de usuário está vazio! Preencha este campo.", 'error');
            return; // Impede o envio
        }
        if (!updatedData.email || updatedData.email.length === 0) {
            showToast("DEBUG: Email está vazio! Preencha este campo.", 'error');
            return; // Impede o envio
        }
        if (!updatedData.palavra_chave || updatedData.palavra_chave.length === 0) {
            showToast("DEBUG: Palavra-chave está vazia! Preencha este campo.", 'error');
            return; // Impede o envio
        }
        // FIM DA VALIDAÇÃO TEMPORÁRIA PARA DEBUG

        try {
            showToast('Atualizando perfil...', 'info');
            const response = await fetch(`http://localhost:8080/v1/controle-receita/usuario/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const responseData = await response.json();
                showToast('Perfil atualizado com sucesso!', 'success');
                
                const updatedUserInResponse = responseData.message && responseData.message.id ? responseData.message : updatedData; 
                localStorage.setItem('accessToken', JSON.stringify({ ...currentUser, ...updatedUserInResponse, foto_perfil: fotoPerfilUrl }));
                
                menuButton.src = fotoPerfilUrl;

                setTimeout(() => {
                    window.location.href = 'perfil.html';
                }, 1500);

            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Erro ao atualizar perfil.', 'error');
                console.error('Erro da API:', errorData);
            }
        } catch (error) {
            showToast('Erro de conexão ao tentar atualizar perfil: ' + error.message, 'error');
            console.error('Erro de rede/API:', error);
        }
    });

    // 8. Lógica do Menu de Perfil (Dropdown) - Reutilizada
    if (menuButton) {
        menuButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const isVisible = menuDropdown.style.display === "block";
            menuDropdown.style.display = isVisible ? "none" : "block";
        });
    }

    document.addEventListener("click", (event) => {
        if (menuButton && menuDropdown && !menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
            menuDropdown.style.display = "none";
        }
    });

    // 9. Lógica do Modal de Logout - Reutilizada
    if (logoutLink) {
        logoutLink.addEventListener("click", (event) => {
            event.preventDefault();
            if (logoutModal) {
                logoutModal.style.display = "flex";
            }
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem('accessToken');
            window.location.href = "../index.html";
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener("click", () => {
            if (logoutModal) {
                logoutModal.style.display = "none";
            }
        });
    }

    // 10. Atualiza a Foto de Perfil no Header (ao carregar a página)
    if (currentUser && currentUser.foto_perfil && currentUser.foto_perfil !== "undefined" && currentUser.foto_perfil !== "") {
        menuButton.src = currentUser.foto_perfil;
    } else {
        menuButton.src = "../src/img/low-profile.webp";
    }

    // Carrega os dados do usuário ao iniciar a página
    loadUserData();
});
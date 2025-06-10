'use strict'

// Importações do Firebase
import { storage } from './firebaseConfig.js'
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js"

// Sobrescreve console.log para evitar logs no console (mantido como no seu código)
// console.log = function() {}

document.addEventListener('DOMContentLoaded', function() {
    // 1. Referências aos Elementos do DOM
    const fotoReceitaInput = document.getElementById('foto_receita') // ID do input de arquivo
    const imagePreview = document.getElementById('imagePreview')    // ID da tag <img> de preview
    const previewContainer = document.getElementById('preview-container') // ID do container do preview
    const form = document.getElementById('recipeForm')               // ID do formulário principal
    
    // Elementos do Toast
    let toastContainer = document.querySelector('.toast-container')
    if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.className = 'toast-container'
        document.body.appendChild(toastContainer)
    }

    // Elementos do Header/Menu
    const menuButton = document.getElementById("menuButton") // ID da foto de perfil que abre o menu
    const menuDropdown = document.getElementById("menuDropdown") // ID do menu dropdown
    const logoutModal = document.getElementById("logoutModal") // ID do modal de logout
    const confirmLogout = document.getElementById("confirmLogout") // Botão de confirmar logout
    const cancelLogout = document.getElementById("cancelLogout") // Botão de cancelar logout
    const logoutLink = document.querySelector('.menu-item[href="../index.html"]') // Link "Sair da conta" no dropdown


    // 2. Função para exibir toast (tipo: error, success, info)
    function showToast(message, type = 'error') {
        const toast = document.createElement('div')
        toast.className = `toast ${type}`
        toast.setAttribute('role', 'alert')
        toast.setAttribute('aria-live', 'assertive')
        toast.setAttribute('aria-atomic', 'true')

        const icon = document.createElement('i')
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle'
                break
            case 'info':
                icon.className = 'fas fa-info-circle'
                break
            default: // Para 'error'
                icon.className = 'fas fa-exclamation-triangle' // Ícone de alerta (mantido como estava no seu código)
        }
        icon.setAttribute('aria-hidden', 'true')

        const messageDiv = document.createElement('div')
        messageDiv.className = 'toast-message'
        messageDiv.textContent = message

        const closeButton = document.createElement('button')
        closeButton.className = 'toast-close'
        closeButton.setAttribute('aria-label', 'Fechar notificação')
        closeButton.innerHTML = '&times'

        toast.appendChild(icon)
        toast.appendChild(messageDiv)
        toast.appendChild(closeButton)

        toastContainer.appendChild(toast)

        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.5s ease forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 500)
        })

        // Remove o toast automaticamente após 5 segundos
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toast.style.animation = 'fadeOut 0.5s ease forwards'
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast)
                    }
                }, 500)
            }
        }, 5000)
    }

    // 3. Obter usuário autenticado do localStorage
    function getAuthenticatedUser() {
        try {
            if (!window.localStorage) {
                showToast('Erro: Seu navegador não suporta armazenamento local.', 'error')
                return null
            }

            const userData = localStorage.getItem('accessToken') 
            if (!userData) {
                return null
            }

            const user = JSON.parse(userData)
            if (!user || typeof user !== 'object' || (!user.id && !user.id_usuario)) { 
                return null
            }

            return user

        } catch (error) {
            showToast('Erro ao carregar dados do usuário. Faça login novamente.', 'error')
            console.error("Erro ao carregar dados do usuário do localStorage:", error); // Log para debug
            return null
        }
    }

    // 4. Mostrar erro de sessão e redirecionar
    function showSessionError() {
        showToast('Sessão expirada ou inválida. Você será redirecionado para o login.', 'error')
        setTimeout(() => {
            window.location.href = '../../index.html' 
        }, 2000)
    }

    // 5. Validar dados obrigatórios da receita
    function validateRecipeData(data) {
        // NOVO: 'categoria' adicionada aos campos obrigatórios
        const required = ['titulo', 'tempo_preparo', 'ingrediente', 'modo_preparo', 'dificuldade', 'categoria', 'foto_receita']
        for (const field of required) {
            // Verifica se o campo é nulo, vazio, ou se o valor de select é o placeholder "Selecione"
            if (!data[field] || String(data[field]).trim() === '' || data[field] === 'Selecione') {
                const friendlyFieldName = field.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase()); // Formata para "Nome Amigável"
                showToast(`O campo "${friendlyFieldName}" é obrigatório!`, 'error');
                return false;
            }
        }
        return true;
    }

    // 6. Preview da imagem selecionada
    fotoReceitaInput.addEventListener('change', () => {
        const file = fotoReceitaInput.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = e => {
                imagePreview.src = e.target.result
                imagePreview.style.display = 'block' // Mostra a imagem
                previewContainer.style.display = 'flex' // Garante que o container esteja visível
            }
            reader.readAsDataURL(file)
        } else {
            imagePreview.src = ''
            imagePreview.style.display = 'none' // Esconde a imagem
            previewContainer.style.display = 'none' // Esconde o container
        }
    })

    // 7. Validação e envio do formulário
    const user = getAuthenticatedUser()
    
    if (!user) {
        showSessionError()
        return
    }

    const userId = user.id || user.id_usuario 
    if (!userId) {
        showSessionError()
        return
    }

    if (!form) {
        console.error("Erro: Formulário 'recipeForm' não encontrado no DOM.");
        return
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault()

        const file = fotoReceitaInput.files[0]
        if (!file) {
            showToast('Por favor, escolha uma imagem para a receita.', 'error')
            return
        }

        // Construir dados para validação (com o link foto vazio momentaneamente e categoria)
        const dataToValidate = {
            titulo: form.titulo.value,
            // Certifique-se de que os IDs dos inputs no HTML são 'tempo_preparo', 'ingrediente', 'modo_preparo'
            tempo_preparo: form.tempo_preparo.value,
            ingrediente: form.ingrediente.value,
            modo_preparo: form.modo_preparo.value,
            dificuldade: form.dificuldade.value,
            categoria: form.categoria.value, // NOVO: Campo categoria
            foto_receita: 'dummy' // Placeholder para passar na validação de preenchimento
        }
        
        // Validação adicional para o campo de categoria (se for um select)
        if (dataToValidate.categoria === '' || dataToValidate.categoria === 'Selecione') {
            showToast('Por favor, selecione uma categoria para a receita.', 'error');
            return;
        }

        if (!validateRecipeData(dataToValidate)) {
            return
        }

        try {
            const timestamp = Date.now()
            const fileName = `${timestamp}_${file.name}`
            const storageRef = ref(storage, 'imagens/' + fileName)

            const snapshot = await uploadBytes(storageRef, file)
            const downloadURL = await getDownloadURL(snapshot.ref)

            const recipeData = {
                titulo: form.titulo.value.trim(),
                tempo_preparo: form.tempo_preparo.value.trim(),
                foto_receita: downloadURL,
                ingrediente: form.ingrediente.value.trim(),
                modo_preparo: form.modo_preparo.value.trim(),
                dificuldade: form.dificuldade.value,
                categoria: form.categoria.value, // NOVO: Incluindo a categoria nos dados enviados para a API
                id_usuario: userId
            }

            async function salvarReceitaNoBanco(recipeData) {
                try {
                    const response = await fetch('http://localhost:8080/v1/controle-receita/receita', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        },
                        body: JSON.stringify(recipeData)
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
                    }
            
                    return await response.json();
                } catch (error) {
                    throw error;
                }
            }

            const response = await salvarReceitaNoBanco(recipeData);
            console.log('Receita salva com ID:', response.id); // Opcional - para debug

            showToast('Receita publicada com sucesso!', 'success')
            form.reset() // Limpa o formulário
            imagePreview.src = '' // Limpa a pré-visualização da imagem
            imagePreview.style.display = 'none' // Esconde a imagem de preview
            previewContainer.style.display = 'none' // Esconde o container do preview

            setTimeout(() => {
                window.location.href = '../src/home.html' // Redireciona para a home
            }, 1500)

        } catch (error) {
            showToast('Erro ao publicar receita: ' + error.message, 'error')
            console.error('Erro ao publicar receita:', error) // Log de erro detalhado
        }
    })

    // 8. Lógica do Menu de Perfil (Dropdown)
    // Verifica se o menuButton existe antes de adicionar o listener
    if (menuButton) {
        menuButton.addEventListener("click", (event) => {
            event.stopPropagation() // Impede que o clique se propague e feche o dropdown imediatamente
            const isVisible = menuDropdown.style.display === "block"
            menuDropdown.style.display = isVisible ? "none" : "block"
        })
    }


    // Fecha o dropdown se clicar fora dele
    document.addEventListener("click", (event) => {
        if (menuButton && menuDropdown && !menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
            menuDropdown.style.display = "none"
        }
    })

    // 9. Lógica do Modal de Logout
    // Verifica se o logoutLink existe antes de adicionar o listener
    if (logoutLink) {
        logoutLink.addEventListener("click", (event) => {
            event.preventDefault() // Impede o redirecionamento imediato
            if (logoutModal) { // Verifica se o modal existe
                logoutModal.style.display = "flex" // Mostra o modal de logout
            }
        })
    }

    // Verifica se os botões de confirmar/cancelar logout existem antes de adicionar listeners
    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem('accessToken') // Remove o token de acesso
            window.location.href = "../index.html" // Redireciona para o login
        })
    }

    if (cancelLogout) {
        cancelLogout.addEventListener("click", () => {
            if (logoutModal) { // Verifica se o modal existe
                logoutModal.style.display = "none" // Esconde o modal de logout
            }
        })
    }

    // 10. Atualiza a Foto de Perfil no Header (se houver uma URL no user object)
    // Certifica-se de que 'user' e 'menuButton' existem
    if (user && menuButton) {
        if (user.foto_perfil && user.foto_perfil !== "undefined" && user.foto_perfil !== "") {
            menuButton.src = user.foto_perfil
        } else {
            menuButton.src = "../src/img/low-profile.webp" // Imagem padrão se não houver foto
        }
    }
});
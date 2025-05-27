'use strict'

document.addEventListener('DOMContentLoaded', function () {
    const createAccountButton = document.getElementById('createAccountButton')
    const usernameInput = document.getElementById('username')
    const emailInput = document.getElementById('email')
    const passwordInput = document.getElementById('password')
    const confirmPasswordInput = document.getElementById('confirmPassword')
    const palavraChaveInput = document.getElementById('palavraChave')
    const togglePasswordButtons = document.querySelectorAll('.toggle-password')

    // Criar container para notificações (toast)
    const toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)

    // Função para atualizar os ícones de olho
    function updateEyeIcons() {
        togglePasswordButtons.forEach(button => {
            const targetId = button.getAttribute('data-target')
            const targetInput = document.getElementById(targetId)
            const isPasswordHidden = targetInput.type === 'password'
            
            // Invertendo a lógica dos ícones
            button.classList.toggle('fa-eye-slash', isPasswordHidden)
            button.classList.toggle('fa-eye', !isPasswordHidden)
        })
    }

    // Configurar estado inicial dos ícones
    updateEyeIcons()

    function showToast(message, type = 'error') {
        const toast = document.createElement('div')
        toast.className = `toast ${type}`
    
        const icon = document.createElement('i')
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'
    
        const messageDiv = document.createElement('div')
        messageDiv.className = 'toast-message'
        messageDiv.textContent = message
    
        const closeButton = document.createElement('span')
        closeButton.className = 'toast-close'
        closeButton.innerHTML = '&times'
    
        toast.appendChild(icon)
        toast.appendChild(messageDiv)
        toast.appendChild(closeButton)
    
        toastContainer.appendChild(toast)
    
        // Fechamento do container para notificações
        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        })
    
        // Remoção automática do container para notificações
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        }, 5000)
    }

    // Validação de e-mail
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            showToast('Por favor, insira um endereço de e-mail válido.')
            return false
        }
        return true
    }

    // Validação de registro
    function validateRegistration() {
        if (!usernameInput.value || !emailInput.value || !passwordInput.value || !confirmPasswordInput.value || !palavraChaveInput.value) {
            showToast('Por favor, preencha todos os campos obrigatórios.')
            return false
        }
    
        if (!validateEmail(emailInput.value)) {
            return false
        }
    
        // Verifica se a senha e a confirmação de senha são iguais
        if (passwordInput.value !== confirmPasswordInput.value) {
            showToast('As senhas não coincidem. Por favor, verifique.')
            return false
        }

        // Verifica se a senha tem no mínimo 4 caracteres
        if (passwordInput.value.length < 4) {
            showToast('A senha deve ter pelo menos 4 caracteres.')
            return false
        }

        // Verifica se a palavra-chave tem no mínimo 4 caracteres
        if (palavraChaveInput.value.length < 4) {
            showToast('A palavra-chave deve ter pelo menos 4 caracteres.')
            return false
        }
    
        return true
    }
    // Envia os dados de cadastro para o servidor
    async function enviarCadastro(dados) {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/usuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })

            if (!response.ok) {
                throw new Error('Erro ao cadastrar usuário.')
            }

            return true
        } catch (error) {
            console.error(error)
            showToast('Erro ao cadastrar usuário. Tente novamente mais tarde.')
            return false
        }
    }

    // Alternar visibilidade da senha
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target')
            const targetInput = document.getElementById(targetId)
            
            // Alternar tipo do input
            targetInput.type = targetInput.type === 'password' ? 'text' : 'password'
            
            // Atualizar todos os ícones
            updateEyeIcons()
        })
    })

    // Ação do botão "Criar conta"
    if (createAccountButton) {
        createAccountButton.addEventListener('click', async function (e) {
            e.preventDefault()

            if (validateRegistration()) {
                const dados = {
                    nome_usuario: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    senha: passwordInput.value.trim(),
                    palavra_chave: palavraChaveInput.value.trim(),
                    foto_perfil: 'http://downloadIMAGE.JPG',
                    data_criacao: new Date().toISOString().split('T')[0],
                    data_atualizacao: new Date().toISOString().split('T')[0]
                }

                if (await enviarCadastro(dados)) {
                    showToast('Conta criada com sucesso! Redirecionando para login...', 'success')
                    setTimeout(() => {
                        window.location.href = '../index.html'
                    }, 1500)
                }
            }
        })
    }

    // Permitir que o botão seja acionado com Enter
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            createAccountButton.click()
        }
    })
})
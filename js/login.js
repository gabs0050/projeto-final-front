'use strict'

document.addEventListener('DOMContentLoaded', function () {
    const entrarButton = document.getElementById('entrarButton')
    const usuarioInput = document.getElementById('usuario')
    const senhaInput = document.getElementById('senha')
    const toggleSenha = document.getElementById('toggleSenha')

    // Criar container de notificações
    const toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)

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

        // Fechamento do container de notificações
        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        })

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        }, 5000)
    }

    // Configurar o estado inicial do ícone do olho (movido para fora do segundo DOMContentLoaded)
    function updateEyeIcon() {
        const isPasswordHidden = senhaInput.type === 'password'
        toggleSenha.classList.toggle('fa-eye-slash', isPasswordHidden)
        toggleSenha.classList.toggle('fa-eye', !isPasswordHidden)
    }

    // Chamar a função para configurar o ícone inicial
    updateEyeIcon()

    // Alternar visibilidade da senha
    toggleSenha.addEventListener('click', function () {
        const isPasswordHidden = senhaInput.type === 'password'
        senhaInput.type = isPasswordHidden ? 'text' : 'password'
        updateEyeIcon()
    })

    // Restante do seu código (fetchUsuarios, validarLogin, etc.)
    async function fetchUsuarios() {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/usuario')
            if (!response.ok) {
                throw new Error('Erro ao buscar usuários.')
            }
            const data = await response.json()
            return data.games || []
        } catch (error) {
            console.error(error)
            showToast('Erro ao conectar com o servidor. Tente novamente mais tarde.')
            return []
        }
    }

    async function validarLogin() {
        const usuario = usuarioInput.value.trim()
        const senha = senhaInput.value

        if (!usuario || !senha) {
            showToast('Por favor, preencha todos os campos.')
            return false
        }

        const usuarios = await fetchUsuarios()

        const usuarioValido = usuarios.find(user =>
            (user.email === usuario || user.nome_usuario === usuario) &&
            user.senha === senha
        )

        if (!usuarioValido) {
            showToast('Credenciais inválidas. Verifique seus dados.')
            return false
        }

        return true
    }

    entrarButton.addEventListener('click', async function (e) {
        e.preventDefault()

        if (await validarLogin()) {
            showToast('Login realizado com sucesso!', 'success')
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        }
    })

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            entrarButton.click()
        }
    })
})
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

    // Alternar visibilidade da senha
    toggleSenha.addEventListener('click', function () {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password'
        senhaInput.setAttribute('type', type)
        this.classList.toggle('fa-eye')
        this.classList.toggle('fa-eye-slash')
    })

    // Função para buscar usuários do endpoint
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

    // Validação do login
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

    // Ação do botão "Entrar"
    entrarButton.addEventListener('click', async function (e) {
        e.preventDefault()

        if (await validarLogin()) {
            showToast('Login realizado com sucesso!', 'success')
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        }
    })

    // Permitir que o botão seja acionado com Enter
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            entrarButton.click()
        }
    })
})
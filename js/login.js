'use strict'

document.addEventListener('DOMContentLoaded', function () {
    // Verificar se o usuário já está logado
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
        window.location.href = './src/home.html'
        return
    }

    const entrarButton = document.getElementById('entrarButton')
    const usuarioInput = document.getElementById('usuario')
    const senhaInput = document.getElementById('senha')
    const toggleSenha = document.getElementById('toggleSenha')

    // Criar contêiner para exibir mensagens (toasts)
    const toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)

    // Função para exibir mensagens (toasts)
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

        // Fechar o toast manualmente
        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        })

        // Fechar o toast automaticamente após 5 segundos
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        }, 5000)
    }

    // Função para alternar visibilidade da senha
    function updateEyeIcon() {
        const isPasswordHidden = senhaInput.type === 'password'
        toggleSenha.classList.toggle('fa-eye-slash', isPasswordHidden)
        toggleSenha.classList.toggle('fa-eye', !isPasswordHidden)
    }

    toggleSenha.addEventListener('click', function () {
        const isPasswordHidden = senhaInput.type === 'password'
        senhaInput.type = isPasswordHidden ? 'text' : 'password'
        updateEyeIcon()
    })

    // Atualizar ícone do olho ao carregar a página
    updateEyeIcon()

    // Função para realizar login
    async function realizarLogin() {
        const usuario = usuarioInput.value.trim()
        const senha = senhaInput.value.trim()

        // Verifica se os campos estão preenchidos
        if (!usuario || !senha) {
            showToast('Por favor, preencha todos os campos obrigatórios.')
            return
        }

        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usuario,
                    senha: senha
                })
            })

            const data = await response.json()

            if (response.ok && data.status && data.usuario && data.usuario.length > 0) {
                const user = data.usuario[0]
                localStorage.setItem('accessToken', JSON.stringify(user))
                showToast('Login realizado com sucesso! Redirecionando...', 'success')

                setTimeout(() => {
                    window.location.href = './src/home.html'
                }, 1500)
            } else if (response.status === 401) {
                showToast('E-mail ou senha incorretos. Por favor, tente novamente.')
            } else if (response.status === 404) {
                showToast('Credenciais inválidas. Verifique seu e-mail e senha.')
            } else if (response.status === 500) {
                showToast('Erro interno no servidor. Tente novamente mais tarde.')
            } else {
                showToast(data.message || 'Não foi possível realizar o login. Tente novamente.')
            }
        } catch (error) {
            showToast('Erro ao conectar ao servidor. Verifique sua conexão com a internet.')
        }
    }

    // Adicionar evento ao botão de login
    entrarButton.addEventListener('click', function (e) {
        e.preventDefault()
        realizarLogin()
    })

    // Permitir login ao pressionar Enter
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            realizarLogin()
        }
    })
})
'use strict'

document.addEventListener('DOMContentLoaded', function () {
    const entrarButton = document.getElementById('entrarButton')
    const usuarioInput = document.getElementById('usuario')
    const senhaInput = document.getElementById('senha')
    const toggleSenha = document.getElementById('toggleSenha')

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

    function updateEyeIcon() {
        const isPasswordHidden = senhaInput.type === 'password'
        toggleSenha.classList.toggle('fa-eye-slash', isPasswordHidden)
        toggleSenha.classList.toggle('fa-eye', !isPasswordHidden)
    }

    updateEyeIcon()

    toggleSenha.addEventListener('click', function () {
        const isPasswordHidden = senhaInput.type === 'password'
        senhaInput.type = isPasswordHidden ? 'text' : 'password'
        updateEyeIcon()
    })

    async function realizarLogin() {
        const usuario = usuarioInput.value.trim()
        const senha = senhaInput.value.trim()

        if (!usuario || !senha) {
            showToast('Por favor, preencha todos os campos.')
            return
        }

        try {
            const response = await fetch('http://10.107.134.14:8080/v1/controle-receita/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usuario,
                    senha: senha
                })
            })

            const data = await response.json()

            if (data.status && data.usuario && data.usuario.length > 0) {
                const user = data.usuario[0]
                // Salvar informações do usuário no localStorage
                localStorage.setItem('accessToken', JSON.stringify(user))
                showToast('Login realizado com sucesso!', 'success')

                setTimeout(() => {
                    window.location.href = './src/home.html'
                }, 1500)
            } else {
                showToast('Credenciais inválidas. Verifique seus dados.')
            }

        } catch (error) {
            console.error('Erro no login:', error)
            showToast('Erro ao conectar com o servidor.')
        }
    }

    entrarButton.addEventListener('click', function (e) {
        e.preventDefault()
        realizarLogin()
    })

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            realizarLogin()
        }
    })
})

'use strict'

document.addEventListener('DOMContentLoaded', function () {
    const togglePasswordButtons = document.querySelectorAll('.toggle-password')
    const entrarButton = document.getElementById('entrarButton')
    const emailOuUsuarioInput = document.getElementById('emailOuUsuario')
    const palavraChaveInput = document.getElementById('palavraChave')
    const novaSenhaInput = document.getElementById('novaSenha')
    const voltarLogin = document.querySelector('.back-link')

    // Criação do container para notificações (toast)
    const toastContainer = document.createElement('div')
    toastContainer.className = 'toast-container'
    document.body.appendChild(toastContainer)

    // Inicializar os ícones de olho como fechados
    togglePasswordButtons.forEach(button => {
        button.classList.remove('fa-eye')
        button.classList.add('fa-eye-slash')
    })

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

        // Remoção automática do container de notificações
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards'
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast)
                }
            }, 300)
        }, 5000)
    }

    // Função para buscar usuários do endpoint
    async function fetchUsuarios() {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/usuario')
            if (!response.ok) {
                throw new Error('Erro ao buscar usuários.')
            }
            const data = await response.json()

            // Retorna apenas o array de usuários
            return data.usuario || []
        } catch (error) {
            console.error(error)
            showToast('Erro ao conectar com o servidor. Tente novamente mais tarde.')
            return []
        }
    }

    // Função para atualizar a senha do usuário
    async function atualizarSenha(dadosAtualizados) {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/usuario', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizados)
            })

            if (!response.ok) {
                throw new Error('Erro ao atualizar a senha.')
            }

            return true
        } catch (error) {
            console.error(error)
            showToast('Erro ao atualizar a senha. Tente novamente mais tarde.')
            return false
        }
    }

    // Função para validar e processar a recuperação de senha
    async function validarRecuperacaoSenha() {
        const emailOuUsuario = emailOuUsuarioInput.value.trim()
        const palavraChave = palavraChaveInput.value
        const novaSenha = novaSenhaInput.value

        // Verifica se todos os campos foram preenchidos
        if (!emailOuUsuario || !palavraChave || !novaSenha) {
            showToast('Por favor, preencha todos os campos.')
            return false
        }

        const usuarios = await fetchUsuarios()

        // Verifica se as credenciais correspondem
        const usuarioValido = usuarios.find(user =>
            (user.email === emailOuUsuario || user.nome_usuario === emailOuUsuario) &&
            user.palavra_chave === palavraChave
        )

        if (!usuarioValido) {
            showToast('Credenciais inválidas. Verifique seu e-mail/nome de usuário e palavra-chave.')
            return false
        }

        // Cria o objeto com os dados esperados pelo backend
        const dadosAtualizados = {
            email: usuarioValido.email,
            senha: novaSenha,
            palavra_chave: usuarioValido.palavra_chave
        }

        if (await atualizarSenha(dadosAtualizados)) {
            showToast('Senha alterada com sucesso!', 'success')
            return true
        }

        return false
    }

    // Evento do botão Entrar
    entrarButton.addEventListener('click', async function (e) {
        e.preventDefault()

        if (await validarRecuperacaoSenha()) {
            // Simula redirecionamento após 1 segundo
            setTimeout(() => {
                window.location.href = '../index.html'
            }, 1500)
        }
    })

    // Evento do link Voltar para login
    if (voltarLogin) {
        voltarLogin.addEventListener('click', function (e) {
            e.preventDefault()
            window.location.href = '../index.html'
        })
    }

    // Função para mostrar/ocultar senha
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target')
            const targetInput = document.getElementById(targetId)

            if (targetInput.type === 'password') {
                targetInput.type = 'text'
                this.classList.remove('fa-eye-slash')
                this.classList.add('fa-eye')
            } else {
                targetInput.type = 'password'
                this.classList.remove('fa-eye')
                this.classList.add('fa-eye-slash')
            }
        })
    })

    // Permitir que o botão seja acionado com Enter
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            entrarButton.click()
        }
    })
})
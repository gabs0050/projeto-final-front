'use strict'

// Importações do Firebase
import { storage } from './firebaseConfig.js'
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js"

// Sobrescreve console.log para evitar logs no console
// console.log = function() {}

document.addEventListener('DOMContentLoaded', function() {
    // Toast container
    let toastContainer = document.querySelector('.toast-container')
    if (!toastContainer) {
        toastContainer = document.createElement('div')
        toastContainer.className = 'toast-container'
        document.body.appendChild(toastContainer)
    }

    // Função para exibir toast (tipo: error, success, info)
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
            default:
                icon.className = 'fas fa-exclamation-triangle'
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

    // Obter usuário autenticado do localStorage
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
            return null
        }
    }

    // Mostrar erro sessão e redirecionar
    function showSessionError() {
        showToast('Sessão expirada ou inválida. Você será redirecionado para o login.', 'error')
        setTimeout(() => {
            window.location.href = '../../index.html' 
        }, 2000)
    }

    // Validar dados obrigatórios da receita
    function validateRecipeData(data) {
        const required = ['titulo', 'tempo_preparo', 'ingrediente', 'modo_preparo', 'dificuldade', 'foto_receita']
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                showToast(`O campo "${field.replace('_', ' ')}" é obrigatório!`, 'error')
                return false
            }
        }
        return true
    }

    // Preview da imagem selecionada
    const fotoReceitaInput = document.getElementById('foto_receita')
    const imagePreview = document.getElementById('imagePreview')

    fotoReceitaInput.addEventListener('change', () => {
        const file = fotoReceitaInput.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = e => {
                imagePreview.src = e.target.result
                imagePreview.style.display = 'block'
            }
            reader.readAsDataURL(file)
        } else {
            imagePreview.src = ''
            imagePreview.style.display = 'none'
        }
    })

    // Validação e envio do formulário
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

    const form = document.getElementById('recipeForm')
    if (!form) {
        return
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault()

        const file = fotoReceitaInput.files[0]
        if (!file) {
            showToast('Por favor, escolha uma imagem.', 'error')
            return
        }

        // Construir dados para validação (com o link foto vazio momentaneamente)
        const dataToValidate = {
            titulo: form.titulo.value,
            tempo_preparo: form.tempo_preparo.value,
            ingrediente: form.ingrediente.value,
            modo_preparo: form.modo_preparo.value,
            dificuldade: form.dificuldade.value,
            foto_receita: 'dummy' // só pra passar na validação
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
                id_usuario: userId
            }

            // Enviar para a função de salvar receita (defina essa função no firebaseConfig.js ou aqui)
            // Exemplo fictício:
            // await salvarReceitaNoBanco(recipeData)

            showToast('Receita publicada com sucesso!', 'success')
            form.reset()
            imagePreview.src = ''
            imagePreview.style.display = 'none'

            setTimeout(() => {
                window.location.href = '../src/home.html'
            }, 1500)

        } catch (error) {
            showToast('Erro ao publicar receita: ' + error.message, 'error')
            // console.error('Erro ao publicar receita:', error)
        }
    })
})

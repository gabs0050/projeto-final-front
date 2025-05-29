'use strict'

document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o usuário está logado
    const user = JSON.parse(localStorage.getItem('accessToken'))

    if (!user) {
        // Se não estiver logado, redireciona para a página de login
        window.location.href = '../index.html'
        return
    }

    const menuButton = document.getElementById("menuButton")
    const menuDropdown = document.getElementById("menuDropdown")
    const logoutModal = document.getElementById("logoutModal")
    const confirmLogout = document.getElementById("confirmLogout")
    const cancelLogout = document.getElementById("cancelLogout")

    menuButton.addEventListener("click", () => {
        const isVisible = menuDropdown.style.display === "block"
        menuDropdown.style.display = isVisible ? "none" : "block"
    })

    document.addEventListener("click", (event) => {
        if (!menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
            menuDropdown.style.display = "none"
        }
    })

    const userInfoContainer = document.querySelector('main')

    if (user) {
        displayUserInfo(user)
        updateMenuProfilePicture(user)
    }

    const logoutLink = document.querySelector('.menu-item[href="../index.html"]')
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault() // Impede o redirecionamento imediato
        logoutModal.style.display = "flex" // Exibe o modal
    })

    confirmLogout.addEventListener("click", () => {
        // Remove o token do localStorage e redireciona para a página de login
        localStorage.removeItem('accessToken')
        window.location.href = "../index.html"
    })

    cancelLogout.addEventListener("click", () => {
        logoutModal.style.display = "none" // Fecha o modal
    })

    function displayUserInfo(user) {
        const welcomeMessage = document.createElement('h1')
        welcomeMessage.textContent = `Bem-vindo(a), ${user.nome_usuario || user.email || 'Usuário'}!`
        userInfoContainer.appendChild(welcomeMessage)
    }

    function updateMenuProfilePicture(user) {
        const profilePicture = document.getElementById("menuButton")
        if (user && user.foto_perfil && user.foto_perfil !== "undefined") {
            profilePicture.src = user.foto_perfil
        } else {
            profilePicture.src = "../src/img/low-profile.webp" // Foto provisória
        }
    }
})
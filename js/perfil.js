'use strict'

document.addEventListener("DOMContentLoaded", () => {
    // Recuperar informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('accessToken'))

    if (!user) {
        // Se não houver usuário logado, redireciona para a página de login
        window.location.href = '../index.html'
        return
    }

    // Atualizar os dados do perfil com as informações do usuário logado
    const profileName = document.querySelector('.profile-details h1')
    const profileUsername = document.querySelector('.profile-details p')
    const profilePicture = document.querySelector('.profile-picture')

    // Substituir os valores mockados pelos dados do usuário
    profileName.textContent = user.nome_usuario || 'Usuário'
    profileUsername.textContent = user.email || 'email@exemplo.com'

    // Atualizar a foto de perfil
    if (user.foto_perfil && user.foto_perfil !== "undefined") {
        profilePicture.src = user.foto_perfil
    } else {
        profilePicture.src = "../src/img/low-profile.webp" // Foto provisória
    }
})
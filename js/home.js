'use strict'

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('accessToken'))

    if (!user) {
        window.location.href = '../index.html'
        return
    }

    const menuButton = document.getElementById("menuButton")
    const menuDropdown = document.getElementById("menuDropdown")
    const logoutModal = document.getElementById("logoutModal")
    const confirmLogout = document.getElementById("confirmLogout")
    const cancelLogout = document.getElementById("cancelLogout")

    // Alternar menu
    menuButton.addEventListener("click", () => {
        const isVisible = menuDropdown.style.display === "block"
        menuDropdown.style.display = isVisible ? "none" : "block"
    })

    document.addEventListener("click", (event) => {
        if (!menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
            menuDropdown.style.display = "none"
        }
    })

    // Modal de logout
    const logoutLink = document.querySelector('.menu-item[href="../index.html"]')
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault()
        logoutModal.style.display = "flex"
    })

    confirmLogout.addEventListener("click", () => {
        localStorage.removeItem('accessToken')
        window.location.href = "../index.html"
    })

    cancelLogout.addEventListener("click", () => {
        logoutModal.style.display = "none"
    })

    // Atualizar foto do perfil no menu
    if (user && user.foto_perfil && user.foto_perfil !== "undefined") {
        menuButton.src = user.foto_perfil
    } else {
        menuButton.src = "../src/img/low-profile.webp"
    }

    // Buscar e renderizar receitas
    renderTodasReceitas()

    async function fetchTodasReceitas() {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/receita')
            if (!response.ok) {
                throw new Error('Erro ao buscar receitas.')
            }
            const data = await response.json()
            return data.items || []
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async function renderTodasReceitas() {
        const receitas = await fetchTodasReceitas()
        const publicationsGrid = document.querySelector('.publications-grid')
    
        publicationsGrid.innerHTML = ''
    
        if (receitas.length === 0) {
            const noPublicationsMessage = document.createElement('p')
            noPublicationsMessage.textContent = 'Nenhuma receita publicada ainda.'
            noPublicationsMessage.style.marginTop = '20px'
            noPublicationsMessage.style.fontWeight = 'bold'
            noPublicationsMessage.style.color = '#333'
            noPublicationsMessage.style.textAlign = 'center'
            publicationsGrid.appendChild(noPublicationsMessage)
            return
        }
    
        receitas.forEach(receita => {
            const card = document.createElement('div')
            card.className = 'publication'
    
            const pubDate = new Date(receita.data_publicacao)
            const formattedDate = pubDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            const formattedTime = pubDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            })
    
            // Corrigindo o acesso ao usuário
            const usuarioReceita = receita.usuario && receita.usuario.length > 0 ? receita.usuario[0] : {
                foto_perfil: '../src/img/low-profile.webp',
                nome_usuario: 'Usuário'
            }
    
            card.innerHTML = `
                <div class="image-container">
                    <img src="${receita.foto_receita}" alt="${receita.titulo}" class="recipe-image">
                    <div class="user-overlay">
                        <img src="${usuarioReceita.foto_perfil}" 
                             alt="${usuarioReceita.nome_usuario}" 
                             class="user-avatar">
                        <span class="user-name">${usuarioReceita.nome_usuario}</span>
                    </div>
                </div>
                <div class="publication-info">
                    <h3>${receita.titulo}</h3>
                    <div class="publication-date">${formattedDate} ${formattedTime}</div>
                    <p>${receita.tempo_preparo}</p>
                </div>
            `
            publicationsGrid.appendChild(card)
        })
    }
})

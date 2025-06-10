'use strict'

document.addEventListener("DOMContentLoaded", async () => {
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

    profileName.textContent = user.nome_usuario || 'Usuário'
    profileUsername.textContent = user.email || 'email@exemplo.com'

    if (user.foto_perfil && user.foto_perfil !== "undefined") {
        profilePicture.src = user.foto_perfil
    } else {
        profilePicture.src = "../src/img/low-profile.webp" // Foto provisória
    }

    // Função para buscar receitas do endpoint
    async function fetchReceitas() {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/receita')
            if (!response.ok) {
                throw new Error('Erro ao buscar receitas.')
            }
            const data = await response.json()

            // Filtrar receitas apenas do usuário logado
            const receitasDoUsuario = data.items.filter(receita => {
                // Verificar se o ID do usuário logado está presente no array `usuario`
                return receita.usuario.some(u => u.id === user.id || u.id === user.id_usuario)
            })

            return receitasDoUsuario || []
        } catch (error) {
            console.error(error)
            return []
        }
    }

    // Renderizar as receitas no HTML
    async function renderReceitas() {
        const receitas = await fetchReceitas()
        const publicationsGrid = document.querySelector('.publications-grid')

        // Limpar o conteúdo existente
        publicationsGrid.innerHTML = ''

        // Adicionar as receitas dinamicamente
        if (receitas.length === 0) {
            publicationsGrid.innerHTML = ''
            const noPublicationsMessage = document.createElement('p')
            noPublicationsMessage.textContent = 'Nenhuma publicação encontrada.'
            noPublicationsMessage.style.marginTop = '20px'
            noPublicationsMessage.style.fontWeight = 'bold'
            noPublicationsMessage.style.color = '#fff'
            noPublicationsMessage.style.display = 'block'
            noPublicationsMessage.style.textAlign = 'center'
            publicationsGrid.appendChild(noPublicationsMessage)
            return
        }

        receitas.forEach(receita => {
            const card = document.createElement('div')
            card.className = 'publication'

            // Format the publication date/time
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

            card.innerHTML = `
                <img src="${receita.foto_receita}" alt="${receita.titulo}">
                <div class="publication-info">
                    <h3>${receita.titulo}</h3>
                    <div class="publication-date">${formattedDate} ${formattedTime}</div>
                    <p>${receita.tempo_preparo}</p>
                </div>
            `
            publicationsGrid.appendChild(card)
        })
    }

    // Chamar a função para renderizar as receitas
    renderReceitas()

    // Adicionar evento de clique no botão "PUBLICAR" para redirecionar para publicarReceita.html
    const publicarButton = document.querySelector('.profile-actions .action-button:nth-child(3)')
    if (publicarButton) {
        publicarButton.addEventListener('click', () => {
            window.location.href = '../src/publicarReceita.html'
        })
    }
})

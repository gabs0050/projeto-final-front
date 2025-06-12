'use strict'

document.addEventListener("DOMContentLoaded", async () => {
    // Definindo imagens padrão para avatares
    const DEFAULT_AVATAR = '../src/img/low-profile.webp'; // Imagem de perfil padrão local

    // Recuperar informações do usuário do localStorage
    const user = JSON.parse(localStorage.getItem('accessToken'))

    if (!user) {
        // Se não houver usuário logado, redireciona para a página de login
        window.location.href = '../index.html'
        return
    }

    // Referências aos elementos do DOM
    const profileName = document.querySelector('.profile-details-main h1')
    const profileEmail = document.querySelector('.profile-details-main p') // Corrigido para p, já que é o email
    const profilePictureMain = document.querySelector('.profile-picture-main') // Foto de perfil principal
    const publicationsGrid = document.querySelector('.publications-grid')

    // Elementos do Header e Dropdown (Novos/Modificados)
    const menuButton = document.getElementById("menuButton"); // Foto de perfil no header
    const menuDropdown = document.getElementById("menuDropdown");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");

    // 1. Atualizar os dados do perfil com as informações do usuário logado
    profileName.textContent = user.nome_usuario || 'Usuário'
    profileEmail.textContent = user.email || 'email@exemplo.com'

    if (user.foto_perfil && user.foto_perfil !== "undefined" && user.foto_perfil.trim() !== "") {
        profilePictureMain.src = user.foto_perfil
    } else {
        profilePictureMain.src = DEFAULT_AVATAR // Foto provisória
    }

    // 2. Funcionalidade do Dropdown do Menu do Perfil (Copiado de home.js)
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Impede que o clique se propague para o document
        menuDropdown.style.display = menuDropdown.style.display === "block" ? "none" : "block";
    });

    // Fecha o dropdown se clicar fora dele
    document.addEventListener("click", (event) => {
        if (!menuButton.contains(event.target) && !menuDropdown.contains(event.target)) {
            menuDropdown.style.display = "none";
        }
    });

    // 3. Funcionalidade do Modal de Logout (Copiado de home.js)
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) { // Verifica se o elemento existe (caso a página de logout seja separada)
        logoutLink.addEventListener("click", (event) => {
            event.preventDefault(); // Impede a navegação padrão
            logoutModal.style.display = "flex"; // Exibe o modal
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {
            localStorage.removeItem('accessToken'); // Remove o token
            window.location.href = "../index.html"; // Redireciona para a página inicial
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener("click", () => {
            logoutModal.style.display = "none"; // Oculta o modal
        });
    }

    // 4. Atualizar Foto de Perfil no Header (Copiado de home.js)
    if (user && user.foto_perfil && user.foto_perfil !== "undefined" && user.foto_perfil.trim() !== "") {
        menuButton.src = user.foto_perfil;
    } else {
        menuButton.src = DEFAULT_AVATAR; // Usa a imagem padrão se a API retornar vazio/nulo
    }

    // Função para buscar receitas do endpoint (mantida)
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

    // Renderizar as receitas no HTML (mantida, com pequenos ajustes na data/hora)
    async function renderReceitas() {
        const receitas = await fetchReceitas()
        publicationsGrid.innerHTML = ''

        if (receitas.length === 0) {
            const noPublicationsMessage = document.createElement('p')
            noPublicationsMessage.textContent = 'Nenhuma publicação encontrada.'
            noPublicationsMessage.style.cssText = `
                margin-top: 20px;
                font-weight: bold;
                color: #555; /* Cor ajustada para o novo fundo */
                text-align: center;
                display: block;
                width: 100%;
            `;
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

            card.innerHTML = `
                <img src="${receita.foto_receita}" alt="${receita.titulo}">
                <div class="publication-info">
                    <h3>${receita.titulo}</h3>
                    <div class="publication-date">${formattedDate} ${formattedTime}</div>
                    <p>Tempo de Preparo: ${receita.tempo_preparo}</p>
                </div>
            `
            publicationsGrid.appendChild(card)
        })
    }

    // Chamar a função para renderizar as receitas
    renderReceitas()

    // Adicionar evento de clique nos botões de ação do perfil
    const actionButtons = document.querySelectorAll('.profile-actions-main .action-button');

    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent.trim();
            if (buttonText === 'PUBLICAR') {
                window.location.href = '../src/publicarReceita.html';
            }
            // Adicionar lógica para outros botões se necessário
        });
    });
})
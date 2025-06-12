'use strict'

document.addEventListener("DOMContentLoaded", () => {
    // Definindo imagens padrão para avatares e receitas
    const DEFAULT_AVATAR = '../src/img/low-profile.webp'; // Imagem de perfil padrão local
    const DEFAULT_RECIPE_IMAGE = 'https://via.placeholder.com/400x250.png?text=Imagem+da+Receita'; // Imagem de receita padrão para URLs inválidos

    // Checa autenticação do usuário
    const user = JSON.parse(localStorage.getItem('accessToken'));

    if (!user) {
        window.location.href = '../index.html'; // Redireciona se não houver token
        return;
    }

    // Referências aos elementos do DOM
    const menuButton = document.getElementById("menuButton");
    const menuDropdown = document.getElementById("menuDropdown");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");
    const publicationsGrid = document.querySelector('.publications-grid');

    // Elementos do Modal de Detalhes da Receita
    const recipeDetailModal = document.getElementById("recipeDetailModal");
    const closeRecipeDetailModal = document.getElementById("closeRecipeDetailModal");
    const detailRecipeImage = document.getElementById("detailRecipeImage");
    const detailRecipeTitle = document.getElementById("detailRecipeTitle");
    const detailUserAvatar = document.getElementById("detailUserAvatar");
    const detailUserName = document.getElementById("detailUserName");
    const detailRecipeDifficulty = document.getElementById("detailRecipeDifficulty");
    const detailRecipeTime = document.getElementById("detailRecipeTime");
    const detailRecipeDate = document.getElementById("detailRecipeDate");
    const detailRecipeIngredients = document.getElementById("detailRecipeIngredients");
    const detailRecipeInstructions = document.getElementById("detailRecipeInstructions");


    // 1. Funcionalidade do Dropdown do Menu do Perfil
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

    // 2. Funcionalidade do Modal de Logout
    const logoutLink = document.getElementById('logoutLink'); // Use o ID adicionado no HTML
    logoutLink.addEventListener("click", (event) => {
        event.preventDefault(); // Impede a navegação padrão
        logoutModal.style.display = "flex"; // Exibe o modal
    });

    confirmLogout.addEventListener("click", () => {
        localStorage.removeItem('accessToken'); // Remove o token
        window.location.href = "../index.html"; // Redireciona para a página inicial
    });

    cancelLogout.addEventListener("click", () => {
        logoutModal.style.display = "none"; // Oculta o modal
    });

    // 3. Atualizar Foto de Perfil no Header
    // Garante que a foto de perfil do header seja atualizada ou use a padrão
    if (user && user.foto_perfil && user.foto_perfil !== "undefined" && user.foto_perfil.trim() !== "") {
        menuButton.src = user.foto_perfil;
    } else {
        menuButton.src = DEFAULT_AVATAR; // Usa a imagem padrão se a API retornar vazio/nulo
    }

    // 4. Buscar e Renderizar Receitas
    async function fetchTodasReceitas() {
        try {
            const response = await fetch('http://localhost:8080/v1/controle-receita/receita');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error('Erro ao buscar receitas:', error);
            // Melhorar a mensagem de erro para o usuário, se necessário
            return [];
        }
    }

    async function renderTodasReceitas() {
        const receitas = await fetchTodasReceitas();
        publicationsGrid.innerHTML = ''; // Limpa o grid antes de adicionar novos cards

        if (receitas.length === 0) {
            const noPublicationsMessage = document.createElement('p');
            noPublicationsMessage.textContent = 'Nenhuma receita publicada ainda.';
            noPublicationsMessage.style.cssText = `
                margin-top: 50px;
                font-weight: bold;
                color: #555;
                text-align: center;
                font-size: 1.2em;
                width: 100%;
            `;
            publicationsGrid.appendChild(noPublicationsMessage);
            return;
        }

        receitas.forEach(receita => {
            const card = document.createElement('div');
            card.className = 'publication';
            card.setAttribute('data-id', receita.id); // Armazena o ID da receita para o modal

            const pubDate = new Date(receita.data_publicacao);
            const formattedDate = pubDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedTime = pubDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Tratamento da imagem do usuário e da receita:
            // Garante que a imagem do usuário seja um URL válido ou a padrão
            const usuarioReceita = receita.usuario && receita.usuario.length > 0 ? receita.usuario[0] : {
                foto_perfil: '', // Assume que a API pode retornar vazio
                nome_usuario: 'Usuário Desconhecido'
            };
            const userAvatarSrc = (usuarioReceita.foto_perfil && usuarioReceita.foto_perfil.trim() !== "") ? usuarioReceita.foto_perfil : DEFAULT_AVATAR;

            // Garante que a imagem da receita seja um URL válido ou a padrão
            const recipeImageSrc = (receita.foto_receita && receita.foto_receita.trim() !== "") ? receita.foto_receita : DEFAULT_RECIPE_IMAGE;

            card.innerHTML = `
                <div class="image-container">
                    <img src="${recipeImageSrc}" alt="${receita.titulo}" class="recipe-image">
                    <div class="user-overlay">
                        <img src="${userAvatarSrc}"
                             alt="${usuarioReceita.nome_usuario}"
                             class="user-avatar">
                        <span class="user-name">${usuarioReceita.nome_usuario}</span>
                    </div>
                </div>
                <div class="publication-info">
                    <h3>${receita.titulo}</h3>
                    <div class="publication-date">${formattedDate} ${formattedTime}</div>
                    <p>Tempo de Preparo: ${receita.tempo_preparo}</p>
                </div>
            `;
            publicationsGrid.appendChild(card);
        });

        // Adiciona event listeners aos cards para abrir o modal de detalhes
        document.querySelectorAll('.publication').forEach(card => {
            card.addEventListener('click', (event) => {
                const recipeId = card.getAttribute('data-id');
                const selectedRecipe = receitas.find(r => r.id == recipeId); // Compara usando == para converter tipo

                if (selectedRecipe) {
                    showRecipeDetailModal(selectedRecipe);
                }
            });
        });
    }

    // 5. Funcionalidade do Modal de Detalhes da Receita
    function showRecipeDetailModal(receita) {
        // Tratamento de URLs para o modal de detalhes também
        const userAvatarSrc = (receita.usuario && receita.usuario.length > 0 && receita.usuario[0].foto_perfil && receita.usuario[0].foto_perfil.trim() !== "")
            ? receita.usuario[0].foto_perfil
            : DEFAULT_AVATAR;
        const recipeImageSrc = (receita.foto_receita && receita.foto_receita.trim() !== "")
            ? receita.foto_receita
            : DEFAULT_RECIPE_IMAGE;

        detailRecipeImage.src = recipeImageSrc;
        detailRecipeTitle.textContent = receita.titulo;
        detailUserAvatar.src = userAvatarSrc;
        detailUserName.textContent = (receita.usuario && receita.usuario.length > 0) ? receita.usuario[0].nome_usuario : 'Usuário Desconhecido';
        detailRecipeDifficulty.textContent = receita.dificuldade;
        detailRecipeTime.textContent = receita.tempo_preparo;

        const pubDateModal = new Date(receita.data_publicacao);
        detailRecipeDate.textContent = pubDateModal.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        detailRecipeIngredients.textContent = receita.ingrediente;
        detailRecipeInstructions.textContent = receita.modo_preparo;

        recipeDetailModal.style.display = "flex"; // Exibe o modal
    }

    closeRecipeDetailModal.addEventListener('click', () => {
        recipeDetailModal.style.display = "none"; // Oculta o modal
    });

    // Fecha o modal se clicar fora do conteúdo do modal
    recipeDetailModal.addEventListener('click', (event) => {
        if (event.target === recipeDetailModal) {
            recipeDetailModal.style.display = "none";
        }
    });

    // Chamada inicial para renderizar as receitas
    renderTodasReceitas();
});
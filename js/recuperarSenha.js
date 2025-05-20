document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const entrarButton = document.getElementById('entrarButton');
    const emailOuUsuarioInput = document.getElementById('emailOuUsuario');
    const palavraChaveInput = document.getElementById('palavraChave');
    const novaSenhaInput = document.getElementById('novaSenha');
    const voltarLogin = document.querySelector('.back-link'); // Seleciona o link pela classe

    // Dados mockados para simulação
    const usuariosCadastrados = [
        {
            email: "exemplo@gmail.com",
            usuario: "user123",
            palavraChave: "palavrachave",
            senha: "senhaAntiga123"
        }
    ];

    // Função para mostrar/ocultar senha
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                targetInput.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // Função para validar recuperação de senha
    function validarRecuperacaoSenha() {
        const emailOuUsuario = emailOuUsuarioInput.value.trim();
        const palavraChave = palavraChaveInput.value;
        const novaSenha = novaSenhaInput.value;

        // Verifica se todos os campos foram preenchidos
        if (!emailOuUsuario || !palavraChave || !novaSenha) {
            alert("Por favor, preencha todos os campos.");
            return false;
        }

        // Verifica se as credenciais correspondem
        const usuarioValido = usuariosCadastrados.find(user =>
            (user.email === emailOuUsuario || user.usuario === emailOuUsuario) &&
            user.palavraChave === palavraChave
        );

        if (usuarioValido) {
            // Atualiza a senha no mock (simulando atualização no banco de dados)
            usuarioValido.senha = novaSenha;
            return true;
        } else {
            return false;
        }
    }

    // Evento do botão Entrar
    entrarButton.addEventListener('click', function(e) {
        e.preventDefault();

        if (validarRecuperacaoSenha()) {
            alert("Senha alterada com sucesso!");
            // Simula redirecionamento após 1 segundo
            setTimeout(() => {
                window.location.href = 'login.html'; // Página de login (pode ser ajustada)
            }, 1000);
        } else {
            alert("Credenciais inválidas. Verifique seu e-mail/nome de usuário e palavra-chave.");
        }
    });

    // Evento do link Voltar para login
    if (voltarLogin) {
        voltarLogin.addEventListener('click', function(e) {
            e.preventDefault();
            // Simula redirecionamento
            window.location.href = 'login.html'; // Página de login (pode ser ajustada)
        });
    }
});
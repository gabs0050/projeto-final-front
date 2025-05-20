document.addEventListener('DOMContentLoaded', function () {
    const usuariosCadastrados = [
        {
            email: "exemplo@gmail.com",
            usuario: "user123",
            senha: "senha123"
        }
    ];

    const entrarButton = document.getElementById('entrarButton');
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const toggleSenha = document.getElementById('toggleSenha');

    // Alternar visibilidade da senha
    toggleSenha.addEventListener('click', function () {
        const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
        senhaInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Validação do login
    function validarLogin() {
        const usuario = usuarioInput.value.trim();
        const senha = senhaInput.value;

        if (!usuario || !senha) {
            alert("Por favor, preencha todos os campos.");
            return false;
        }

        const usuarioValido = usuariosCadastrados.find(user =>
            (user.email === usuario || user.usuario === usuario) &&
            user.senha === senha
        );

        return !!usuarioValido;
    }

    entrarButton.addEventListener('click', function (e) {
        e.preventDefault();

        if (validarLogin()) {
            alert("Login realizado com sucesso!");
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            alert("Credenciais inválidas. Verifique seus dados.");
        }
    });
});

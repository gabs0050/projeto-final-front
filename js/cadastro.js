document.addEventListener('DOMContentLoaded', function () {
    const createAccountButton = document.getElementById('createAccountButton');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Create toast container
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'toast-message';
        messageDiv.textContent = message;
        
        const closeButton = document.createElement('span');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '&times;';
        
        toast.appendChild(icon);
        toast.appendChild(messageDiv);
        toast.appendChild(closeButton);
        
        toastContainer.appendChild(toast);

        closeButton.addEventListener('click', () => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        });

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in-out forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Por favor, insira um endereço de e-mail válido.');
            return false;
        }
        return true;
    }

    function validateRegistration() {
        if (!usernameInput.value || !emailInput.value || !passwordInput.value || !confirmPasswordInput.value || !phoneInput.value) {
            showToast('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }
    
        if (!validateEmail(emailInput.value)) {
            return false;
        }
    
        if (phoneInput.value.replace(/\D/g, '').length < 11) {
            showToast('O número de telefone deve conter pelo menos 11 dígitos (incluindo DDD).');
            return false;
        }
    
        if (passwordInput.value !== confirmPasswordInput.value) {
            showToast('As senhas não coincidem. Por favor, verifique.');
            return false;
        }
    
        if (passwordInput.value.length < 6) {
            showToast('A senha deve ter pelo menos 6 caracteres.');
            return false;
        }
    
        return true;
    }
    

    // Password visibility toggle
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                targetInput.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    if (createAccountButton) {
        createAccountButton.addEventListener('click', function (e) {
            e.preventDefault();

            if (validateRegistration()) {
                showToast('Conta criada com sucesso! Redirecionando para login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');

                if (value.length > 10) {
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                } else {
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                }
            }

            e.target.value = value;
        });
    }
});
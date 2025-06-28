document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const useDemoCheckbox = document.getElementById('use-demo');
    
    // Envio do formulário
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const company = document.getElementById('company').value;
        const isDemo = useDemoCheckbox.checked;
        
        // Dados para enviar ao servidor
        const userData = {
            name,
            email,
            password,
            company,
            isDemo
        };
        
        if (isDemo) {
            // Para conta de demonstração, não precisamos fazer chamada ao servidor
            // Apenas armazenamos localmente que é uma conta demo
            localStorage.setItem('demoAccount', 'true');
            localStorage.setItem('userName', name);
            
            // Usar ícone de avatar padrão
            localStorage.setItem('useAvatarIcon', 'true');
            
            alert('Conta de demonstração criada com sucesso! Redirecionando para o dashboard...');
            // Redirecionar para o dashboard
            window.location.href = '/app Growth Pro/Dashboard/pagina inicial/dashboard.html';
            return;
        }
        
        // Enviar dados para o servidor (exemplo com fetch)
        fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar conta');
            }
            return response.json();
        })
        .then(data => {
            alert('Conta criada com sucesso! Redirecionando para o dashboard...');
            // Redirecionar para o dashboard
            window.location.href = '/app%20Growth%20Pro/Dashboard/dashboard.html';
        })
        .catch(error => {
            alert('Erro ao criar conta: ' + error.message);
        });
    });
});
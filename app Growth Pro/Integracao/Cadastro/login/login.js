document.addEventListener('DOMContentLoaded', function() {
    const facebookLoginBtn = document.getElementById('facebook-login-btn');
    const connectMetaBtn = document.getElementById('connect-meta-btn');
    
    // Carregar o SDK do Facebook quando a página carregar
    loadFacebookSDK();
    
    // Variável para armazenar o App ID
    let facebookAppId = '';
    
    // Inicializar o SDK do Facebook (será chamado após obter o App ID)
    function initFacebookSDK(appId) {
        facebookAppId = appId;
        FB.init({
            appId: appId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
        });
    }
    
    // Carregar o SDK do Facebook de forma assíncrona quando necessário
    function loadFacebookSDK() {
        if (document.getElementById('facebook-jssdk')) return;
        
        var js = document.createElement('script');
        js.id = 'facebook-jssdk';
        js.src = "https://connect.facebook.net/pt_BR/sdk.js";
        document.getElementsByTagName('head')[0].appendChild(js);
        
        // Aguardar o carregamento do SDK
        return new Promise((resolve) => {
            js.onload = resolve;
        });
    }
    
    // Login com Facebook
    facebookLoginBtn.addEventListener('click', function() {
        // Verificar se já temos um App ID
        const appId = document.getElementById('app-id').value.trim();
        const appSecret = document.getElementById('app-secret').value.trim();
        
        if (!appId) {
            alert('Por favor, preencha o ID do Aplicativo na seção Meta Ads abaixo');
            return;
        }
        
        // Verificar se o App ID é válido
        verifyAndLoginWithFacebook(appId, appSecret);
    });
    
    // Conexão com Meta Ads
    connectMetaBtn.addEventListener('click', function() {
        const appId = document.getElementById('app-id').value.trim();
        const appSecret = document.getElementById('app-secret').value.trim();
        
        if (!appId || !appSecret) {
            alert('Por favor, preencha o ID do Aplicativo e a Chave Secreta');
            return;
        }
        
        // Verificar se o ID e a chave são válidos
        verifyAppCredentials(appId, appSecret);
    });
    
    // Função para verificar se o ID do aplicativo e a chave secreta são válidos
    function verifyAppCredentials(appId, appSecret) {
        // Endpoint para verificar a validade do app ID e app secret
        const url = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    // Credenciais válidas, prosseguir com a autenticação
                    initFacebookAuth(appId, appSecret);
                } else {
                    alert('ID do aplicativo ou chave secreta inválidos. Por favor, verifique suas credenciais.');
                }
            })
            .catch(error => {
                alert('ID do aplicativo ou chave secreta inválidos. Por favor, verifique suas credenciais.');
                console.error('Erro na verificação das credenciais:', error);
            });
    }
    
    // Função para verificar o App ID e fazer login com Facebook
    function verifyAndLoginWithFacebook(appId, appSecret) {
        const url = `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.access_token) {
                    // Credenciais válidas, inicializar SDK e fazer login
                    initFacebookSDK(appId);
                    
                    // Fazer login com Facebook
                    FB.login(function(response) {
                        if (response.authResponse) {
                            // Usuário autenticado com sucesso
                            FB.api('/me', {fields: 'name,email'}, function(userInfo) {
                                // Armazenar informações do usuário
                                localStorage.setItem('userInfo', JSON.stringify({
                                    id: response.authResponse.userID,
                                    name: userInfo.name,
                                    email: userInfo.email,
                                    accessToken: response.authResponse.accessToken
                                }));
                                
                                alert(`Bem-vindo, ${userInfo.name}! Redirecionando para o dashboard...`);
                                window.location.href = '/app%20Growth%20Pro/Dashboard/dashboard.html';
                            });
                        } else {
                            alert('Login cancelado ou não autorizado.');
                        }
                    }, {scope: 'public_profile,email'});
                } else {
                    alert('ID do aplicativo inválido. Por favor, forneça um ID válido.');
                }
            })
            .catch(error => {
                alert('ID do aplicativo inválido. Por favor, forneça um ID válido.');
                console.error('Erro na verificação do App ID:', error);
            });
    }
    
    function initFacebookAuth(appId, appSecret) {
        // Inicializar o SDK do Facebook com o App ID fornecido
        initFacebookSDK(appId);
        
        // Iniciar o processo de login e solicitação de permissões
        FB.login(function(response) {
            if (response.authResponse) {
                // Usuário autorizou o aplicativo
                const accessToken = response.authResponse.accessToken;
                
                // Verificar se o token tem as permissões necessárias para acessar o Ads
                FB.api('/me/permissions', function(permResponse) {
                    const hasAdsPermission = permResponse.data.some(
                        perm => perm.permission === 'ads_management' && perm.status === 'granted'
                    );
                    
                    if (hasAdsPermission) {
                        // Obter informações da conta de anúncios
                        FB.api('/me/adaccounts', function(adsResponse) {
                            if (adsResponse && !adsResponse.error) {
                                // Armazenar token e informações da conta
                                localStorage.setItem('metaAdsToken', accessToken);
                                localStorage.setItem('metaAdsAccounts', JSON.stringify(adsResponse.data));
                                
                                alert('Conta Meta Ads conectada com sucesso! Redirecionando para o dashboard...');
                                window.location.href = '/app%20Growth%20Pro/Dashboard/dashboard.html';
                            } else {
                                alert('Erro ao obter contas de anúncios: ' + 
                                      (adsResponse.error ? adsResponse.error.message : 'Erro desconhecido'));
                            }
                        }, {access_token: accessToken});
                    } else {
                        // Solicitar permissão específica para ads_management
                        FB.login(function(reAuthResponse) {
                            if (reAuthResponse.authResponse) {
                                alert('Permissões concedidas! Redirecionando para o dashboard...');
                                window.location.href = '/app%20Growth%20Pro/Dashboard/dashboard.html';
                            } else {
                                alert('É necessário conceder permissões para acessar suas contas de anúncios.');
                            }
                        }, {scope: 'ads_management,ads_read', auth_type: 'rerequest'});
                    }
                });
            } else {
                alert('Autenticação cancelada pelo usuário.');
            }
        }, {scope: 'ads_management,ads_read'});
    }
});
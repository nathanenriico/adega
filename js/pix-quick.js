// PIX rápido
function quickPIX(amount) {
    const pixData = {
        key: '11941716617',
        amount: amount,
        description: 'Adega do Tio Pancho'
    };
    
    console.log('PIX gerado:', pixData);
    return pixData;
}
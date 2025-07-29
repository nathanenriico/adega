// PIX estático
const PIX_KEY = '11941716617';
const PIX_NAME = 'ADEGA DO TIO PANCHO';

function createStaticPIX(amount) {
    return {
        key: PIX_KEY,
        name: PIX_NAME,
        amount: amount,
        message: `Pagamento Adega - R$ ${amount}`
    };
}
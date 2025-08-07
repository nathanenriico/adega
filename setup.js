#!/usr/bin/env node

// Script de configuração inicial
const fs = require('fs');
const path = require('path');

console.log('🍷 Configurando Adega do Tio Pancho...\n');

// Verificar se config.js existe
const configPath = path.join(__dirname, 'js', 'config.js');
const templatePath = path.join(__dirname, 'js', 'config-template.js');

if (!fs.existsSync(configPath)) {
    if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, configPath);
        console.log('✅ Arquivo config.js criado a partir do template');
        console.log('⚠️  CONFIGURE suas chaves de API em js/config.js');
    } else {
        console.log('❌ Template de configuração não encontrado');
    }
} else {
    console.log('✅ Arquivo config.js já existe');
}

// Verificar .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
    console.log('✅ Arquivo .gitignore configurado');
} else {
    console.log('⚠️  Crie um arquivo .gitignore para proteger suas chaves');
}

console.log('\n🚀 Setup concluído!');
console.log('📖 Leia o README.md para mais instruções');
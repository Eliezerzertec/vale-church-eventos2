# Usar imagem Node.js oficial
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY . .

# Expor portas (frontend na 8080, backend na 3001)
EXPOSE 3001 8080

# Comando padrão: rodar backend + frontend
CMD ["sh", "-c", "npm run dev:backend & npm run dev"]

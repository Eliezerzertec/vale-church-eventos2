# 🐳 Docker Setup - Vale Church Manager

## Arquivos Criados

- `Dockerfile` - Container único (backend + frontend)
- `Dockerfile.backend` - Backend otimizado
- `Dockerfile.frontend` - Frontend com Nginx
- `docker-compose.yml` - Orquestração de containers
- `nginx.conf` - Configuração do reverse proxy
- `.dockerignore` - Arquivos ignorados no build

---

## 🚀 Como Usar

### **Opção 1: Rodar Tudo com Docker Compose (Recomendado)**

```powershell
# Instalar Docker Desktop (Windows)
# https://www.docker.com/products/docker-desktop

# Clonar e entrar na pasta
cd vale-church-manager

# Build das imagens
docker-compose build

# Rodar containers
docker-compose up

# Em outro terminal, visualizar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

**Acesso:**
- Frontend: http://localhost:8080
- Backend: http://localhost:3001

---

### **Opção 2: Build Manual (Sem Compose)**

```powershell
# Build backend
docker build -f Dockerfile.backend -t vale-church-backend .

# Build frontend
docker build -f Dockerfile.frontend -t vale-church-frontend .

# Rodar backend
docker run -p 3001:3001 vale-church-backend

# Rodar frontend (outro terminal)
docker run -p 8080:8080 vale-church-frontend
```

---

### **Opção 3: Container Único**

```powershell
# Build
docker build -t vale-church-app .

# Rodar
docker run -p 3001:3001 -p 8080:8080 vale-church-app
```

---

## 🌍 Deploy em Produção

### **Opção A: Railway (Recomendado)**
1. Vai para https://railway.app
2. Conecta GitHub
3. Seleciona este repositório
4. Railway detecta `Dockerfile` automaticamente
5. Deploy automático

### **Opção B: Docker Hub**
```powershell
# Fazer login
docker login

# Tag a imagem
docker tag vale-church-app seu-usuario/vale-church-app:latest

# Push
docker push seu-usuario/vale-church-app:latest

# Depois pode usar em qualquer lugar:
# docker run seu-usuario/vale-church-app:latest
```

### **Opção C: Heroku**
```powershell
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create seu-app-name

# Deploy
git push heroku main
```

---

## 🔧 Variáveis de Ambiente

O `docker-compose.yml` já contém as variáveis.

Para produção, atualize em:
- `docker-compose.yml` (desenvolvimento)
- Ou defina via variáveis de ambiente do servidor

```powershell
# Rodar com variáveis customizadas
docker run \
  -e VITE_ABACATEPAY_KEY=abc_prod_xxxxx \
  -e SUPABASE_URL=https://xxx.supabase.co \
  -p 3001:3001 \
  -p 8080:8080 \
  vale-church-app
```

---

## 📊 Monitorar Containers

```powershell
# Ver containers rodando
docker ps

# Ver histórico
docker ps -a

# Ver logs
docker logs nome-container

# Logs em tempo real
docker logs -f nome-container

# Entrar no container
docker exec -it nome-container /bin/sh
```

---

## 🧹 Limpar

```powershell
# Remover containers parados
docker prune

# Remover imagens não usadas
docker image prune

# Remover volumes não usados
docker volume prune

# Tudo (cuidado!)
docker system prune -a
```

---

## ✅ Checklist de Deploy

- [ ] Dockerfile criado ✓
- [ ] docker-compose.yml configurado ✓
- [ ] .env configurado com variáveis reais
- [ ] `npm install` rodado localmente
- [ ] `npm run build` roda sem erros
- [ ] Docker Desktop instalado
- [ ] `docker-compose up` funciona localmente
- [ ] Testar em http://localhost:8080 e :3001
- [ ] Fazer push para Git
- [ ] Configurar Railway/Heroku/Outro
- [ ] Testar em produção

---

## 🚨 Troubleshooting

**Porta já em uso?**
```powershell
docker-compose down
docker system prune -a
docker-compose up --build
```

**Erro de permissions?**
```powershell
# Windows: Executar PowerShell como Admin
# Linux/Mac: Usar sudo
sudo docker-compose up
```

**Build falha?**
```powershell
docker-compose build --no-cache
```

**Container crasha?**
```powershell
docker logs nome-container
# Ver o erro e verificar configurações
```

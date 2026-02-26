# 🐳 Instalando Docker

## Windows 10/11

### Opção 1: Docker Desktop (Recomendado)

1. **Baixe Docker Desktop:**
   https://www.docker.com/products/docker-desktop

2. **Instale:**
   - Abra o instalador
   - Selecione "Install required Windows components for WSL 2"
   - Reinicie o computador

3. **Verifique instalação:**
   ```powershell
   docker --version
   docker-compose --version
   ```

4. **Resolva problemas comuns:**
   
   **Erro: WSL 2 não instalado**
   ```powershell
   # Abra PowerShell como Admin
   wsl --install
   wsl --set-default-version 2
   # Reinicie
   ```

   **Erro: Hyper-V não habilitado**
   ```powershell
   # PowerShell como Admin
   Enable-WindowsOptionalFeature -Online -FeatureName Hyper-V
   # Reinicie
   ```

5. **Inicie Docker Desktop**
   - Procure "Docker" no menu iniciar
   - Abra e aguarde inicializar

---

## Linux (Ubuntu/Debian)

```bash
# Atualize pacotes
sudo apt update && sudo apt upgrade -y

# Instale Docker
sudo apt install docker.io -y

# Instale Docker Compose
sudo apt install docker-compose -y

# Adicione ao grupo sudo (sem precisar de sudo toda vez)
sudo usermod -aG docker $USER

# Reinicie ou faça logout/login
newgrp docker
```

---

## macOS

```bash
# Via Homebrew
brew install docker docker-compose

# Ou baixe Docker Desktop:
# https://www.docker.com/products/docker-desktop/
```

---

## 🔍 Verificar Instalação

```powershell
# Deve mostrar versões
docker --version
docker-compose --version

# Teste um container
docker run alpine echo "Docker funciona!"
```

---

## ✅ Se tudo funcionar:

```powershell
# Volte para a pasta do projeto
cd vale-church-manager

# Execute o comando Docker
docker-compose up --build

# Em outro terminal, veja os logs
docker-compose logs -f
```

---

## 📊 Próximos Passos

1. **Instale Docker Desktop**
2. **Reinicie o computador**
3. **Abra PowerShell em vale-church-manager**
4. **Execute:** `docker-compose up --build`
5. **Acesse:** http://localhost:8080

Precisa de ajuda? Chame-me depois que instalar! 🚀

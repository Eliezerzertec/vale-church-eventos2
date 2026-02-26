.PHONY: help build up down logs clean rebuild status shell-backend shell-frontend

help:
	@echo "🐳 Vale Church Docker CLI"
	@echo ""
	@echo "Comandos disponíveis:"
	@echo "  make build           - Build das imagens"
	@echo "  make up              - Rodar containers"
	@echo "  make down            - Parar containers"
	@echo "  make logs            - Ver logs em tempo real"
	@echo "  make clean           - Limpar containers/imagens"
	@echo "  make rebuild         - Build + up (fresh)"
	@echo "  make status          - Ver status dos containers"
	@echo "  make shell-backend   - Entrar no shell do backend"
	@echo "  make shell-frontend  - Entrar no shell do frontend"
	@echo ""

build:
	@echo "📦 Building images..."
	docker-compose build --no-cache

up:
	@echo "🚀 Starting containers..."
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo ""
	@echo "📍 Acesso:"
	@echo "   Frontend: http://localhost:8080"
	@echo "   Backend:  http://localhost:3001"

down:
	@echo "⏹️  Stopping containers..."
	docker-compose down
	@echo "✅ Containers stopped!"

logs:
	@echo "📊 Showing logs..."
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning Docker..."
	docker system prune -f
	@echo "✅ Docker cleaned!"

rebuild: down clean build up
	@echo "🔄 Rebuild completo!"

status:
	@echo "📊 Container Status:"
	docker-compose ps

shell-backend:
	@echo "🔓 Entering backend container shell..."
	docker exec -it vale-church-manager-backend-1 /bin/sh

shell-frontend:
	@echo "🔓 Entering frontend container shell..."
	docker exec -it vale-church-manager-frontend-1 /bin/sh

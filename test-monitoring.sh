#!/bin/bash
# Script para testar endpoints de monitoramento de transações API AbacatePay
# Uso: bash test-monitoring.sh

BASE_URL="http://localhost:3001"

echo "🔍 TESTANDO ENDPOINTS DE MONITORAMENTO API ABACATEPAY"
echo "===================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Últimas transações
echo -e "\n${BLUE}1️⃣  Últimas 10 transações com erro:${NC}"
curl -s "$BASE_URL/api/monitor/transactions?limit=10&status=error" | jq '.'

# 2. Últimas transações bem-sucedidas
echo -e "\n${BLUE}2️⃣  Últimas 10 transações bem-sucedidas:${NC}"
curl -s "$BASE_URL/api/monitor/transactions?limit=10&status=success" | jq '.'

# 3. Estatísticas gerais
echo -e "\n${BLUE}3️⃣  Estatísticas gerais:${NC}"
curl -s "$BASE_URL/api/monitor/stats" | jq '.'

# 4. Transações de um usuário (ajuste o email)
echo -e "\n${BLUE}4️⃣  Transações de um usuário específico:${NC}"
echo "🔎 Procurando por: zertec.eliezer@hotmail.com"
curl -s "$BASE_URL/api/monitor/user/zertec.eliezer@hotmail.com" | jq '.'

# 5. Histórico de uma cobrança (ajuste o billing ID)
echo -e "\n${BLUE}5️⃣  Историјал de uma cobrança específica:${NC}"
echo "🔎 Procurando por: bill_S1GkTKyKZtc0aCKys1mBRQqB"
curl -s "$BASE_URL/api/monitor/billing/bill_S1GkTKyKZtc0aCKys1mBRQqB" | jq '.'

echo -e "\n${GREEN}✅ Testes Complete!${NC}"

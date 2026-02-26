#!/bin/bash
# Script para desabilitar RLS na tabela payments
# Rode no Supabase SQL Editor

echo "📋 Desabilitar RLS na tabela payments..."
echo ""
echo "Copie e cole no Supabase SQL Editor (https://supabase.com/dashboard):"
echo ""
echo "=================================================="
echo "ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;"
echo "=================================================="
echo ""
echo "✅ Depois recarregue a página (F5) e teste novamente"

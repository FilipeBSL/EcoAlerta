#!/bin/bash
# ============================================================
# EcoAlerta — Script de inicialização rápida
# ============================================================

set -e

echo "=========================================="
echo "  🌿 EcoAlerta — Iniciando o sistema"
echo "=========================================="

# Verificar se .env existe
if [ ! -f .env ]; then
  echo "⚠️  Arquivo .env não encontrado."
  echo "    Criando a partir do .env.example..."
  cp .env.example .env
  echo "    ✅ .env criado. Edite as variáveis se necessário."
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker não está rodando. Inicie o Docker Desktop e tente novamente."
  exit 1
fi

echo ""
echo "📦 Subindo os containers..."
docker-compose up -d --build

echo ""
echo "⏳ Aguardando o banco de dados ficar pronto..."
sleep 5

echo ""
echo "=========================================="
echo "  ✅ Sistema iniciado com sucesso!"
echo "=========================================="
echo ""
echo "  🌐 Frontend:      http://localhost:3000"
echo "  🔌 API Backend:   http://localhost:3001/api/v1"
echo "  🗄  MinIO Console: http://localhost:9001"
echo "  🐘 PostgreSQL:    localhost:5432"
echo ""
echo "  👤 Admin padrão:"
echo "     Email: admin@ecoalerta.local"
echo "     Senha: Admin@123"
echo ""
echo "  Para parar: docker-compose down"
echo "=========================================="

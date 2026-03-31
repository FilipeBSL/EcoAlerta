-- ============================================================
-- EcoAlerta — Migration inicial
-- Executado automaticamente pelo Docker na primeira inicialização
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- TABELA: bairros
-- ============================================================
CREATE TABLE IF NOT EXISTS bairros (
  id        SERIAL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  municipio VARCHAR(100) NOT NULL DEFAULT 'São Paulo',
  uf        CHAR(2)      NOT NULL DEFAULT 'SP'
);

-- ============================================================
-- TABELA: equipes_limpeza
-- ============================================================
CREATE TABLE IF NOT EXISTS equipes_limpeza (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  responsavel VARCHAR(150) NOT NULL,
  ativa       BOOLEAN      NOT NULL DEFAULT TRUE,
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: usuarios
-- ============================================================
CREATE TYPE perfil_usuario AS ENUM ('cidadao', 'administrador', 'equipe_limpeza');

CREATE TABLE IF NOT EXISTS usuarios (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        VARCHAR(150) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  perfil      perfil_usuario NOT NULL DEFAULT 'cidadao',
  ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
  municipio   VARCHAR(100),
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- ============================================================
-- TABELA: denuncias
-- ============================================================
CREATE TYPE status_denuncia AS ENUM (
  'pendente', 'em_analise', 'em_atendimento', 'resolvida', 'cancelada', 'invalida'
);

CREATE TABLE IF NOT EXISTS denuncias (
  id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID           NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  bairro_id       INTEGER        REFERENCES bairros(id) ON DELETE SET NULL,
  equipe_id       INTEGER        REFERENCES equipes_limpeza(id) ON DELETE SET NULL,
  descricao       VARCHAR(500)   NOT NULL CHECK (length(descricao) >= 10),
  status          status_denuncia NOT NULL DEFAULT 'pendente',
  endereco_texto  VARCHAR(300),
  latitude        DECIMAL(10,8)  NOT NULL,
  longitude       DECIMAL(11,8)  NOT NULL,
  protocolo       VARCHAR(20)    NOT NULL UNIQUE,
  criado_em       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  resolvido_em    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_denuncias_status     ON denuncias(status);
CREATE INDEX IF NOT EXISTS idx_denuncias_usuario_id ON denuncias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_bairro_id  ON denuncias(bairro_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_criado_em  ON denuncias(criado_em DESC);

-- ============================================================
-- TABELA: fotos_denuncia
-- ============================================================
CREATE TABLE IF NOT EXISTS fotos_denuncia (
  id             SERIAL       PRIMARY KEY,
  denuncia_id    UUID         NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  url            VARCHAR(500) NOT NULL,
  nome_arquivo   VARCHAR(255) NOT NULL,
  tamanho_bytes  INTEGER      NOT NULL,
  mime_type      VARCHAR(50)  NOT NULL,
  ordem          SMALLINT     NOT NULL DEFAULT 1,
  criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_denuncia_id ON fotos_denuncia(denuncia_id);

-- ============================================================
-- TABELA: historico_status
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_status (
  id               SERIAL          PRIMARY KEY,
  denuncia_id      UUID            NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  usuario_id       UUID            NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  status_anterior  status_denuncia,
  status_novo      status_denuncia NOT NULL,
  comentario       VARCHAR(500),
  criado_em        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_denuncia_id ON historico_status(denuncia_id);

-- ============================================================
-- SEEDS: dados iniciais
-- ============================================================

-- Bairros (São Paulo - amostra)
INSERT INTO bairros (nome, municipio, uf) VALUES
  ('Centro',             'São Paulo', 'SP'),
  ('Vila Madalena',      'São Paulo', 'SP'),
  ('Pinheiros',          'São Paulo', 'SP'),
  ('Santana',            'São Paulo', 'SP'),
  ('Mooca',              'São Paulo', 'SP'),
  ('Lapa',               'São Paulo', 'SP'),
  ('Santo André',        'São Paulo', 'SP'),
  ('Jardim Paulista',    'São Paulo', 'SP'),
  ('Penha',              'São Paulo', 'SP'),
  ('Ipiranga',           'São Paulo', 'SP')
ON CONFLICT DO NOTHING;

-- Equipes de limpeza
INSERT INTO equipes_limpeza (nome, responsavel) VALUES
  ('Equipe Alpha', 'Carlos Mendes'),
  ('Equipe Beta',  'Fernanda Souza'),
  ('Equipe Gamma', 'Roberto Lima')
ON CONFLICT DO NOTHING;

-- Usuário administrador padrão
-- Senha: Admin@123 (hash bcrypt gerado com fator 10)
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
  (
    'Administrador',
    'admin@ecoalerta.local',
    '$2a$10$XqeGj6pYb7TbXmTHmzBqEe3rLBKXz5nfZ9.g2VFi2XF5ZFV8n9F5m',
    'administrador'
  )
ON CONFLICT (email) DO NOTHING;

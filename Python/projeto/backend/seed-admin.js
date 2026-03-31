const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

const db = new Sequelize('ecoalerta', 'ecoalerta', 'ecoalerta123', {
  host: 'postgres',
  dialect: 'postgres',
  logging: false
});

async function run() {
  try {
    await db.authenticate();
    const hash = await bcrypt.hash('Admin@123', 10);

    await db.query(
      `INSERT INTO usuarios (id, nome, email, senha_hash, perfil, ativo, criado_em, atualizado_em)
       VALUES (gen_random_uuid(), 'Administrador', 'admin@ecoalerta.local', :hash, 'administrador', true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash`,
      { replacements: { hash } }
    );

    console.log('✅ Admin criado/atualizado com sucesso!');
    console.log('   Email: admin@ecoalerta.local');
    console.log('   Senha: Admin@123');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await db.close();
  }
}

run();

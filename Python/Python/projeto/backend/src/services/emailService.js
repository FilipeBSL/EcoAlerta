const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'production' && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    logger.info(`[E-mail de teste] Usuário: ${testAccount.user}`);
  }

  return transporter;
}

async function sendEmail({ to, subject, html }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || '"EcoAlerta" <noreply@ecoalerta.local>',
      to, subject, html
    });
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[E-mail] Preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    logger.error('Erro ao enviar e-mail:', err);
  }
}

async function sendDenunciaConfirmation(email, nome, protocolo) {
  await sendEmail({
    to: email,
    subject: `[EcoAlerta] Denúncia registrada — ${protocolo}`,
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Sua denúncia foi registrada com sucesso.</p>
      <p><strong>Protocolo:</strong> ${protocolo}</p>
      <p>Você será notificado(a) por e-mail sempre que o status for atualizado.</p>
      <br><p>Equipe EcoAlerta</p>
    `
  });
}

async function sendStatusUpdate(email, nome, protocolo, statusNovo, comentario) {
  const statusLabels = {
    em_analise: 'Em Análise',
    em_atendimento: 'Em Atendimento',
    resolvida: 'Resolvida ✅',
    cancelada: 'Cancelada',
    invalida: 'Inválida'
  };
  await sendEmail({
    to: email,
    subject: `[EcoAlerta] Atualização da denúncia ${protocolo}`,
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>O status da sua denúncia <strong>${protocolo}</strong> foi atualizado.</p>
      <p><strong>Novo status:</strong> ${statusLabels[statusNovo] || statusNovo}</p>
      ${comentario ? `<p><strong>Comentário:</strong> ${comentario}</p>` : ''}
      <br><p>Equipe EcoAlerta</p>
    `
  });
}

module.exports = { sendDenunciaConfirmation, sendStatusUpdate };

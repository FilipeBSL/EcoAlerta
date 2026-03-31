const Minio = require('minio');
const logger = require('../utils/logger');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const BUCKET = process.env.MINIO_BUCKET || 'ecoalerta-fotos';

async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) {
      await minioClient.makeBucket(BUCKET, 'us-east-1');
      await minioClient.setBucketPolicy(BUCKET, JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`]
        }]
      }));
      logger.info(`Bucket '${BUCKET}' criado com política pública de leitura.`);
    }
  } catch (err) {
    logger.error('Erro ao verificar/criar bucket MinIO:', err);
  }
}

ensureBucket();

module.exports = { minioClient, BUCKET };

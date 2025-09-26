import { FastifyPluginAsync } from 'fastify';
import { UploadController } from '../controllers';

export const uploadRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const uploadController = fastify.controllers.upload;
  
  // Generate presigned URL for client-side upload
  fastify.post('/presign', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['contentType', 'filename', 'filesize'],
        properties: {
          contentType: { type: 'string' },
          filename: { type: 'string' },
          filesize: { type: 'number' },
        },
      },
    },
  }, (request, reply) => uploadController.generatePresignedUrl(request as any, reply));

  // Update media metadata after upload
  fastify.patch('/media/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          width: { type: 'integer' },
          height: { type: 'integer' },
          blurhash: { type: 'string' },
        },
      },
    },
  }, (request, reply) => uploadController.updateMediaMetadata(request as any, reply));

  // Get media details
  fastify.get('/media/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, (request, reply) => uploadController.getMediaById(request as any, reply));

  // Delete media
  fastify.delete('/media/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, (request, reply) => uploadController.deleteMedia(request as any, reply));
};

import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config';

// Zod schemas for request validation
const presignedUrlRequestSchema = z.object({
  contentType: z.string(),
  filename: z.string(),
  filesize: z.number().int().positive(),
});

const updateMediaSchema = z.object({
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  blurhash: z.string().optional(),
});

export class UploadController {
  private s3Client: S3Client;
  
  constructor(private prisma: PrismaClient) {
    // Create S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.cloudflare.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.cloudflare.r2AccessKeyId,
        secretAccessKey: config.cloudflare.r2AccessKeySecret,
      },
    });
  }

  /**
   * Generate a presigned URL for client-side upload
   */
  async generatePresignedUrl(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const { contentType, filename, filesize } = presignedUrlRequestSchema.parse(request.body);
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
      ];
      
      if (!allowedTypes.includes(contentType)) {
        return reply.status(400).send({ 
          message: 'Unsupported file type',
          allowedTypes,
        });
      }
      
      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (filesize > maxSize) {
        return reply.status(400).send({ 
          message: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
          maxSize,
        });
      }
      
      // Generate a unique file key
      const fileExtension = filename.split('.').pop() || '';
      const randomId = crypto.randomBytes(16).toString('hex');
      const key = `uploads/${userId}/${randomId}.${fileExtension}`;
      
      // Create the presigned URL
      const command = new PutObjectCommand({
        Bucket: config.cloudflare.r2Bucket,
        Key: key,
        ContentType: contentType,
      });
      
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour
      
      // Create a media record in database
      const media = await this.prisma.media.create({
        data: {
          r2Key: key,
          mimeType: contentType,
          createdById: userId,
        },
      });
      
      return {
        mediaId: media.id,
        presignedUrl,
        key,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to generate presigned URL' });
    }
  }

  /**
   * Update media metadata after upload
   */
  async updateMediaMetadata(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      const { width, height, blurhash } = updateMediaSchema.parse(request.body);
      
      // Check if media exists and belongs to user
      const media = await this.prisma.media.findFirst({
        where: {
          id,
          createdById: userId,
        },
      });
      
      if (!media) {
        return reply.status(404).send({ 
          message: 'Media not found or you do not have permission to update it'
        });
      }
      
      // Update metadata
      const updatedMedia = await this.prisma.media.update({
        where: { id },
        data: {
          width,
          height,
          blurhash,
        },
      });
      
      return updatedMedia;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to update media metadata' });
    }
  }

  /**
   * Get media details by ID
   */
  async getMediaById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      const media = await this.prisma.media.findUnique({
        where: { id },
      });
      
      if (!media) {
        return reply.status(404).send({ message: 'Media not found' });
      }
      
      // Construct public URL for the media
      // This assumes Cloudflare R2 is configured with a public bucket policy or custom domain
      const publicUrl = `https://${config.cloudflare.r2Bucket}.r2.dev/${media.r2Key}`;
      
      return {
        ...media,
        url: publicUrl,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve media' });
    }
  }

  /**
   * Delete media by ID
   */
  async deleteMedia(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      
      // Check if media exists and belongs to user
      const media = await this.prisma.media.findFirst({
        where: {
          id,
          createdById: userId,
        },
      });
      
      if (!media) {
        return reply.status(404).send({ 
          message: 'Media not found or you do not have permission to delete it'
        });
      }
      
      // Check if media is in use
      const inUseAsAvatar = await this.prisma.user.findFirst({
        where: { avatarMediaId: id },
      });
      
      const inUseAsEventCover = await this.prisma.event.findFirst({
        where: { coverMediaId: id },
      });
      
      if (inUseAsAvatar || inUseAsEventCover) {
        return reply.status(400).send({ 
          message: 'Cannot delete media that is in use'
        });
      }
      
      // Delete from database
      await this.prisma.media.delete({
        where: { id },
      });
      
      // Delete from R2
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.cloudflare.r2Bucket,
            Key: media.r2Key,
          })
        );
      } catch (err) {
        request.log.error(`Failed to delete object from R2: ${err}`);
        // Continue execution even if R2 deletion fails
      }
      
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to delete media' });
    }
  }
}

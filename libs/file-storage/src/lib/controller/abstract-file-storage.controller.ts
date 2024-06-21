import { Body, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AbstractFileService } from '../services';
import { FileDownloadRequest } from './vo/file-donwload.dto';
import { PreAssignRequest, PreAssignResponse } from './vo/pre-assign.dto';
import { FastifyReply } from 'fastify';
import 'reflect-metadata';

export abstract class AbstractFileStorageController {
  protected constructor(
    private readonly bucket: string,
    private readonly fileService: AbstractFileService,
  ) {}

  @Post('download-file')
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  protected async downloadFlyerFilesFromAWS(
    @Res() reply: FastifyReply,
    @Body()
    fileDownloadRequest: FileDownloadRequest,
  ) {
    const { key } = fileDownloadRequest;

    const url = await this.fileService.generateDownloadFilePreSignUrl(
      this.bucket,
      key,
      300,
    );

    reply
      .status(301)
      .header('Content-Security-Policy', "img-src 'self'")
      .redirect(url);
  }

  @Post('get-pre-assign-url')
  @HttpCode(HttpStatus.OK)
  protected async getPreAssignUrl(
    @Body() preAssignRequest: PreAssignRequest,
  ): Promise<PreAssignResponse[]> {
    const { originalFileNames } = preAssignRequest;

    const preAssignUrls: PreAssignResponse[] = [];

    for (const originalFileName of originalFileNames) {
      const { url, key } =
        await this.fileService.generateUploadFilePreSignUrlPut(this.bucket, {
          originalFileName,
        });

      preAssignUrls.push({
        fileName: key,
        preAssignUrl: url,
      });
    }

    return preAssignUrls;
  }
}

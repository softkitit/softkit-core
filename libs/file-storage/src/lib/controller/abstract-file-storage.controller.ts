import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { AbstractFileService } from '../services';
import { PreSignedResponse, UploadPresignRequest } from './vo';
import { FastifyReply } from 'fastify';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export interface IFileStorageControllerOptions {
  downloadExpiresIn?: number;
  uploadExpiredIn?: number;
  crossOriginResourcePolicy?: string;
}

export abstract class AbstractFileStorageController {
  private readonly options: Required<IFileStorageControllerOptions>;

  protected constructor(
    private readonly bucket: string,
    private readonly fileService: AbstractFileService,
    options?: IFileStorageControllerOptions,
  ) {
    this.options = {
      downloadExpiresIn: 60 * 60,
      uploadExpiredIn: 60 * 60,
      crossOriginResourcePolicy: 'same-site',
      ...options,
    };
  }

  @ApiOperation({
    summary: 'Generate Pre-Signed URLs for File Uploads',
    description: `This endpoint generates pre-signed URLs for uploading files to the specified bucket.
      Note that the generated URL is returned regardless of whether the file actually exists in the bucket.
      If the file does not exist, an error will occur only when an attempt is made to download the file using the pre-signed URL.
    `,
  })
  @Get('download-file/*')
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  protected async downloadFileFromAWS(
    @Res() reply: FastifyReply,
    @Param('*') path: string,
  ) {
    const url = await this.fileService.generateDownloadFilePreSignUrl(
      this.bucket,
      path,
      this.options.downloadExpiresIn,
    );

    reply
      .status(HttpStatus.MOVED_PERMANENTLY)
      .header(
        'Cross-Origin-Resource-Policy',
        this.options.crossOriginResourcePolicy,
      )
      .redirect(url);
  }

  // TODO: implement getting a JWT token for file upload and parsing it to simplify security part
  @ApiBody({ type: UploadPresignRequest })
  @ApiOkResponse({
    type: PreSignedResponse,
    isArray: true,
  })
  @Post('get-upload-presign-url')
  @HttpCode(HttpStatus.OK)
  protected async getUploadPresignUrl(
    @Body() uploadPresignRequest: UploadPresignRequest,
  ): Promise<PreSignedResponse[]> {
    const { filesData } = uploadPresignRequest;

    return Promise.all(
      filesData.map(
        async ({ originalFileName, folder }): Promise<PreSignedResponse> => {
          const { url, key } =
            await this.fileService.generateUploadFilePreSignUrlPut(
              this.bucket,
              {
                originalFileName,
              },
              folder,
              this.options.uploadExpiredIn,
            );

          return {
            key,
            preSignedUrl: url,
            originalFileName,
          };
        },
      ),
    );
  }
}

import { Body, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AbstractFileService } from '../services';
import { FileDownloadRequest } from './vo/file-download.dto';
import { PreSignedResponse, UploadPresignRequest } from './vo/pre-assign.dto';
import { FastifyReply } from 'fastify';
import { ApiOperation } from '@nestjs/swagger';

export abstract class AbstractFileStorageController {
  protected constructor(
    private readonly bucket: string,
    private readonly fileService: AbstractFileService,
    private readonly crossOriginResourcePolicy: string = 'same-site',
  ) {}

  @ApiOperation({
    summary: 'Generate Pre-Signed URLs for File Uploads',
    description: `This endpoint generates pre-signed URLs for uploading files to the specified bucket.
      Note that the generated URL is returned regardless of whether the file actually exists in the bucket.
      If the file does not exist, an error will occur only when an attempt is made to download the file using the pre-signed URL.
    `,
  })
  @Post('download-file')
  @HttpCode(HttpStatus.MOVED_PERMANENTLY)
  protected async downloadFileFromAWS(
    @Res() reply: FastifyReply,
    @Body() fileDownloadRequest: FileDownloadRequest,
  ) {
    const { key } = fileDownloadRequest;

    const url = await this.fileService.generateDownloadFilePreSignUrl(
      this.bucket,
      key,
      300,
    );

    reply
      .status(HttpStatus.MOVED_PERMANENTLY)
      .header('Cross-Origin-Resource-Policy', this.crossOriginResourcePolicy)
      .redirect(url);
  }

  // TODO: implement getting a JWT token for file upload and parsing it to simplify security part
  @Post('get-upload-pre-assign-url')
  @HttpCode(HttpStatus.OK)
  protected async getUploadPreAssignUrl(
    @Body() uploadPreAssignRequest: UploadPresignRequest,
  ): Promise<PreSignedResponse[]> {
    const { originalFileNames } = uploadPreAssignRequest;

    return Promise.all(
      originalFileNames.map(
        async (originalFileName): Promise<PreSignedResponse> => {
          const { url, key } =
            await this.fileService.generateUploadFilePreSignUrlPut(
              this.bucket,
              {
                originalFileName,
              },
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

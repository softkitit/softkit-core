import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AbstractFileStorageController } from '../../../controller';
import { AbstractFileService } from '../../../services';

@ApiTags('File')
@Controller('file')
export class FileStorageController extends AbstractFileStorageController {
  constructor(private readonly baseS3FileService: AbstractFileService) {
    super('private-bucket-test', baseS3FileService);
  }
}

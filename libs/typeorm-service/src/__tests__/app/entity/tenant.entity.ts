import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';
import { BaseTenantEntityHelper } from '@softkit/typeorm';
import { IsNumberLocalized } from '@softkit/validation';
import { Expose } from 'class-transformer';

@Entity()
export class TenantEntity extends BaseTenantEntityHelper {
  @PrimaryColumn()
  companyWebsite!: string;

  @Column({ nullable: true, length: 256 })
  companyName!: string;

  @Column({ nullable: true, length: 128 })
  directorName?: string;

  @VersionColumn()
  @IsNumberLocalized()
  @Expose()
  version!: number;
}

import { Column, Entity } from 'typeorm';
import { EmbeddedId } from './vo/embedded-id';
import { BaseEntityHelper } from '@softkit/typeorm';

@Entity('with-embedded')
export class EntityWithEmbeddedId extends BaseEntityHelper {
  @Column(() => EmbeddedId)
  id!: EmbeddedId;

  @Column({ nullable: true, length: 256 })
  someColumn!: string;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityHelper } from '../../lib/entities/entity-helper';

@Entity()
export class TestBaseEntity extends BaseEntityHelper {
  @PrimaryGeneratedColumn('uuid')
  override id!: string;

  // having it nullable is useful for set password later logic
  @Column({ nullable: true, length: 256 })
  password?: string;

  @Column({ type: String, nullable: false, length: 128 })
  firstName!: string;

  @Column({ type: String, nullable: false, length: 128 })
  lastName!: string;

  @Column({ type: String, nullable: true, length: 128 })
  nullableStringField?: string | null;
}

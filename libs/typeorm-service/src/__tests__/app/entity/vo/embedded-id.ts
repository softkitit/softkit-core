import { Column, PrimaryColumn } from 'typeorm';

export class EmbeddedId {
  @PrimaryColumn()
  @Column({ nullable: false, primary: true })
  name!: string;

  @PrimaryColumn()
  @Column({ nullable: false, primary: true })
  version!: number;
}

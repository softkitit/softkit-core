import { VersionedJobData } from '../../../../job';

export class BusyJobData extends VersionedJobData {
  executeForMillis!: number;
}

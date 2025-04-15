import type { GeneratorOption } from '../../../../../../../utils/generator/vo/generator-option';
import type {
  Generator,
  GeneratorCallback,
} from '../../../../../../../utils/generator/vo/generator';
import { Tree } from '../../../../../../../service/tree';
import { WorkspaceContext } from '../../../../../../../utils/app-context/vo/app-environment.context';

export interface MyLocalGeneratorOptions {
  name: string;
  customOption: string;
}

export class MyLocalGenerator implements Generator<MyLocalGeneratorOptions> {
  generate(
    fs: Tree,
    workspaceContext: WorkspaceContext,
    options: MyLocalGeneratorOptions | undefined,
  ): void | GeneratorCallback | Promise<void | GeneratorCallback> {
    fs.write('test.txt', options?.customOption || 'default value');
  }
  getInputs(): GeneratorOption<string, unknown>[] {
    return [
      {
        name: 'customInput',
        type: 'string',
        array: false,
        require: true,
      },
    ];
  }

  getGeneratorDescription(): string {
    return 'Some dynamic description';
  }
}

export default MyLocalGenerator;

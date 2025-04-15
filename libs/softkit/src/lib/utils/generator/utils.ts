import { AppContext } from '../app-context/vo/app-context';
import { findPlugins, getImplementationFactory } from '../plugins';
import { PluginInfo } from '../plugins/vo/plugin-info';
import { FieldType, GeneratorOption } from './vo/generator-option';
import { validateAndConvert } from './validation';
import { Generator } from './vo/generator';
import { ValidationError } from '../../error/validation.error';
import enquirer = require('enquirer');

export function getAllPlugins(apps: AppContext[]) {
  return [
    ...findPlugins(),
    ...apps.map((app) =>
      app.hasBuiltInPlugin
        ? {
            path: app.path,
            packageJson: app.packageJson,
            local: true,
          }
        : undefined,
    ),
  ]
    .filter((plugin): plugin is PluginInfo => !!plugin)
    .sort((a, b) => a.packageJson.name.localeCompare(b.packageJson.name));
}

export async function promptForGeneratorIfNeeded(
  generator: {
    module: string;
    generator?: string;
  },
  generatorsDefinition: Record<string, string> & string,
  plugin: PluginInfo,
): Promise<string> {
  if (
    generator.generator === undefined ||
    !generatorsDefinition[generator.generator]
  ) {
    const generatorPrompt = await enquirer.prompt<{ generator: string }>([
      {
        name: 'generator',
        message: `Select a generator from ${plugin.packageJson.name} plugin:`,
        type: 'autocomplete',
        choices: Object.keys(generatorsDefinition).map((generator) => ({
          name: generator,
        })),
        initial: 0,
      },
    ]);
    return generatorPrompt.generator;
  } else {
    return generator.generator;
  }
}

export function parseGeneratorString(value: string): {
  module: string;
  generator?: string;
} {
  const separatorIndex = value.lastIndexOf(':');

  return separatorIndex > 0
    ? {
        module: value.slice(0, separatorIndex),
        generator: value.slice(separatorIndex + 1),
      }
    : {
        module: value,
      };
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function validateGeneratorInputs(
  generatorFields: GeneratorOption<FieldType, unknown>[],
  args: Record<string, unknown>,
  apps?: AppContext[],
) {
  const generatorInputs: Record<string, unknown> = {};

  for (const field of generatorFields) {
    let value = args[field.name] as string | string[];

    const requiredField = field.require ?? true;

    if (field.type === 'app' && requiredField) {
      if (!value) {
        //   todo prompt for apps here
      }
      const values = Array.isArray(value) ? value : [value];
      const applications = values.map((v) => {
        const foundApp = (apps || []).find(
          (app) => app.name?.toLowerCase()?.trim() === v?.toLowerCase()?.trim(),
        );

        if (!foundApp) {
          throw new ValidationError(
            `Entered app '${v}' not found in workspace, available application names are ${apps
              ?.map((app) => app.name)
              .join(', ')}`,
          );
        }

        return foundApp;
      });

      generatorInputs[field.name] = Array.isArray(value)
        ? applications
        : applications[0];
      continue;
    }

    if (requiredField && !value) {
      //   todo prompt for value here or throw error
      value = 'smth';
    }

    generatorInputs[field.name] = validateAndConvert(
      field.name,
      value,
      field.type,
      field.validation,
    );
  }
  return generatorInputs;
}

export function getGeneratorImplementation(
  generatorImplementation: string,
  plugin: PluginInfo,
) {
  const implementationFactory = getImplementationFactory<{
    new (...args: unknown[]): Generator<unknown>;
  }>(generatorImplementation, plugin.path);

  const GeneratorFactory = implementationFactory();
  return new GeneratorFactory();
}

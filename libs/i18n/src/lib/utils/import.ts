import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function importOrRequireFile(filePath: string): Promise<any> {
  const tryToImport = async (): Promise<any> => {
    // `Function` is required to make sure the `import` statement wil stay `import` after
    // transpilation and won't be converted to `require`
    await new Function('return filePath => import(filePath)')()(
      filePath.startsWith('file://')
        ? filePath
        : pathToFileURL(filePath).toString(),
    );
  };
  const tryToRequire = async (): Promise<any> => {
    return require(filePath);
  };

  const extension = filePath.slice(
    Math.max(0, filePath.lastIndexOf('.') + '.'.length),
  );

  switch (extension) {
    case 'mjs':
    case 'mts': {
      return tryToImport();
    }
    case 'cjs':
    case 'cts': {
      return tryToRequire();
    }
    case 'js':
    case 'ts': {
      const packageJson = await getNearestPackageJson(filePath);

      if (packageJson == undefined) {
        return tryToRequire();
      } else {
        const isModule = (packageJson as any)?.type === 'module';

        return isModule ? tryToImport() : tryToRequire();
      }
    }
    // No default
  }

  return tryToRequire();
}

function getNearestPackageJson(filePath: string): Promise<object | null> {
  return new Promise((accept) => {
    let currentPath = filePath;

    function searchPackageJson() {
      const nextPath = path.dirname(currentPath);

      if (currentPath === nextPath)
        // the top of the file tree is reached
        accept(null);
      else {
        currentPath = nextPath;
        const potentialPackageJson = path.join(currentPath, 'package.json');

        fs.stat(potentialPackageJson, (err, stats) => {
          if (err != undefined) searchPackageJson();
          else if (stats.isFile()) {
            fs.readFile(potentialPackageJson, 'utf8', (err, data) => {
              if (err == undefined) {
                try {
                  accept(JSON.parse(data));
                } catch {
                  accept(null);
                }
              } else {
                accept(null);
              }
            });
          } else searchPackageJson();
        });
      }
    }

    searchPackageJson();
  });
}

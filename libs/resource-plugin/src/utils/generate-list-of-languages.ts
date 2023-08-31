import * as fs from 'node:fs';

function processType(
  type: string,
  allRecordsWithoutDeprecated: Record<string, string>[],
) {
  const fileName = `${type}s.json`;
  const allByType = allRecordsWithoutDeprecated.filter((v) => v.Type === type);

  const transformed = allByType.map((v) => {
    const comment = v.Comments ? ` (${v.Comments})` : '';

    return {
      value: v.Subtag,
      label: `${v.Description}${comment}`,
    };
  });

  // eslint-disable-next-line no-console
  console.log(`Total number of ${type} ${transformed.length} records`);

  let oldFileContent: string;
  try {
    oldFileContent = fs.readFileSync(fileName, 'utf8');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`File ${fileName} does not exist`, error);
  }
  const newFileContent = JSON.stringify(transformed, undefined, 2);

  if (oldFileContent !== undefined && oldFileContent === newFileContent) {
    // eslint-disable-next-line no-console
    console.log(`${fileName} is up to date`);
    return;
  }

  fs.writeFileSync(fileName, newFileContent);
  // eslint-disable-next-line no-console
  console.log(`Created new ${type}.json`);
}

async function generate() {
  const ianaOrgUrl =
    'http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry';

  const response = await fetch(ianaOrgUrl);
  const responseText = await response.text();

  const parsedLanguages = responseText
    .split('%%')
    // skip first element
    .slice(1)
    .map((language) => {
      const objects = language
        .split('\n')
        .filter((v) => v !== '')
        // eslint-disable-next-line unicorn/no-array-reduce
        .reduce((acc, val) => {
          if (val.startsWith(`  `)) {
            const last = acc.pop();
            acc.push(`${last} ${val}`);
            return acc;
          } else {
            acc.push(val);
            return acc;
          }
        }, [] as Array<string>);
      // eslint-disable-next-line unicorn/no-array-reduce
      return objects.reduce(
        (acc, val) => {
          try {
            const [k, ...remaining] = val.split(':');

            const remainingTrimmedFirst = [
              remaining[0].trim(),
              ...remaining.slice(1),
            ];

            // eslint-disable-next-line security/detect-object-injection
            acc[k.trim()] = remainingTrimmedFirst.join(':').trim();
            return acc;
          } catch {
            throw new Error(`Error parsing value: ${language}`);
          }
        },
        {} as Record<string, string>,
      );
    });

  // eslint-disable-next-line no-console
  console.log(`Extracted ${parsedLanguages.length} records`);

  const allRecordsWithoutDeprecated = parsedLanguages.filter(
    (v) => v.Deprecated === undefined,
  );

  // eslint-disable-next-line no-console
  console.log(
    `Total number of languages without deprecated ${allRecordsWithoutDeprecated.length} records`,
  );

  for (const type of ['language', 'region']) {
    processType(type, allRecordsWithoutDeprecated);
  }
}

(async () => {
  await generate();
})();

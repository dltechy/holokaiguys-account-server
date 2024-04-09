const { ESLint } = require('eslint');
const fs = require('fs');
const path = require('path');

const getFilesToLint = async (files) => {
  const eslintCli = new ESLint();

  const isFileIgnored = await Promise.all(
    files.map((file) => {
      return eslintCli.isPathIgnored(file);
    }),
  );

  const filteredFiles = files.filter((_, index) => !isFileIgnored[index]);
  return filteredFiles.join(' ');
};

const createTsConfig = (files) => {
  const srcPath = `${path.resolve(__dirname, 'src')}/`;

  const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json'));
  tsconfig.include = files.filter(
    (file) => file.startsWith(srcPath) && file.endsWith('.ts'),
  );

  if (tsconfig.include.length > 0) {
    tsconfig.include.push('**/*.d.ts');
  }

  return tsconfig;
};

module.exports = {
  '*.{js,ts}': async (files) => {
    const filesToLint = await getFilesToLint(files);
    if (filesToLint.length > 0) {
      const output = [];

      output.push(`prisma generate`);
      output.push(`eslint --max-warnings=0 --fix ${filesToLint}`);

      const tsconfig = createTsConfig(files);
      if (tsconfig.include.length > 0) {
        fs.writeFileSync('tsconfig.lintstaged.json', JSON.stringify(tsconfig));
        output.push(`tsc --project tsconfig.lintstaged.json --noEmit`);
      }
      output.push('rimraf tsconfig.lintstaged.json');

      output.push(`jest --clearCache`);
      output.push(
        `dotenv -e .env.test -- jest --passWithNoTests --findRelatedTests ${filesToLint}`,
      );

      return output;
    }
    return [];
  },
};

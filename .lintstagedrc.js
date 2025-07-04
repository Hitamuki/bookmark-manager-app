// 除外対象のディレクトリ
const EXCLUDED_DIRS = ['poc', 'sandbox'];

const shouldInclude = (filePath) => {
  // 絶対パスから相対パスに変換
  const relativePath = filePath.replace(`${process.cwd()}/`, '');

  const shouldIncludeFile = !EXCLUDED_DIRS.some(
    (excludedDir) => relativePath.startsWith(`${excludedDir}/`) || relativePath === excludedDir,
  );

  return shouldIncludeFile;
};

module.exports = {
  '**/*.md': (files) =>
    files
      .filter(shouldInclude)
      .flatMap((file) => [`markdownlint-cli2 ${file}`, `markdown-link-check ${file}`, `textlint ${file}`]),
  '*.{ts,tsx,js,jsx,mjs,cjs}': (files) =>
    files
      .filter(shouldInclude)
      .flatMap((file) => [`biome format --write ${file}`, `biome lint ${file}`, `markuplint ${file}`]),
  '*.html': (files) =>
    files.filter(shouldInclude).flatMap((file) => [`prettier --write ${file}`, `markuplint ${file}`]),
  '*.css': (files) =>
    files
      .filter(shouldInclude)
      .flatMap((file) => [`biome format --write ${file}`, `stylelint ${file}`, `biome lint ${file}`]),
  '*.scss': (files) => files.filter(shouldInclude).flatMap((file) => [`prettier --write ${file}`, `stylelint ${file}`]),
  '*.{json,jsonc}': (files) => files.filter(shouldInclude).map((file) => `biome format --write ${file}`),
  '*.{yml,yaml,toml}': (files) => files.filter(shouldInclude).map((file) => `prettier --write ${file}`),
};

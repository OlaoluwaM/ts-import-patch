import chalk from 'chalk';
import fsPromise from 'fs/promises';

export function getBuildDirFromArgs() {
  const args = process.argv.slice(2);
  return args[0];
}

export async function grabFileContents(files) {
  const fileContentPromises = files.map(filepath =>
    fsPromise.readFile(filepath, 'utf-8')
  );

  const fileContents = await Promise.all(fileContentPromises);
  return fileContents;
}

export async function overwriteFile(path, fileContents) {
  return fsPromise.writeFile(path, fileContents);
}

export function info(msg) {
  console.log(chalk.whiteBright.bold(msg));
}

export function error(msg) {
  console.log(chalk.redBright.bold(msg));
}

export async function doesDistFolderExist() {
  try {
    const stat = await fsPromise.stat(`./${BUILD_DIR}`);
    return stat;
  } catch (error) {
    throw new Error(
      `Looks like the ./${BUILD_DIR} directory is not available. Try running the build command \`npm run build\` first`
    );
  }
}

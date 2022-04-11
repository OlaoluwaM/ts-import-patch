#!/usr/bin/env node

import { globby } from 'globby';
import {
  info,
  error,
  overwriteFile,
  grabFileContents,
  doesDistFolderExist,
  getBuildDirFromArgs,
} from './utils.mjs';

// LOA
// Lang Features --> generic helpers --> specific helpers --> specific business logic

async function main() {
  const IS_TEST_ENV = process.env.NODE_ENV === 'test';

  if (IS_TEST_ENV) return;
  await patchCompiledJSImports();
}

async function patchCompiledJSImports() {
  const jsFilePathArr = await grabAllCompiledJSFiles();
  const jsFilesContentArr = await grabFileContents(jsFilePathArr);
  const updatedJsFileContents = updateCompiledJsImports(jsFilesContentArr);

  await overwriteCompiledJsFiles(jsFilePathArr, updatedJsFileContents);
}

async function grabAllCompiledJSFiles() {
  const BUILD_DIR = getBuildDirFromArgs();
  if (!BUILD_DIR) {
    error('Please specify the target directory as the first argument');
    process.exit(1);
  }

  await doesDistFolderExist();
  const compiledJsFiles = globby(`${BUILD_DIR}/**/*.js`);

  return compiledJsFiles;
}

async function overwriteCompiledJsFiles(filePaths, updatedFileContents) {
  const saveFilePromises = filePaths.map((filepath, ind) =>
    overwriteFile(filepath, updatedFileContents[ind])
  );

  return Promise.all(saveFilePromises);
}

function updateCompiledJsImports(jsFileContentArr) {
  const updatedJsFileContents = jsFileContentArr.map(updateImportStatements);
  info('Imports successfully updated with `.js` extension');

  return updatedJsFileContents;
}

export default function updateImportStatements(jsFileContent) {
  const JS_IMPORT_STATEMENT_REGEX =
    /import([ \n\t]*(?:[^ \n\t{}]+[ \n\t]*,?)?(?:[ \n\t]*{(?:[ \n\t]*[^ \n\t"'{}]+[ \n\t]*,?)+})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/gm;

  const patchedFileContent = jsFileContent.replace(
    JS_IMPORT_STATEMENT_REGEX,
    updateImportStatement
  );

  return patchedFileContent;
}

function updateImportStatement(importStatementStr) {
  const isStatementSafeToPatch = shouldPatch(importStatementStr);
  if (!isStatementSafeToPatch) return importStatementStr;

  const substringWithoutLastQuote = importStatementStr.substring(
    0,
    importStatementStr.length - 1
  );

  const indexOfLastQuote = -1;
  const lastQuote = importStatementStr.slice(indexOfLastQuote);

  return `${substringWithoutLastQuote}.js${lastQuote}`;
}

function shouldPatch(importStatementStr) {
  const RELATIVE_PATH_REGEX = /\.\.\/|\.\//;
  const isRelativeImport = RELATIVE_PATH_REGEX.test(importStatementStr);

  const containsJsExtension = importStatementStr.includes('.js');
  if (!isRelativeImport || containsJsExtension) return false;

  return true;
}

await main();

#!/usr/bin/env node

import url from 'url';

import { globby } from 'globby';
import {
  info,
  overwriteFile,
  grabFileContents,
  doesDistFolderExist,
  getBuildDirFromArgs,
} from './utils.mjs';

// LOA
// Lang Features --> generic helpers --> specific helpers --> specific business logic

const BUILD_DIR = getBuildDirFromArgs();

async function patchCompiledJSImports() {
  const jsFilePathArr = await grabAllCompiledJSFiles();
  const jsFilesContentArr = await grabFileContents(jsFilePathArr);
  const updatedJsFileContents = updateCompiledJsImports(jsFilesContentArr);

  await overwriteCompiledJsFiles(jsFilePathArr, updatedJsFileContents);
}

async function grabAllCompiledJSFiles() {
  await doesDistFolderExist();
  return globby(`${BUILD_DIR}/**/*.js`);
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

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  if (!BUILD_DIR) {
    throw new Error(
      'Please specify the target directory as the first argument'
    );
  }
  await patchCompiledJSImports();
}

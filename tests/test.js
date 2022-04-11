import updateImportStatements from '../src/index.mjs';

describe('Tests for compiled JS import statement patch', () => {
  const cases = [
    [
      'formatted',
      `
    import "zx/globals"
    import path from "path"

    import { chalk } from "zx"
    import { fsPromise } from 'fs/promises'

    import { fff } from "../sss"
    import { fff } from "../../sff"
    import { fff } from "../../../sff.js"

    import { fff } from "../sss.js"
    import { fff } from "../../sff.js"
    import { fff } from "../../../sff"

    import { fao } from "baz.js"
    import { far } from "url"
    import { foo } from "some"

    import ascii from "./sff"
    import bar from 'foo'
    import * from "aa"
    `,
      `
    import "zx/globals"
    import path from "path"

    import { chalk } from "zx"
    import { fsPromise } from 'fs/promises'

    import { fff } from "../sss.js"
    import { fff } from "../../sff.js"
    import { fff } from "../../../sff.js"

    import { fff } from "../sss.js"
    import { fff } from "../../sff.js"
    import { fff } from "../../../sff.js"

    import { fao } from "baz.js"
    import { far } from "url"
    import { foo } from "some"

    import ascii from "./sff.js"
    import bar from 'foo'
    import * from "aa"
    `,
    ],
    [
      'not formatted',
      `
    import "zx/globals"import path from "path"import { chalk } from "zx"import { fsPromise } from 'fs/promises'
    import { fff } from "../sss"import { fff } from "../../sff" import { fff } from "../../../sff.js"import { fff } from "../sss.js"
    import { fff } from "../../sff.js"import { fff } from "../../../sff"import { fao } from "baz.js" import { far } from "url"
    import { foo } from "some" import ascii from "./sff"import bar from 'foo' import * from "aa"
    `,
      `
    import "zx/globals"import path from "path"import { chalk } from "zx"import { fsPromise } from 'fs/promises'
    import { fff } from "../sss.js"import { fff } from "../../sff.js" import { fff } from "../../../sff.js"import { fff } from "../sss.js"
    import { fff } from "../../sff.js"import { fff } from "../../../sff.js"import { fao } from "baz.js" import { far } from "url"
    import { foo } from "some" import ascii from "./sff.js"import bar from 'foo' import * from "aa"
    `,
    ],
    [
      'not formatted',
      `
    import "zx/globals"import { fao } from "baz.js"import { far } from "url"import { foo } from "some"
    import bar from '../foo'import * from "aa"`,
      `
    import "zx/globals"import { fao } from "baz.js"import { far } from "url"import { foo } from "some"
    import bar from '../foo.js'import * from "aa"`,
    ],
  ];
  test.each(cases)(
    'Should make sure that regex can be used to make desired TS import correction %s',
    (str, sampleImports, desiredOutput) => {
      // Act
      const output = updateImportStatements(sampleImports);

      // Assert
      expect(output).toBe(desiredOutput);
    }
  );
});

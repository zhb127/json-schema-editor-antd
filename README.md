# @zhb127/json-schema-editor-antd

[![NPM version](https://img.shields.io/npm/v/@zhb127/json-schema-editor-antd.svg?style=flat)](https://npmjs.org/package/@zhb127/json-schema-editor-antd)
[![NPM downloads](http://img.shields.io/npm/dm/@zhb127/json-schema-editor-antd.svg?style=flat)](https://npmjs.org/package/@zhb127/json-schema-editor-antd)
![License](https://img.shields.io/badge/license-MIT-000000.svg)

[Antd Design](https://ant.design/) 风格的 Json Schema 可视化编辑器。

## Usage

```shell
npm install @zhb127/json-schema-editor-antd
```

```jsx
import { useState } from 'react';
import JsonSchemaEditor from '@zhb127/json-schema-editor-antd';

export default () => {
  const [jsonSchema, setJsonSchema] = useState();
  return (
    <JsonSchemaEditor
      data={jsonSchema}
      onChange={(data) => {
        setJsonSchema(data);
      }}
    />
  );
};
```

## Development

```bash
# install dependencies
$ pnpm install

# develop library by docs demo
$ pnpm start

# build library source code
$ pnpm run build

# build library source code in watch mode
$ pnpm run build:watch

# build docs
$ pnpm run docs:build

# Locally preview the production build.
$ pnpm run docs:preview

# check your project for potential problems
$ pnpm run doctor
```

## LICENSE

MIT

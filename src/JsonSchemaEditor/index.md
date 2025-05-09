# JsonSchemaEditor

- 1.x.x 版本的代码已完全重构。
- 需要与 [json-schema-editor-visual](https://github.com/Open-Federation/json-schema-editor-visual) UI 布局类似的组件，可以使用
  `0.x.x` 版本。

```shell
yarn add @zhb127/json-schema-editor-antd
```

正常使用：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';

export default () => <JsonSchemaEditor />;
```

root schema 不可改变：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';

export default () => <JsonSchemaEditor rootSchemaImmutable />;
```

针对导入的 schema 进行校验：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';

export default () => (
  <JsonSchemaEditor
    importSchemaValidate={(schema) => {
      if (schema.type !== 'object') {
        alert('root schema 必须是 object 类型');
        return false;
      }
    }}
  />
);
```

## Notice

组件中的 JSON 编辑器用的是加载 cdn 的方式，离线使用需添加 [monaco-editor](https://github.com/microsoft/monaco-editor)

```shell
yarn add monaco-editor
```

加载 monaco-editor

```jsx ｜ pure
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

loader.config({ monaco });
```

## API

### onChange

JsonSchema 变更的回调。

类型：`(schema: JSONSchema7) => void`

默认值： `-`

### data

初始化组件数据。

类型：`JSONSchema7 | string | undefined`

默认值：

```json
{
  "type": "object",
  "properties": {
    "field": {
      "type": "string"
    }
  }
}
```

### handleAdvancedSettingClick

点击`高级设置`按钮的回调，返回`false`：不使用默认表单，返回`true`：使用默认表单。

类型：`(namePath: number[], schema: JSONSchema7, propertyName?: string) => boolean`

默认值：`-`

说明：可以结合`组件引用`实现点击高级设置按钮后获取路径下的 JsonSchema，添加、修改自定义字段等，然后修改指定路径下的 JsonSchema。

## 组件引用（ref）

```ts
export interface JsonSchemaEditorHandle {
  /* 更新指定路径下的 JsonSchema */
  changeSchema: (namePath: number[], value: any, propertyName?: string) => void;
}
```

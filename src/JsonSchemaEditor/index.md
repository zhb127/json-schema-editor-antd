# JsonSchemaEditor

- 1.x.x 版本的代码已完全重构。
- 需要与 [json-schema-editor-visual](https://github.com/Open-Federation/json-schema-editor-visual) UI 布局类似的组件，可以使用
  `0.x.x` 版本。

```shell
yarn add @zhb127/json-schema-editor-antd
```

初始化数据：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';

export default () => <JsonSchemaEditor />;
```

覆盖初始化数据：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';

export default () => (
  <JsonSchemaEditor
    value={{
      type: 'object',
      properties: {
        field_0: {
          type: 'string',
          title: '名称',
        },
        field_1: {
          type: 'string',
          title: 'abc',
        },
      },
    }}
    onSchemaChange={(schema) => {
      console.log(schema);
    }}
  />
);
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

更新 schema：

```jsx
import { JsonSchemaEditor } from '@zhb127/json-schema-editor-antd';
import { Button } from 'antd';
import { useRef } from 'react';

export default () => {
  const ref = useRef();
  return (
    <>
      <JsonSchemaEditor
        ref={ref}
        value={{
          type: 'object',
          properties: {
            field_0: {
              type: 'string',
              title: '名称',
            },
            field_1: {
              type: 'string',
              title: 'abc',
            },
          },
        }}
        onSchemaChange={(schema) => {
          console.log(schema);
        }}
      />
      <Button
        onClick={() => {
          ref.current?.updateSchema([1, 0], {
            type: 'string',
            title: '修改成功',
          });
        }}
      >
        按钮
      </Button>
    </>
  );
};
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

类型：`(schema: JSONSchema) => void`

默认值： `-`

### data

初始化组件数据。

类型：`JSONSchema | string | undefined`

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

类型：`(namePath: number[], schema: JSONSchema, propertyName?: string) => boolean`

默认值：`-`

说明：可以结合`组件引用`实现点击高级设置按钮后获取路径下的 JsonSchema，添加、修改自定义字段等，然后修改指定路径下的 JsonSchema。

### 国际化

支持 antd 的 ConfigureProvider。

```ts
// 支持扩展或覆盖默认语言配置
registerLocale('zh-cn', {
  PropertyPlaceholder: '请输入属性名称',
  // ...
});
```

## 组件引用（ref）

```ts
export interface JsonSchemaEditorHandle {
  /* 更新指定路径下的 JsonSchema，不会触发 onSchemaChange 事件 */
  changeSchema: (namePath: number[], value: any, propertyName?: string) => void;
}
```

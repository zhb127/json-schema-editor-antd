import { Empty } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { addProperty, initSchema, removeProperty, renameProperty, updateRequiredProperty, updateSchema } from './funcs';
import SchemaItem from './SchemaItem';
import { SchemaEditorProps } from './types';

export interface JsonSchemaEditorHandle {
  updateSchema: (propPath: number[], value: any, keyword?: string) => void;
}

const JsonSchemaEditor = forwardRef<JsonSchemaEditorHandle, SchemaEditorProps>((props, ref) => {
  const [schema, setSchema] = useState(initSchema(props.value));

  useImperativeHandle(ref, () => ({
    updateSchema: (propPath: number[], value: any, keyword?: string) => {
      const finalSchema = updateSchema(schema, propPath, value, keyword);
      if (finalSchema) {
        setSchema(finalSchema);
      }
    },
  }));

  return (
    <div style={{ ...props.style }}>
      {schema ? (
        <SchemaItem
          schema={schema}
          changeSchema={(propPath, value, keyword) => {
            const finalSchema = updateSchema(schema, propPath, value, keyword);
            if (finalSchema) {
              setSchema(finalSchema);
              props.onSchemaChange?.(finalSchema);
            }
          }}
          renameProperty={(propPath, newPropName) => {
            const finalSchema = renameProperty(schema, propPath, newPropName);
            if (finalSchema) {
              setSchema(finalSchema);
              props.onSchemaChange?.(finalSchema);
            }
          }}
          removeProperty={(propPath) => {
            const finalSchema = removeProperty(schema, propPath);
            if (finalSchema) {
              setSchema(finalSchema);
              props.onSchemaChange?.(finalSchema);
            }
          }}
          addProperty={(propPath, isAddingChild) => {
            const finalSchema = addProperty(schema, propPath, isAddingChild);
            setSchema(finalSchema);
            props.onSchemaChange?.(finalSchema);
          }}
          updateRequiredProperty={(namePath, required) => {
            const finalSchema = updateRequiredProperty(schema, namePath, required);
            if (finalSchema) {
              setSchema(finalSchema);
              props.onSchemaChange?.(finalSchema);
            }
          }}
          handleAdvancedSettingClick={props.handleAdvancedSettingClick}
          disabled={props.disabled}
          immutable={props.rootSchemaImmutable}
          importSchemaValidate={props.importSchemaValidate}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
});

export default JsonSchemaEditor;

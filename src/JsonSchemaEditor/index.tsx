import { Empty } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  addProperty,
  initSchema,
  removeProperty,
  renameProperty,
  updateRequiredProperty,
  updateSchema,
} from './funcs';
import SchemaItem from './SchemaItem';
import { SchemaEditorProps } from './types';

export interface JsonSchemaEditorHandle {
  updateSchema: (namePath: number[], value: any, keyword?: string) => void;
}

const JsonSchemaEditor = forwardRef<JsonSchemaEditorHandle, SchemaEditorProps>(
  (props, ref) => {
    const [schema, setSchema] = useState(initSchema(props.value));

    useImperativeHandle(ref, () => ({
      updateSchema: (namePath: number[], value: any, keyword?: string) => {
        const finalSchema = updateSchema(schema, namePath, value, keyword);
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
            changeSchema={(namePath, value, keyword) => {
              const finalSchema = updateSchema(
                schema,
                namePath,
                value,
                keyword,
              );
              if (finalSchema) {
                setSchema(finalSchema);
                props.onSchemaChange?.(finalSchema);
              }
            }}
            renameProperty={(namePath, newPropName) => {
              const finalSchema = renameProperty(schema, namePath, newPropName);
              if (finalSchema) {
                setSchema(finalSchema);
                props.onSchemaChange?.(finalSchema);
              }
            }}
            removeProperty={(namePath) => {
              const finalSchema = removeProperty(schema, namePath);
              if (finalSchema) {
                setSchema(finalSchema);
                props.onSchemaChange?.(finalSchema);
              }
            }}
            addProperty={(namePath, isAddingChild) => {
              const finalSchema = addProperty(schema, namePath, isAddingChild);
              setSchema(finalSchema);
              props.onSchemaChange?.(finalSchema);
            }}
            updateRequiredProperty={(namePath, required) => {
              const finalSchema = updateRequiredProperty(
                schema,
                namePath,
                required,
              );
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
  },
);

export default JsonSchemaEditor;

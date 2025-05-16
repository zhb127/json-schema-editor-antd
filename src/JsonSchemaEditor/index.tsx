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
  updateSchema: (propPath: number[], value: any, keyword?: string) => void;
}

const JsonSchemaEditor = forwardRef<JsonSchemaEditorHandle, SchemaEditorProps>(
  (props, ref) => {
    // const [schema, setSchema] = useState<JSONSchema>({
    //   type: 'object', properties: {
    //     'objectP': {type: 'object', properties: {'o1numberP': {type: 'number'}}},
    //     'numberP': {type: 'number'},
    //     'booleanP': {type: 'boolean'},
    //     'arrayString': {type: 'array', items: {type: 'string'}},
    //     'arrayObject': {type: 'array', items: {type: 'object', properties: {'arrayObjStr': {type: 'string'}}}},
    //     'integerP': {type: 'integer'},
    //     'stringP': {type: 'string'},
    //   }
    // })

    const [schema, setSchema] = useState(initSchema(props.value));

    useImperativeHandle(ref, () => ({
      updateSchema: (namePath: number[], value: any, propertyName?: string) => {
        const schemaNew = updateSchema(schema, namePath, value, propertyName);
        if (schemaNew) {
          setSchema(schemaNew);
        }
      },
    }));

    return (
      <div style={{ ...props.style }}>
        {schema ? (
          <SchemaItem
            schema={schema}
            changeSchema={(namePath, value, propertyName) => {
              const schemaNew = updateSchema(
                schema,
                namePath,
                value,
                propertyName,
              );
              if (schemaNew) {
                setSchema(schemaNew);
                props.onSchemaChange?.(schemaNew);
              }
            }}
            renameProperty={(namePath, newName) => {
              const schemaNew = renameProperty(schema, namePath, newName);
              if (schemaNew) {
                setSchema(schemaNew);
                props.onSchemaChange?.(schemaNew);
              }
            }}
            removeProperty={(namePath) => {
              const schemaNew = removeProperty(schema, namePath);
              if (schemaNew) {
                setSchema(schemaNew);
                props.onSchemaChange?.(schemaNew);
              }
            }}
            addProperty={(path, isAddingChild) => {
              const schemaNew = addProperty(schema, path, isAddingChild);
              setSchema(schemaNew);
              props.onSchemaChange?.(schemaNew);
            }}
            updateRequiredProperty={(namePath, required) => {
              const schemaNew = updateRequiredProperty(
                schema,
                namePath,
                required,
              );
              if (schemaNew) {
                setSchema(schemaNew);
                props.onSchemaChange?.(schemaNew);
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

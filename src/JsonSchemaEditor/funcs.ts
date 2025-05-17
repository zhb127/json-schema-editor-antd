import _ from 'lodash';
import { JSONSchema } from './types';
import { getDefaultSchema, getValueByPath, inferSchema } from './utils';

// 初始化 Schema
export function initSchema(data: string | undefined | JSONSchema): JSONSchema {
  const defaultSchema: JSONSchema = {
    type: 'object',
    properties: {
      field_demo: { type: 'string' },
    },
  };

  if (!data) {
    return defaultSchema;
  }

  switch (typeof data) {
    case 'string':
      try {
        return inferSchema(JSON.parse(data));
      } catch (e) {
        console.warn('初始化数据不是 Json 字符串，无法生成 JsonSchema');
        return defaultSchema;
      }
    case 'object':
      return data;
  }
}

// 更新 Schema
export function updateSchema(
  schema: JSONSchema,
  namePath: number[],
  value: any,
  keyword?: string, // 是针对 property 的哪个 keyword 进行更新
): JSONSchema | undefined {
  // 修改的是根节点
  if (namePath.length === 0) {
    return value;
  }

  let schemaClone = _.cloneDeep(schema);
  let current: any = schemaClone;
  for (let i = 0; i < namePath.length - 1; i++) {
    const key = Object.keys(current)[namePath[i]];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  const lastKey = namePath[namePath.length - 1];
  const lastKeyActual = Object.keys(current)[lastKey];
  if (lastKey === -1) {
    if (typeof value === 'undefined' || !keyword) {
      return;
    }
    current[keyword] = value;
  } else {
    if (current[lastKeyActual] === value) {
      return;
    }
    current[lastKeyActual] = value;
  }

  return schemaClone;
}

// 重命名属性
export function renameProperty(
  schema: JSONSchema,
  namePath: number[],
  newPropName: string,
): JSONSchema | undefined {
  let schemaClone = _.cloneDeep(schema);
  let current: any = schemaClone;
  let parent: any = null;
  let lastKey: string | number = '';

  for (let i = 0; i < namePath.length - 1; i++) {
    const keys = Object.keys(current);
    let index: number;
    if (typeof namePath[i] === 'number') {
      index = namePath[i] as number;
    } else {
      index = keys.indexOf(String(namePath[i]));
    }
    if (index < 0 || index >= keys.length) {
      console.error(`Path not found: ${namePath.slice(0, i + 1).join('.')}`);
      return;
    }
    parent = current;
    lastKey = keys[index];
    current = current[lastKey];
  }

  const oldPropNameIndex = namePath[namePath.length - 1];
  const propNames = Object.keys(current);
  if (propNames.indexOf(newPropName) > -1) {
    return;
  }

  const oldPropName = propNames[oldPropNameIndex];
  if (oldPropName === newPropName) {
    return;
  }

  if (current.hasOwnProperty(oldPropName)) {
    parent[lastKey] = Object.fromEntries(
      Object.entries(current).map(([key, value]) => {
        if (key === oldPropName) {
          const parentRequired = parent['required'];
          if (parentRequired) {
            const requiredIndex = parentRequired.indexOf(oldPropName);
            if (requiredIndex >= 0) {
              parentRequired.splice(requiredIndex, 1, newPropName);
            }
          }
          return [newPropName, value];
        }
        return [key, value];
      }),
    );
  } else {
    console.error(`OldPropertyName not found: ${oldPropName}`);
    return;
  }

  return schemaClone;
}

// 更新必选属性
function updateRequired(target: any, propName: string, remove: boolean) {
  if (!target.required) {
    target.required = [];
  }

  const index = target.required.indexOf(propName);
  if (remove) {
    if (index !== -1) {
      target.required.splice(index, 1);
    }
  } else {
    if (index === -1) {
      target.required.push(propName);
    }
  }

  if (target.required.length === 0) {
    delete target.required;
  }
}

// 更新必选属性
export function updateRequiredProperty(
  schema: JSONSchema,
  namePath: number[],
  removed: boolean,
): JSONSchema | undefined {
  if (namePath.length < 2) {
    console.error('路径长度不足，无法更新必选属性');
    return;
  }

  let schemaClone = _.cloneDeep(schema);

  const parentPath = namePath.slice(0, -2);
  const propertyIndex = namePath[namePath.length - 1];

  const parentObject = getValueByPath(schemaClone, parentPath);
  if (!parentObject || !parentObject.properties) {
    console.error('无法找到必选属性的父级', parentObject);
    return;
  }

  const propertyNames = Object.keys(parentObject.properties);
  if (propertyIndex < 0 || propertyIndex >= propertyNames.length) {
    console.error('属性索引超出范围', propertyIndex);
    return;
  }

  const propertyName = propertyNames[propertyIndex];

  updateRequired(parentObject, propertyName, removed);

  return schemaClone;
}

// 移除属性
export function removeProperty(
  schema: JSONSchema,
  namePath: number[],
): JSONSchema | undefined {
  let schemaClone = _.cloneDeep(schema);

  let current: any = schemaClone;
  let pre: any = schemaClone;

  for (let i = 0; i < namePath.length - 1; i++) {
    if (current !== undefined && current !== null) {
      pre = current;
      current = current[Object.keys(current)[namePath[i]]];
    } else {
      console.error('移除的 property 路径无效', namePath);
      return;
    }
  }

  let finalPropName = Object.keys(current)[namePath[namePath.length - 1]];

  updateRequired(pre, finalPropName, true);

  if (
    current &&
    typeof current === 'object' &&
    current.hasOwnProperty(finalPropName)
  ) {
    delete current[finalPropName];
  }

  return schemaClone;
}

// 添加属性
export function addProperty(
  schema: JSONSchema,
  namePath: number[],
  isAddingChild: boolean,
): JSONSchema {
  let schemaClone = _.cloneDeep(schema);

  let current: any = schemaClone;
  for (let i = 0; i < namePath.length - (isAddingChild ? 0 : 1); i++) {
    const key = Object.keys(current)[namePath[i]];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  if (isAddingChild) {
    current = current['properties'];
  }

  const genNewPropName = (): string => {
    return 'field_' + Math.random().toString(36).slice(2, 6);
  };

  let newPropName = genNewPropName();
  while (current.hasOwnProperty(newPropName)) {
    newPropName = genNewPropName();
    break;
  }

  current[newPropName] = getDefaultSchema('string');

  return schemaClone;
}

import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  ImportOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Dropdown,
  Input,
  Row,
  Select,
  Tooltip,
  message,
  theme,
} from 'antd';
import _ from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { SchemaTypeOptions } from '../consts';
import { useI18n } from '../i18n';
import { JSONSchema } from '../types';
import { getDefaultSchema, getPropertyIndex } from '../utils';
import AdvancedSettingModal from './AdvancedSettingModal';
import ImportModal from './ImportModal';

type SchemaItemProps = {
  propertyName?: string;
  nodeDepth?: number;
  namePath?: number[]; // 字段路径
  isArrayItems?: boolean;
  isRequire?: boolean;
  schema: JSONSchema;
  changeSchema?: (namePath: number[], value: any, keyword?: string) => void;
  renameProperty?: (namePath: number[], newName: string) => void;
  removeProperty?: (namePath: number[]) => void;
  addProperty?: (namePath: number[], isChild: boolean) => void;
  updateRequiredProperty?: (namePath: number[], removed: boolean) => void;
  handleAdvancedSettingClick?: (
    namePath: number[],
    schema: JSONSchema,
    propertyName?: string,
  ) => boolean;

  disabled?: boolean;
  immutable?: boolean;
  importSchemaValidate?: (schema: JSONSchema) => boolean;
};

function SchemaItem(props: SchemaItemProps) {
  const { token } = theme.useToken();
  const { t } = useI18n();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    changeSchema,
    renameProperty,
    isArrayItems,
    updateRequiredProperty,
    removeProperty,
    addProperty,
    isRequire,
    handleAdvancedSettingClick,
  } = props;

  const [schema, setSchema] = useState(props.schema);
  const [propertyName, setPropertyName] = useState(props.propertyName);
  const [nodeDepth, setNodeDepth] = useState(props.nodeDepth ?? 0);
  const [namePath, setNamePath] = useState<number[]>(props.namePath ?? []);
  const [expand, setExpand] = useState(true);
  const [advancedModal, setAdvancedModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const isRoot = typeof propertyName === 'undefined';
  const disabled = props.disabled;
  const immutable = props.immutable;

  useEffect(() => {
    setSchema(props.schema);
  }, [props.schema]);

  useEffect(() => {
    setNamePath(props.namePath ? props.namePath : []);
  }, [props.namePath]);

  useEffect(() => {
    setNodeDepth(props.nodeDepth ? props.nodeDepth : 0);
  }, [props.nodeDepth]);

  const handleDebounce = useCallback(
    _.debounce(
      (callback) => {
        if (typeof callback === 'function') {
          callback();
        } else {
          console.log('Provided argument is not a function');
        }
      },
      300,
      { maxWait: 1000 },
    ),
    [],
  );

  useEffect(() => {
    return () => {
      handleDebounce.cancel();
    };
  }, [handleDebounce]);

  const schemaItems: any = schema.items;
  const addChildItems =
    !!(
      schema.type === 'object' ||
      (isArrayItems && schemaItems?.type === 'object')
    ) &&
    !isArrayItems &&
    !isRoot;

  if (!schema.type) {
    return <></>;
  }

  return (
    <>
      {contextHolder}
      <Row align={'middle'} style={{ paddingBottom: 10 }} gutter={8}>
        <Col flex={'auto'}>
          <Row align={'middle'} wrap={false}>
            <Col flex={`${24 + nodeDepth * 14}px`}>
              <Row justify={'end'}>
                {schema.type === 'object' && (
                  <Button
                    type={'text'}
                    size={'small'}
                    icon={
                      expand ? <CaretDownOutlined /> : <CaretRightOutlined />
                    }
                    onClick={() => setExpand(!expand)}
                    disabled={disabled || immutable}
                  />
                )}
              </Row>
            </Col>
            <Col flex={'auto'}>
              <Input
                status={
                  !isRoot && propertyName.length === 0 ? 'error' : undefined
                }
                disabled={disabled || isRoot || isArrayItems || immutable}
                value={isRoot ? 'root' : propertyName}
                placeholder={t('PropertyPlaceholder')}
                onBlur={() => {
                  if (propertyName?.length === 0) {
                    messageApi.warning(t('PropertyNameEmptyWarnMsg')).then();
                    return;
                  }
                  if (
                    renameProperty &&
                    propertyName &&
                    propertyName?.length !== 0
                  ) {
                    renameProperty(namePath, propertyName);
                  }
                }}
                onChange={(name) => setPropertyName(name.target.value)}
              />
            </Col>
          </Row>
        </Col>
        <Col flex={'16px'}>
          <Checkbox
            disabled={disabled || isArrayItems || isRoot || immutable}
            checked={isRequire}
            onChange={(e) => {
              if (updateRequiredProperty && propertyName) {
                updateRequiredProperty(namePath, !e.target.checked);
              }
            }}
          />
        </Col>
        <Col flex={'95px'}>
          <Select
            disabled={disabled || immutable}
            style={{ width: '95px' }}
            value={schema.type}
            options={SchemaTypeOptions}
            onChange={(type) => {
              if (changeSchema) {
                changeSchema(namePath, getDefaultSchema(type), 'type');
              }
            }}
          />
        </Col>
        <Col span={5}>
          <Input
            disabled={disabled || immutable}
            placeholder={t('TitlePlaceholder')}
            value={schema.title}
            onChange={(e) => {
              if (changeSchema) {
                changeSchema(
                  namePath.concat(getPropertyIndex(schema, 'title')),
                  e.target.value,
                  'title',
                );
              }
            }}
          />
        </Col>
        <Col span={6}>
          <Input
            disabled={disabled || immutable}
            placeholder={t('DescriptionPlaceholder')}
            value={schema.description}
            onChange={(e) => {
              if (changeSchema) {
                changeSchema(
                  namePath.concat(getPropertyIndex(schema, 'description')),
                  e.target.value,
                  'description',
                );
              }
            }}
          />
        </Col>
        <Col flex={'72px'}>
          <Row style={{ width: '72px' }}>
            {!immutable && (
              <Tooltip title={t('AdvancedSettings')}>
                <Button
                  disabled={disabled}
                  type={'text'}
                  size={'small'}
                  icon={<SettingOutlined />}
                  style={{ color: 'green' }}
                  onClick={() => {
                    if (
                      handleAdvancedSettingClick &&
                      !handleAdvancedSettingClick(
                        namePath,
                        schema,
                        isRoot || schema.type === 'object'
                          ? undefined
                          : propertyName,
                      )
                    ) {
                      return;
                    }
                    setAdvancedModal(!advancedModal);
                  }}
                />
              </Tooltip>
            )}
            {(!isRoot && !isArrayItems) || schema.type === 'object' ? (
              <Dropdown
                disabled={disabled || !addChildItems}
                placement="bottom"
                menu={{
                  items: [
                    {
                      key: 'addNode',
                      label: t('SiblingNodes'),
                      onClick: () => {
                        if (addProperty) {
                          addProperty(namePath, false);
                        }
                      },
                    },
                    {
                      key: 'addChildNode',
                      label: t('ChildNodes'),
                      onClick: () => {
                        if (addProperty) {
                          addProperty(namePath, true);
                        }
                      },
                    },
                  ],
                }}
              >
                <Tooltip title={!addChildItems && t('AddNode')}>
                  <Button
                    disabled={disabled}
                    type={'text'}
                    size={'small'}
                    icon={<PlusOutlined />}
                    style={{ color: token.colorPrimary }}
                    onClick={() => {
                      if (addChildItems) {
                        return;
                      }
                      if (addProperty) {
                        addProperty(namePath, !(!isArrayItems && !isRoot));
                      }
                    }}
                  />
                </Tooltip>
              </Dropdown>
            ) : (
              <div style={{ width: '24px' }} />
            )}
            <Col flex={'24px'}>
              {isRoot && (
                <Tooltip title={t('ImportJson')}>
                  <Button
                    disabled={disabled}
                    type={'text'}
                    size={'small'}
                    icon={<ImportOutlined />}
                    style={{ color: 'purple' }}
                    onClick={() => setImportModal(true)}
                  />
                </Tooltip>
              )}

              {!isRoot && !isArrayItems && (
                <Tooltip title={t('DeleteNode')}>
                  <Button
                    disabled={disabled}
                    danger
                    type={'text'}
                    size={'small'}
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      if (removeProperty) {
                        removeProperty(namePath);
                      }
                    }}
                  />
                </Tooltip>
              )}
            </Col>
            {isRoot && schema.type !== 'object' && (
              <Col flex={'24px'}>
                {!isArrayItems && <div style={{ width: '24px' }} />}
              </Col>
            )}
          </Row>
        </Col>
      </Row>
      {schema.type === 'object' &&
        expand &&
        schema.properties &&
        Object.keys(schema.properties).map((name) => {
          if (schema.properties) {
            return (
              <div key={String(name)}>
                <SchemaItem
                  {...props}
                  isRequire={schema.required?.includes(name)}
                  isArrayItems={false}
                  nodeDepth={nodeDepth + 1}
                  namePath={namePath.concat(
                    getPropertyIndex(schema, 'properties'),
                    getPropertyIndex(schema.properties, name),
                  )}
                  propertyName={name}
                  schema={schema.properties[name] as JSONSchema}
                  handleAdvancedSettingClick={handleAdvancedSettingClick}
                  immutable={false}
                  importSchemaValidate={undefined}
                />
              </div>
            );
          }
          return <></>;
        })}
      {schema.type === 'array' && expand && (
        <SchemaItem
          {...props}
          isRequire={false}
          isArrayItems={true}
          nodeDepth={nodeDepth + 1}
          propertyName={'items'}
          namePath={namePath.concat(getPropertyIndex(schema, 'items'))}
          schema={schema.items as JSONSchema}
          handleAdvancedSettingClick={handleAdvancedSettingClick}
          immutable={false}
          importSchemaValidate={undefined}
        />
      )}

      <AdvancedSettingModal
        schema={schema}
        open={advancedModal}
        onOk={(newSchema) => {
          if (newSchema.type === 'array' && !newSchema.items) {
            newSchema.items = getDefaultSchema('string');
          }

          if (!changeSchema) {
            return;
          }

          if (isRoot || schema.type === 'object') {
            changeSchema(namePath, { ...newSchema });
            setAdvancedModal(false);
            return;
          }

          changeSchema(namePath, { ...newSchema }, propertyName);
          setAdvancedModal(false);
        }}
        onCancel={() => setAdvancedModal(false)}
      />

      <ImportModal
        open={importModal}
        onOk={(newSchema) => {
          if (props.importSchemaValidate) {
            const isValid = props.importSchemaValidate(newSchema);
            if (!isValid) {
              return;
            }
          }
          if (changeSchema) {
            changeSchema([], newSchema);
            setImportModal(false);
          }
        }}
        onCancel={() => setImportModal(false)}
      />
    </>
  );
}

export default SchemaItem;

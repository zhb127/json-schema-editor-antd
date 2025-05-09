import Ajv from 'ajv';
import { message, Modal, Radio, Row, Typography } from 'antd';
import { compileSchema, draft2020 } from 'json-schema-library';
import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import MonacoEditor from '../MonacoEditor';
import { parseJsonStr, resolveJsonSchemaRef } from '../utils';

type ImportModalProps = {
  open: boolean;
  onOk?: (importValue: any) => void;
  onCancel?: () => void;
};

const ImportModal = (props: ImportModalProps) => {
  const { open, onOk, onCancel } = props;
  const { t } = useI18n();
  const [messageApi, contextHolder] = message.useMessage();
  const [importValue, setImportValue] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState<boolean>();
  const [importType, setImportType] = useState<'json' | 'json-schema'>('json');

  const editorRef = useRef<any>(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  useEffect(() => {
    setModalOpen(open);
  }, [open]);

  function onClose() {
    setModalOpen(false);
    setImportValue(undefined);
    editorRef.current?.setValue('');
    if (onCancel) {
      onCancel();
    }
  }

  return (
    <>
      {contextHolder}
      <Modal
        title={t('Import')}
        width={900}
        open={modalOpen}
        onOk={async () => {
          if (!importValue || importValue.length === 0) {
            messageApi.warning(t('ImportEmptyJsonWarnMsg'));
            return;
          }
          const importObject = parseJsonStr(importValue);
          if (!importObject) {
            messageApi.warning(t('ImportNotJsonWarnMsg'));
            return;
          }
          let schema;
          switch (importType) {
            case 'json':
              schema = compileSchema(draft2020).createSchema(importObject);
              break;
            case 'json-schema':
              schema = await resolveJsonSchemaRef(importObject);
              break;
          }

          if (!schema) {
            messageApi.warning(t('ImportErrorContentWarnMsg'));
            return;
          }

          if (schema.type === undefined) {
            messageApi.error(t('ImportNonRootSchemaWarnMsg'));
            return;
          }

          if (schema.type === 'object' && schema.properties === undefined) {
            schema.properties = {};
          } else if (schema.type === 'array' && schema.items === undefined) {
            schema.items = {
              type: 'string',
            };
          }

          const ajv = new Ajv({ strictSchema: true, allErrors: true });
          if (!ajv.validateSchema(schema)) {
            const errorContent = ajv.errors?.map((val, idx) => {
              let errMsg = `${val.message}`;
              if (val.params) {
                errMsg += `; ${JSON.stringify(val.params)}`;
              }
              return (
                <Row key={idx} justify={'start'}>
                  <Typography.Text code>{val.instancePath}</Typography.Text>
                  {errMsg}
                </Row>
              );
            });
            if ((errorContent?.length || 0) > 0) {
              messageApi.error({
                content: <div>{errorContent}</div>,
              });
            }
            return;
          }

          if (onOk) {
            onOk(schema);
          }
          onClose();
        }}
        onCancel={onClose}
      >
        <Row style={{ marginBottom: 16 }}>
          <Radio.Group
            value={importType}
            optionType="button"
            buttonStyle="solid"
            onChange={(type) => setImportType(type.target.value)}
            options={[
              { value: 'json', label: 'Json' },
              { value: 'json-schema', label: 'JsonSchema' },
            ]}
          />
        </Row>
        <Row>
          <MonacoEditor
            height={390}
            language="json"
            handleEditorDidMount={handleEditorDidMount}
            onChange={(value) => setImportValue(value)}
          />
        </Row>
      </Modal>
    </>
  );
};

export default ImportModal;

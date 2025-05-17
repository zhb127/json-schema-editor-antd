export const StringFormat = [
  { value: 'date-time' },
  { value: 'date' },
  { value: 'time' },
  { value: 'email' },
  { value: 'hostname' },
  { value: 'ipv4' },
  { value: 'ipv6' },
  { value: 'uri' },
  { value: 'regex' },
];

export const SchemaTypes = [
  'string',
  'number',
  'array',
  'object',
  'boolean',
  'integer',
];

export const SchemaTypeOptions = SchemaTypes.map((value) => {
  return { value: value };
});

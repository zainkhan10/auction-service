const schema = {
  type: 'object',
  required: ["queryStringParameters"],
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["OPEN", "CLOSED"],
          default: "OPEN",
        },
      },
    },
  },
};

export default schema;

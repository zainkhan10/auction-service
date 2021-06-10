const schema = {
  type: "object",
  required: ["body"],
  properties: {
    body: {
      type: "object",
      required: ["amount"],
      properties: {
        amount: {
          type: "number",
        },
      },
    },
  },
};

export default schema;

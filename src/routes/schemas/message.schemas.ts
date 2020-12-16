import * as Joi from "@hapi/joi";

// ****
// Validation Joi

const fileSchema = Joi.object({
  bucket: Joi.string(),
  filename: Joi.string(),
}).options({ allowUnknown: true });


export const createPayload = Joi.object({
  attachments: Joi.array().items(fileSchema),
  text: Joi.string().required(),
  conversationId: Joi.string().required(),
  replyTo: Joi.string()
});


export const updatePayload = Joi.object({
  viewed: Joi.boolean(),
});

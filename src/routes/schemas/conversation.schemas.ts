import * as Joi from "@hapi/joi";

// ****
// Validation Joi

const fileSchema = Joi.object({
  bucket: Joi.string(),
  filename: Joi.string(),
}).options({ allowUnknown: true });

export const createPayload = Joi.object({
  participants: Joi.array().items(Joi.string()).required(),
  imageFile: fileSchema,
  title: Joi.string().required(),
})

export const updatePayload = Joi.object({
  imageFile: fileSchema,
  title: Joi.string(),
  pinned: Joi.boolean(),
})

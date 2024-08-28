import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  SOLAPI_API_KEY: Joi.string().required(),
  SOLAPI_API_SECRET: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
  NCOMMERCE_API_URL: Joi.string()
    .required()
    .default('https://api.commerce.naver.com/external'),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().optional(),
  WORKER_USERNAME: Joi.string().required(),
  WORKER_PASSWORD: Joi.string().required(),
  AWS_REGION: Joi.string().required().default('ap-northeast-2'),
  COMMERCE_SQS_QUEUE_URL: Joi.string().required(),
});

export default validationSchema;

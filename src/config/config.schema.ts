import * as Joi from 'joi';

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  SOLAPI_API_KEY: Joi.string().required(),
  SOLAPI_API_SECRET: Joi.string().required(),
  SOLAPI_CHANNEL_GROUP_ID: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
  SMARTSTORE_API_URL: Joi.string()
    .required()
    .default('https://api.commerce.naver.com/external'),
  WORKER_USERNAME: Joi.string().required(),
  WORKER_PASSWORD: Joi.string().required(),
  AWS_REGION: Joi.string().required().default('ap-northeast-2'),
  CONTENT_S3_BUCKET_NAME: Joi.string().required(),
  COMMERCE_SQS_QUEUE_URL: Joi.string().required(),
  NAVER_API_URL: Joi.string()
    .required()
    .default('https://nid.naver.com/oauth2.0'),
  NAVER_CLIENT_ID: Joi.string().required(),
  NAVER_CLIENT_SECRET: Joi.string().required(),
  NAVER_CALLBACK_URL: Joi.string().required(),
  CHANNELTALK_SECRET_KEY: Joi.string().required(),
  PORTONE_API_URL: Joi.string().required(),
  PORTONE_API_KEY: Joi.string().required(),
  PORTONE_CHANNEL_KEY: Joi.string().required(),
  PORTONE_WEBHOOK_SECRET: Joi.string().required(),
  TELEGRAM_BOT_TOKEN: Joi.string().required(),
  TELEGRAM_CHAT_ID: Joi.string().required(),
  KAKAO_API_URL: Joi.string()
    .required()
    .default('https://nid.naver.com/oauth2.0'),
  KAKAO_AUTH_URL: Joi.string()
    .required()
    .default('https://nid.naver.com/oauth2.0'),
  KAKAO_CLIENT_ID: Joi.string().required(),
  KAKAO_CALLBACK_URL: Joi.string().required(),
});

export default validationSchema;

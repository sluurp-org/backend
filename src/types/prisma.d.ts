import { KakaoTemplateButtonType } from 'src/message/dto/req/subtemplate/create-kakao-template-body.dto';

declare global {
  namespace PrismaJson {
    type KakaoTemplateButtons = {
      name: string;
      type: KakaoTemplateButtonType;
      url?: string;
    }[];

    type TemplateVariables = {
      key: string;
      value: string;
      internal?: boolean;
    }[];
  }
}

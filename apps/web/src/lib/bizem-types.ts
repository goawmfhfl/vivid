export type BizEMMessageType =
  | "AT"
  | "AI"
  | "FT"
  | "FI"
  | "FW"
  | "FL"
  | "FC"
  | "FP"
  | "FM"
  | "FA";

export type BizEMSmsKind = "S" | "L" | "M" | "N";

export type BizEMActionType =
  | "WL"
  | "AL"
  | "DS"
  | "BK"
  | "MD"
  | "BC"
  | "AC"
  | "BF"
  | "P1"
  | "P2"
  | "P3"
  | "TN"
  | (string & {});

export interface BizEMActionBase {
  name: string;
  type: BizEMActionType;
  url_mobile?: string;
  url_pc?: string;
  scheme_ios?: string;
  scheme_android?: string;
  chat_extra?: string;
  chat_event?: string;
  biz_form_id?: number;
  biz_form_key?: string;
  plugin_id?: string;
  relay_id?: string;
  oneclick_id?: string;
  product_id?: string;
  tel_number?: string;
}

export type BizEMButtons = Partial<
  Record<`button${1 | 2 | 3 | 4 | 5}`, BizEMActionBase>
>;

export type BizEMQuickReplies = Partial<
  Record<
    `quickReply${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`,
    BizEMActionBase
  >
>;

export interface BizEMSendItem extends BizEMButtons, BizEMQuickReplies {
  message_type: BizEMMessageType;
  phn: string;
  profile: string;
  reserveDt?: string;
  msg?: string;
  title?: string;
  tmplId?: string;
  smsKind?: BizEMSmsKind;
  msgSms?: string;
  smsSender?: string;
  smsAtNight?: "Y" | "N";
  senderCode?: string;
  smsLmsTit?: string;
  smsOnly?: "Y" | "N";
  img_url?: string;
  variables?: Record<string, string>;
  [k: string]: unknown;
}

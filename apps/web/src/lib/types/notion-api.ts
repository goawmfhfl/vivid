/**
 * Notion API 응답 타입 정의
 */

export type NotionRichText = {
  plain_text: string;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
  href?: string;
};

export type NotionBlockContent = {
  rich_text?: NotionRichText[];
  cells?: NotionRichText[][];
  number?: string;
  checked?: boolean;
  language?: string;
  icon?: {
    emoji?: string;
  };
  table_width?: number;
};

export type NotionBlockResponse = {
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
};

export type NotionPageProperties = {
  name?: {
    title?: NotionRichText[];
    rich_text?: NotionRichText[];
    plain_text?: string;
    name?: string;
  };
  title?: {
    title?: NotionRichText[];
    rich_text?: NotionRichText[];
    plain_text?: string;
  };
  type?: {
    select?: {
      name?: string;
    };
    name?: string;
  };
  [key: string]: unknown;
};

export type NotionPage = {
  id: string;
  properties: NotionPageProperties;
  url: string;
  created_time: string;
  last_edited_time: string;
};

export type NotionDatabaseQueryResponse = {
  results: NotionPage[];
  next_cursor: string | null;
};

export type NotionBlocksResponse = {
  results: NotionBlockResponse[];
  next_cursor: string | null;
};

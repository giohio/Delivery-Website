// Mock types - replace with actual @wix/data when available
export type WixDataItem = {
  _id?: string;
  [key: string]: any;
};

export type WixDataQueryResult = {
  items: WixDataItem[];
  totalCount: number;
};

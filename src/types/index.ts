export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  description: string;
  image?: string;
  box: number;
  inner: number;
  availableQty: number;
  moq: number;
  price?: number;
  status: StockStatus;
  tags?: string[];
  isNew?: boolean;
  isFastSelling?: boolean;
  rating?: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count: number;
}

export interface EnquiryItem {
  productId: string;
  name: string;
  code: string;
  quantity: number;
  unit: 'box' | 'inner' | 'piece';
  image?: string;
}

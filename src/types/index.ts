export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  description: string;
  image?: string;
  /** pcs per box — null if admin hid */
  box: number | null;
  /** inner pack qty */
  inner: number | null;
  /** available stock — null if admin hid */
  availableQty: number | null;
  /** minimum order qty — null if admin hid */
  moq: number | null;
  /** wholesale price — null/undefined if admin hid */
  price?: number | null;
  status: StockStatus;
  tags?: string[];
  isNew?: boolean;
  isFastSelling?: boolean;
  rating?: number;
  /** False when admin has restricted enquiry for this product's brand for the current customer. */
  canEnquire?: boolean;
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

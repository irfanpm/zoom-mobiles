// ────────────────────────────────────────────────────────────────────
// Database types — match the SQL schema in /supabase/schema.sql
// ────────────────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type AdminRole = 'admin' | 'super_admin';

export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbBrand {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbCustomerBrandAccess {
  customer_id: string;
  brand_id: string;
  can_view: boolean;
  can_enquire: boolean;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  brand: string | null;          // legacy text field — kept for backward compat
  brand_id: string | null;        // new FK — preferred

  wholesale_price: number | null;
  moq: number;
  box_qty: number;
  stock_qty: number;
  stock_status: StockStatus;

  image_url: string | null;
  gallery: string[];

  tags: string[];
  is_featured: boolean;
  is_new_launch: boolean;
  is_fast_selling: boolean;

  show_price: boolean;
  show_stock: boolean;
  show_moq: boolean;
  show_box_qty: boolean;
  is_published: boolean;

  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbCustomer {
  id: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbAdminUser {
  id: string;
  full_name: string;
  role: AdminRole;
  created_at: string;
}

export interface DbEnquiryItem {
  product_id: string;
  code: string;
  name: string;
  qty: number;
  unit: 'box' | 'pcs';
}

export interface DbEnquiry {
  id: string;
  customer_id: string | null;
  customer_snapshot: {
    full_name?: string;
    company_name?: string;
    phone?: string;
    email?: string;
  } | null;
  items: DbEnquiryItem[];
  message: string | null;
  whatsapp_sent: boolean;
  status: EnquiryStatus;
  created_at: string;
}

export interface DbSettings {
  id: number;
  whatsapp_number: string;
  whatsapp_display: string;
  company_name: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  // branding (Appearance editor — super admin only)
  logo_url?: string | null;
  theme_primary?: string | null;
  theme_secondary?: string | null;
  theme_accent?: string | null;
  about_title?: string | null;
  about_content?: string | null;
  updated_at: string;
}

/** Customer-facing product (server has already filtered hidden fields). */
export interface PublicProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category_id: string | null;
  category_slug?: string;
  category_name?: string;
  brand: string | null;
  brand_id: string | null;
  brand_slug?: string;

  wholesale_price: number | null;   // null if admin hid price
  moq: number | null;               // null if admin hid moq
  box_qty: number | null;           // null if admin hid box qty
  stock_qty: number | null;         // null if admin hid stock
  stock_status: StockStatus;

  image_url: string | null;
  gallery: string[];
  tags: string[];
  is_featured: boolean;
  is_new_launch: boolean;
  is_fast_selling: boolean;

  /** Set false when this brand is restricted-view for the logged-in customer. */
  can_enquire: boolean;
}

'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface ClientSettings {
  whatsapp_number: string;
  whatsapp_display: string;
  company_name: string;
  tagline: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url?: string | null;
}

const DEFAULTS: ClientSettings = {
  whatsapp_number: '919207908718',
  whatsapp_display: '+91 92079 08718',
  company_name: 'Zoom Mobiles',
  tagline: 'A Complete Mobile Accessories Hub',
  email: 'sales@zoommobiles.in',
  phone: '+91 92079 08718',
  address: 'India',
  logo_url: null,
};

const SettingsContext = createContext<ClientSettings>(DEFAULTS);

export function SettingsProvider({
  value,
  children,
}: {
  value: ClientSettings;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): ClientSettings {
  return useContext(SettingsContext);
}

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

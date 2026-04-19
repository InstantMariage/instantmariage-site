const GELATO_BASE_URL = "https://order.gelatoapis.com/v4";

function getApiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error("GELATO_API_KEY non défini");
  return key;
}

async function gelatoFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${GELATO_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": getApiKey(),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new GelatoApiError(
      data?.message ?? `Gelato API error ${res.status}`,
      res.status,
      data
    );
  }

  return data as T;
}

export class GelatoApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "GelatoApiError";
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GelatoAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  country: string; // ISO 3166-1 alpha-2, e.g. "FR"
  email: string;
  phone?: string;
}

export interface GelatoOrderFile {
  type: "default" | "front" | "back";
  url: string; // URL publique du PDF ou image du faire-part
}

export interface GelatoOrderItem {
  itemReferenceId: string;
  productUid: string; // e.g. "card_pf_a5_hor_4-4_gg_ver_hor"
  files: GelatoOrderFile[];
  quantity: number;
}

export interface CreateGelatoOrderParams {
  orderReferenceId: string;
  customerReferenceId: string;
  currency?: string; // défaut "EUR"
  items: GelatoOrderItem[];
  shippingAddress: GelatoAddress;
  shipmentMethodUid?: string; // e.g. "normal", "express"
  metadata?: Record<string, string>;
}

export interface GelatoOrder {
  id: string;
  orderReferenceId: string;
  status: GelatoOrderStatus;
  items: GelatoOrderItemResult[];
  shipments: GelatoShipment[];
  currency: string;
  created: string;
  updated: string;
}

export type GelatoOrderStatus =
  | "created"
  | "passed"
  | "failed"
  | "canceled"
  | "printed"
  | "shipped"
  | "delivered";

export interface GelatoOrderItemResult {
  itemReferenceId: string;
  productUid: string;
  quantity: number;
  status: string;
}

export interface GelatoShipment {
  id: string;
  shipmentMethodUid: string;
  trackingCode?: string;
  trackingUrl?: string;
  shippedAt?: string;
}

export interface QuoteGelatoShippingParams {
  currency?: string;
  items: Pick<GelatoOrderItem, "productUid" | "quantity">[];
  shippingAddress: Pick<GelatoAddress, "country" | "postCode">;
}

export interface GelatoShippingQuote {
  currency: string;
  shipmentMethods: GelatoShipmentMethod[];
}

export interface GelatoShipmentMethod {
  uid: string;
  name: string;
  minDays: number;
  maxDays: number;
  price: number;
}

// ── Fonctions principales ──────────────────────────────────────────────────────

export async function createGelatoOrder(
  params: CreateGelatoOrderParams
): Promise<GelatoOrder> {
  return gelatoFetch<GelatoOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      orderReferenceId: params.orderReferenceId,
      customerReferenceId: params.customerReferenceId,
      currency: params.currency ?? "EUR",
      items: params.items,
      shippingAddress: params.shippingAddress,
      ...(params.shipmentMethodUid && {
        shipmentMethodUid: params.shipmentMethodUid,
      }),
      ...(params.metadata && { metadata: params.metadata }),
    }),
  });
}

export async function getGelatoOrder(orderId: string): Promise<GelatoOrder> {
  return gelatoFetch<GelatoOrder>(`/orders/${orderId}`);
}

export async function quoteGelatoShipping(
  params: QuoteGelatoShippingParams
): Promise<GelatoShippingQuote> {
  return gelatoFetch<GelatoShippingQuote>("/orders:quote", {
    method: "POST",
    body: JSON.stringify({
      currency: params.currency ?? "EUR",
      items: params.items,
      shippingAddress: params.shippingAddress,
    }),
  });
}

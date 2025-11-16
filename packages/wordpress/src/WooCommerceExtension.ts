/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WooCommerce Extension - E-commerce Integration for WordPress Provider
 *
 * Extends WordPress with WooCommerce REST API support:
 * - Products → things (type: "product")
 * - Orders → events (type: "order_created")
 * - Customers → things (type: "customer")
 * - Transactions → connections (type: "purchased")
 */

import { Effect } from "effect";
import type {
  Thing,
  Connection,
  Event,
  CreateThingInput,
  UpdateThingInput,
  CreateConnectionInput,
  CreateEventInput,
} from "../DataProvider";
import {
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionCreateError,
  EventCreateError,
  QueryError,
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface WooCommerceConfig {
  url: string; // WordPress site URL
  consumerKey: string; // WooCommerce consumer key
  consumerSecret: string; // WooCommerce consumer secret
}

// ============================================================================
// WOOCOMMERCE API TYPES
// ============================================================================

interface WCProduct {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: "draft" | "pending" | "private" | "publish";
  featured: boolean;
  catalog_visibility: "visible" | "catalog" | "search" | "hidden";
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: "taxable" | "shipping" | "none";
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders: "no" | "notify" | "yes";
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{
    id: number;
    date_created: string;
    date_modified: string;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: Array<{ id: number; key: string; value: any }>;
  date_created: string;
  date_modified: string;
}

interface WCOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: "pending" | "processing" | "on-hold" | "completed" | "cancelled" | "refunded" | "failed" | "trash";
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: WCAddress;
  shipping: WCAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_completed: string | null;
  cart_hash: string;
  meta_data: Array<{ id: number; key: string; value: any }>;
  line_items: WCLineItem[];
  tax_lines: any[];
  shipping_lines: any[];
  fee_lines: any[];
  coupon_lines: any[];
  refunds: any[];
}

interface WCAddress {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

interface WCLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: any[];
  meta_data: any[];
  sku: string;
  price: number;
}

interface WCCustomer {
  id: number;
  date_created: string;
  date_modified: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WCAddress;
  shipping: WCAddress;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: Array<{ id: number; key: string; value: any }>;
}

// ============================================================================
// WOOCOMMERCE API CLIENT
// ============================================================================

class WooCommerceAPI {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(url: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = `${url}/wp-json/wc/v3`;
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  private getAuthParams(): string {
    return `consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`;
  }

  async get(path: string, params?: URLSearchParams): Promise<Response> {
    const authParams = this.getAuthParams();
    const queryString = params ? `${params.toString()}&${authParams}` : authParams;
    const url = `${this.baseUrl}${path}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async post(path: string, body: any): Promise<Response> {
    const authParams = this.getAuthParams();
    const url = `${this.baseUrl}${path}?${authParams}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async put(path: string, body: any): Promise<Response> {
    const authParams = this.getAuthParams();
    const url = `${this.baseUrl}${path}?${authParams}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }

  async delete(path: string): Promise<Response> {
    const authParams = this.getAuthParams();
    const url = `${this.baseUrl}${path}?${authParams}&force=true`;

    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }
}

// ============================================================================
// WOOCOMMERCE EXTENSION
// ============================================================================

export class WooCommerceExtension {
  private api: WooCommerceAPI;

  constructor(config: WooCommerceConfig) {
    this.api = new WooCommerceAPI(config.url, config.consumerKey, config.consumerSecret);
  }

  // ===== MAPPERS =====

  private mapProductToThing(product: WCProduct): Thing {
    return {
      _id: `wc-product-${product.id}`,
      type: "product",
      name: product.name,
      status: product.status === "publish" ? "active" : (product.status as any),
      properties: {
        slug: product.slug,
        productType: product.type,
        description: product.description,
        shortDescription: product.short_description,
        sku: product.sku,
        price: parseFloat(product.price || "0"),
        regularPrice: parseFloat(product.regular_price || "0"),
        salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
        onSale: product.on_sale,
        purchasable: product.purchasable,
        totalSales: product.total_sales,
        virtual: product.virtual,
        downloadable: product.downloadable,
        downloads: product.downloads,
        stockStatus: product.stock_status,
        stockQuantity: product.stock_quantity,
        manageStock: product.manage_stock,
        backorders: product.backorders,
        soldIndividually: product.sold_individually,
        weight: product.weight,
        dimensions: product.dimensions,
        shippingRequired: product.shipping_required,
        categories: product.categories.map((cat) => cat.name),
        tags: product.tags.map((tag) => tag.name),
        images: product.images.map((img) => ({
          id: img.id,
          src: img.src,
          alt: img.alt,
          name: img.name,
        })),
        featured: product.featured,
        averageRating: parseFloat(product.average_rating),
        ratingCount: product.rating_count,
        relatedIds: product.related_ids,
        upsellIds: product.upsell_ids,
        crossSellIds: product.cross_sell_ids,
        wcProductId: product.id,
      },
      createdAt: new Date(product.date_created).getTime(),
      updatedAt: new Date(product.date_modified).getTime(),
    };
  }

  private mapOrderToEvent(order: WCOrder): Event {
    return {
      _id: `wc-order-${order.id}`,
      type: `order_${order.status}`,
      actorId: order.customer_id ? `wc-customer-${order.customer_id}` : "guest",
      targetId: order.id.toString(),
      timestamp: new Date(order.date_created).getTime(),
      metadata: {
        orderNumber: order.number,
        orderKey: order.order_key,
        status: order.status,
        currency: order.currency,
        total: parseFloat(order.total),
        subtotal: order.line_items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0),
        tax: parseFloat(order.total_tax),
        shipping: parseFloat(order.shipping_total),
        discount: parseFloat(order.discount_total),
        paymentMethod: order.payment_method,
        paymentMethodTitle: order.payment_method_title,
        transactionId: order.transaction_id,
        datePaid: order.date_paid,
        dateCompleted: order.date_completed,
        customerNote: order.customer_note,
        billing: order.billing,
        shipping: order.shipping,
        lineItems: order.line_items.map((item) => ({
          id: item.id,
          name: item.name,
          productId: item.product_id,
          variationId: item.variation_id,
          quantity: item.quantity,
          total: parseFloat(item.total),
          sku: item.sku,
        })),
        wcOrderId: order.id,
      },
    };
  }

  private mapCustomerToThing(customer: WCCustomer): Thing {
    return {
      _id: `wc-customer-${customer.id}`,
      type: "customer",
      name: `${customer.first_name} ${customer.last_name}`.trim() || customer.username,
      status: "active",
      properties: {
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        username: customer.username,
        role: customer.role,
        isPayingCustomer: customer.is_paying_customer,
        avatarUrl: customer.avatar_url,
        billing: customer.billing,
        shipping: customer.shipping,
        wcCustomerId: customer.id,
      },
      createdAt: new Date(customer.date_created).getTime(),
      updatedAt: new Date(customer.date_modified).getTime(),
    };
  }

  // ===== PRODUCTS =====

  getProduct(id: string) {
    return Effect.tryPromise({
      try: async () => {
        const match = id.match(/^wc-product-(\d+)$/);
        if (!match) {
          throw new Error("Invalid WooCommerce product ID");
        }

        const wcId = match[1];
        const response = await this.api.get(`/products/${wcId}`);
        const product: WCProduct = await response.json();

        return this.mapProductToThing(product);
      },
      catch: (error) => new ThingNotFoundError(id, String(error)),
    });
  }

  listProducts(options?: { limit?: number; offset?: number; category?: string; search?: string }) {
    return Effect.tryPromise({
      try: async () => {
        const params = new URLSearchParams({
          per_page: String(options?.limit || 10),
          page: String(((options?.offset || 0) / (options?.limit || 10)) + 1),
        });

        if (options?.category) params.append("category", options.category);
        if (options?.search) params.append("search", options.search);

        const response = await this.api.get("/products", params);
        const products: WCProduct[] = await response.json();

        return products.map((product) => this.mapProductToThing(product));
      },
      catch: (error) => new QueryError("Failed to list WooCommerce products", error),
    });
  }

  createProduct(input: CreateThingInput) {
    return Effect.tryPromise({
      try: async () => {
        const wcProduct = {
          name: input.name,
          type: input.properties.productType || "simple",
          status: input.status === "active" ? "publish" : "draft",
          description: input.properties.description || "",
          short_description: input.properties.shortDescription || "",
          regular_price: String(input.properties.regularPrice || input.properties.price || 0),
          sale_price: input.properties.salePrice ? String(input.properties.salePrice) : undefined,
          sku: input.properties.sku,
          manage_stock: input.properties.manageStock || false,
          stock_quantity: input.properties.stockQuantity,
          stock_status: input.properties.stockStatus || "instock",
          virtual: input.properties.virtual || false,
          downloadable: input.properties.downloadable || false,
          images: input.properties.images?.map((img: any) => ({ src: img.src })),
          categories: input.properties.categories?.map((name: string) => ({ name })),
          tags: input.properties.tags?.map((name: string) => ({ name })),
        };

        const response = await this.api.post("/products", wcProduct);
        const created: WCProduct = await response.json();

        return `wc-product-${created.id}`;
      },
      catch: (error) => new ThingCreateError(String(error), error),
    });
  }

  updateProduct(id: string, input: UpdateThingInput) {
    return Effect.tryPromise({
      try: async () => {
        const match = id.match(/^wc-product-(\d+)$/);
        if (!match) {
          throw new Error("Invalid WooCommerce product ID");
        }

        const wcId = match[1];
        const wcUpdates: any = {};

        if (input.name) wcUpdates.name = input.name;
        if (input.status) wcUpdates.status = input.status === "active" ? "publish" : "draft";
        if (input.properties) {
          if (input.properties.description) wcUpdates.description = input.properties.description;
          if (input.properties.price) wcUpdates.regular_price = String(input.properties.price);
          if (input.properties.salePrice) wcUpdates.sale_price = String(input.properties.salePrice);
          if (input.properties.stockQuantity !== undefined)
            wcUpdates.stock_quantity = input.properties.stockQuantity;
        }

        await this.api.put(`/products/${wcId}`, wcUpdates);
      },
      catch: (error) => new ThingUpdateError(id, String(error), error),
    });
  }

  deleteProduct(id: string) {
    return Effect.tryPromise({
      try: async () => {
        const match = id.match(/^wc-product-(\d+)$/);
        if (!match) {
          throw new Error("Invalid WooCommerce product ID");
        }

        const wcId = match[1];
        await this.api.delete(`/products/${wcId}`);
      },
      catch: (error) => new ThingNotFoundError(id, String(error)),
    });
  }

  // ===== ORDERS =====

  getOrder(id: string) {
    return Effect.tryPromise({
      try: async () => {
        const match = id.match(/^wc-order-(\d+)$/);
        if (!match) {
          throw new Error("Invalid WooCommerce order ID");
        }

        const wcId = match[1];
        const response = await this.api.get(`/orders/${wcId}`);
        const order: WCOrder = await response.json();

        return this.mapOrderToEvent(order);
      },
      catch: (error) => new QueryError(String(error), error),
    });
  }

  listOrders(options?: { limit?: number; offset?: number; customerId?: string; status?: string }) {
    return Effect.tryPromise({
      try: async () => {
        const params = new URLSearchParams({
          per_page: String(options?.limit || 10),
          page: String(((options?.offset || 0) / (options?.limit || 10)) + 1),
        });

        if (options?.customerId) {
          const match = options.customerId.match(/^wc-customer-(\d+)$/);
          if (match) params.append("customer", match[1]);
        }
        if (options?.status) params.append("status", options.status);

        const response = await this.api.get("/orders", params);
        const orders: WCOrder[] = await response.json();

        return orders.map((order) => this.mapOrderToEvent(order));
      },
      catch: (error) => new QueryError("Failed to list WooCommerce orders", error),
    });
  }

  createOrder(input: CreateEventInput) {
    return Effect.tryPromise({
      try: async () => {
        const customerId = input.actorId?.match(/^wc-customer-(\d+)$/)?.[1];

        const wcOrder = {
          customer_id: customerId ? parseInt(customerId) : 0,
          payment_method: input.metadata?.paymentMethod || "cod",
          payment_method_title: input.metadata?.paymentMethodTitle || "Cash on Delivery",
          set_paid: input.metadata?.setPaid || false,
          billing: input.metadata?.billing,
          shipping: input.metadata?.shipping,
          line_items: input.metadata?.lineItems?.map((item: any) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          shipping_lines: input.metadata?.shippingLines || [],
          coupon_lines: input.metadata?.couponLines || [],
        };

        const response = await this.api.post("/orders", wcOrder);
        const created: WCOrder = await response.json();

        return `wc-order-${created.id}`;
      },
      catch: (error) => new EventCreateError(String(error), error),
    });
  }

  // ===== CUSTOMERS =====

  getCustomer(id: string) {
    return Effect.tryPromise({
      try: async () => {
        const match = id.match(/^wc-customer-(\d+)$/);
        if (!match) {
          throw new Error("Invalid WooCommerce customer ID");
        }

        const wcId = match[1];
        const response = await this.api.get(`/customers/${wcId}`);
        const customer: WCCustomer = await response.json();

        return this.mapCustomerToThing(customer);
      },
      catch: (error) => new ThingNotFoundError(id, String(error)),
    });
  }

  listCustomers(options?: { limit?: number; offset?: number; search?: string }) {
    return Effect.tryPromise({
      try: async () => {
        const params = new URLSearchParams({
          per_page: String(options?.limit || 10),
          page: String(((options?.offset || 0) / (options?.limit || 10)) + 1),
        });

        if (options?.search) params.append("search", options.search);

        const response = await this.api.get("/customers", params);
        const customers: WCCustomer[] = await response.json();

        return customers.map((customer) => this.mapCustomerToThing(customer));
      },
      catch: (error) => new QueryError("Failed to list WooCommerce customers", error),
    });
  }

  // ===== PURCHASE CONNECTIONS =====

  createPurchaseConnection(input: CreateConnectionInput) {
    return Effect.tryPromise({
      try: async () => {
        // In WooCommerce, a purchase is recorded as an order
        // We create an order event that represents this connection
        const orderData = {
          customer_id: input.fromEntityId.match(/^wc-customer-(\d+)$/)?.[1],
          line_items: [
            {
              product_id: input.toEntityId.match(/^wc-product-(\d+)$/)?.[1],
              quantity: input.metadata?.quantity || 1,
            },
          ],
          status: "completed",
        };

        const response = await this.api.post("/orders", orderData);
        const created: WCOrder = await response.json();

        return `wc-purchase-${created.id}`;
      },
      catch: (error) => new ConnectionCreateError(String(error), error),
    });
  }

  // ===== ANALYTICS =====

  getRevenueReport(options?: { startDate?: string; endDate?: string }) {
    return Effect.tryPromise({
      try: async () => {
        const params = new URLSearchParams();
        if (options?.startDate) params.append("after", options.startDate);
        if (options?.endDate) params.append("before", options.endDate);

        const response = await this.api.get("/reports/sales", params);
        const report = await response.json();

        return report;
      },
      catch: (error) => new QueryError("Failed to get revenue report", error),
    });
  }

  getTopSellers(options?: { period?: string; limit?: number }) {
    return Effect.tryPromise({
      try: async () => {
        const params = new URLSearchParams({
          period: options?.period || "week",
          per_page: String(options?.limit || 10),
        });

        const response = await this.api.get("/reports/top_sellers", params);
        const products = await response.json();

        return products;
      },
      catch: (error) => new QueryError("Failed to get top sellers", error),
    });
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const createWooCommerceExtension = (
  url: string,
  consumerKey: string,
  consumerSecret: string
) => {
  return new WooCommerceExtension({ url, consumerKey, consumerSecret });
};

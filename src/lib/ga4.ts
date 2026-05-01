type DataLayerEvent = Record<string, unknown>

type Ga4Item = {
    item_id: string
    item_name: string
    price?: number
    quantity?: number
    item_variant?: string
    item_brand?: string
    item_category?: string
}

const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_GA4_CURRENCY || "BDT"

function ensureDataLayer(): DataLayerEvent[] {
    if (typeof window === "undefined") return []
    window.dataLayer = window.dataLayer || []
    return window.dataLayer
}

function pushDataLayer(payload: DataLayerEvent) {
    const dataLayer = ensureDataLayer()
    if (dataLayer.length === 0 && typeof window === "undefined") return
    dataLayer.push(payload)
}

function normalizeItem(item: Ga4Item): Ga4Item {
    return {
        item_id: item.item_id,
        item_name: item.item_name,
        price: item.price,
        quantity: item.quantity,
        item_variant: item.item_variant,
        item_brand: item.item_brand,
        item_category: item.item_category,
    }
}

function buildValue(items: Ga4Item[], value?: number) {
    if (typeof value === "number") return value
    return items.reduce((sum, item) => {
        const price = typeof item.price === "number" ? item.price : 0
        const quantity = typeof item.quantity === "number" ? item.quantity : 1
        return sum + price * quantity
    }, 0)
}

function pushEcommerceEvent(event: string, ecommerce: Record<string, unknown>) {
    pushDataLayer({ ecommerce: null })
    pushDataLayer({
        event,
        ecommerce: {
            currency: DEFAULT_CURRENCY,
            ...ecommerce,
        },
    })
}

export function trackViewItem(item: Ga4Item) {
    pushEcommerceEvent("view_item", {
        value: buildValue([item], item.price),
        items: [normalizeItem(item)],
    })
}

export function trackAddToCart(item: Ga4Item) {
    pushEcommerceEvent("add_to_cart", {
        value: buildValue([item]),
        items: [normalizeItem(item)],
    })
}

export function trackBeginCheckout(items: Ga4Item[], value?: number) {
    if (items.length === 0) return
    pushEcommerceEvent("begin_checkout", {
        value: buildValue(items, value),
        items: items.map(normalizeItem),
    })
}

export function trackPurchase(input: {
    transactionId: string
    value: number
    tax?: number
    shipping?: number
    coupon?: string | null
    items: Ga4Item[]
}) {
    if (!input.transactionId || input.items.length === 0) return
    pushEcommerceEvent("purchase", {
        transaction_id: input.transactionId,
        value: input.value,
        tax: input.tax,
        shipping: input.shipping,
        coupon: input.coupon || undefined,
        items: input.items.map(normalizeItem),
    })
}

export function trackAddToWishlist(item: Ga4Item) {
    pushEcommerceEvent("add_to_wishlist", {
        value: buildValue([item], item.price),
        items: [normalizeItem(item)],
    })
}

export function trackRemoveFromWishlist(item: Ga4Item) {
    pushEcommerceEvent("remove_from_wishlist", {
        value: buildValue([item], item.price),
        items: [normalizeItem(item)],
    })
}

export type { Ga4Item }

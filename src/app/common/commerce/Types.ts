


// Order
export type OrderItemStatus = 'none' | 'ordered' | 'changed' | 'cancelled'
export type DeliveryStatus =
	'none' |	// Orders that do not need to be shipped.
	'pending' | // Delivery is pending.
	'preparing_for_delivery' | // Preparing for delivery.
	'out_for_delivery' | // Carrier is about to deliver the shipment , or it is ready to pickup.
	'in_transit' | // Carrier has accepted or picked up shipment from shipper. The shipment is on the way.
	'failed_attempt' | // Carrier attempted to deliver but failed, and usually leaves a notice and will try to delivery again.
	'delivered' | // The shipment was delivered successfully.
	'available_for_pickup' | // The package arrived at a pickup point near you and is available for pickup.
	'exception' | // Custom hold, undelivered, returned shipment to sender or any shipping exceptions.
	'expired' // Shipment has no tracking information for 30 days since added.

export type PaymentStatus = 'none' | 'rejected' | 'authorized' | 'paid' | 'cancelled' | 'failure' | 'cancel_failure'

// Plan
export type Interval = 'day' | 'week' | 'month' | 'year'
export type TiersMode = 'graduated' | 'volume'
export type Tier = {
	upTo: number;
	flatAmount?: number;
	unitAmount?: number;
};

// Product
export type ProductType = 'service' | 'good' | 'ticket'

// SKU
export type StockType = 'bucket' | 'finite' | 'infinite'
export type StockValue = 'in_stock' | 'limited' | 'out_of_stock'
export type Inventory = {
	type: StockType
	quantity?: number
	value?: StockValue
}

// Subscription
export type SubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'

export interface Address {
	city?: string
	town?: string
	country?: string
	line1?: string
	line2?: string
	postal_code?: string
	state?: string
}

export type DiscountType = 'absolute' | 'rate'

export type Discount = {
	type: DiscountType
	amount?: number
	rate?: number
}

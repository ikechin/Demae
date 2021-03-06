import { Doc, Field, firestore, CollectionReference, Codable, SubCollection, Collection } from '@1amageek/ballcap-admin'
import * as functions from 'firebase-functions'
import { CountryCode } from '../../common/Country'
import { CurrencyCode } from '../../common/Currency'
import Shipping from './Shipping'
import Order from './Order'
import { Role } from './Provider'

export default class User extends Doc {

	static collectionReference(): CollectionReference {
		return firestore.collection('commerce/v1/users')
	}

	static async getCustomerID(uid: string) {
		const user = await User.get<User>(uid)
		if (!user) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Customer')
		}
		const customerID = user.customerID
		if (!customerID) {
			throw new functions.https.HttpsError('invalid-argument', 'User have not Stripe customerID')
		}
		return customerID
	}

	@Field customerID?: string
	@Field isAvailable: boolean = false
	@Field country: CountryCode = 'US'
	@Field currentOrderID?: string
	@Field currency: CurrencyCode = 'USD'
	@Codable(Shipping, true)
	@Field defaultShipping?: Shipping
	@Field defaultPaymentMethodID?: string

	@SubCollection providers: Collection<Role> = new Collection()
	@SubCollection shippingAddresses: Collection<Shipping> = new Collection()
	@SubCollection orders: Collection<Order> = new Collection()

}

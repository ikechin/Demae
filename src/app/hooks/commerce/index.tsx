import React, { useEffect, useState, createContext, useContext } from 'react'
import firebase from "firebase"
import "@firebase/firestore"
import "@firebase/auth"
import { Doc, DocumentReference } from '@1amageek/ballcap'
import Provider from 'models/commerce/Provider'
import Product from 'models/commerce/Product'
import SKU from 'models/commerce/SKU'
import Cart from 'models/commerce/Cart'
import User from 'models/commerce/User'
import Shipping from 'models/commerce/Shipping'

export const useAuthUser = (): [firebase.User | undefined, boolean, firebase.auth.Error?] => {
	interface Prop {
		data?: firebase.User
		loading: boolean
		error?: firebase.auth.Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		let listener = firebase.auth().onAuthStateChanged(auth => {
			if (enabled) {
				setState({
					data: auth as firebase.User,
					loading: false,
					error: undefined
				})
			}
		}, error => {
			if (enabled) {
				setState({
					data: undefined,
					loading: false,
					error: error
				})
			}
		})
		return () => {
			enabled = false
			listener()
		}
	}, []);
	return [state.data, state.loading, state.error]
}

export const useAdmin = (): [string | undefined, boolean, Error?] => {
	interface Prop {
		data?: string
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const claims = localStorage.getItem('claims')
		if (claims) {
			const parsedClaims = JSON.parse(claims)
			if (state.data !== parsedClaims.admin) {
				if (enabled) {
					setState({
						data: parsedClaims.admin,
						loading: false
					})
				}
			} else {
				if (enabled) {
					setState({
						loading: false
					})
				}
			}
		} else {
			setState({
				loading: false
			})
		}
		return () => {
			enabled = false
		}
	}, []);
	return [state.data, state.loading, state.error]
}

export const AuthContext = createContext<[firebase.User | undefined, boolean, firebase.auth.Error | undefined]>([undefined, true, undefined])
export const AuthProvider = ({ children }: { children: any }) => {
	const [auth, isLoading, error] = useAuthUser()
	return <AuthContext.Provider value={[auth, isLoading, error]}> {children} </AuthContext.Provider>
}

export const AdminProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const AdminProviderProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [data, isLoading, error] = useDocumentListen<Provider>(Provider, auth?.uid ? new Provider(auth.uid).documentReference : undefined, waiting)
	return <AdminProviderContext.Provider value={[data, isLoading, error]}> {children} </AdminProviderContext.Provider>
}

export const UserContext = createContext<[User | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const UserProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [user, isLoading, error] = useDocumentListen<User>(User, auth?.uid ? new User(auth.uid).documentReference : undefined, waiting)
	return <UserContext.Provider value={[user, isLoading, error]}> {children} </UserContext.Provider>
}

export const CartContext = createContext<[Cart | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const CartProvider = ({ children }: { children: any }) => {
	const [auth, waiting] = useContext(AuthContext)
	const [cart, isLoading, error] = useDocumentListen<Cart>(Cart, auth?.uid ? new Cart(auth.uid).documentReference : undefined, waiting)
	return <CartContext.Provider value={[cart, isLoading, error]}> {children} </CartContext.Provider>
}

export const ProviderContext = createContext<[Provider | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const ProviderProvider = ({ id, children }: { id: string, children: any }) => {
	const [data, isLoading, error] = useDocumentListen<Provider>(Provider, new Provider(id).documentReference)
	return <ProviderContext.Provider value={[data, isLoading, error]}> {children} </ProviderContext.Provider>
}

export const ProductContext = createContext<[Product | undefined, boolean, Error | undefined]>([undefined, true, undefined])
export const ProductProvider = ({ id, children }: { id: string, children: any }) => {
	const [data, isLoading, error] = useDocumentListen<Product>(Product, new Product(id).documentReference)
	return <ProductContext.Provider value={[data, isLoading, error]}> {children} </ProductContext.Provider>
}

export const useProviderProduct = (id: string): [Product | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const documentReference = user ? new Provider(user.uid).products.collectionReference.doc(id) : undefined
	return useDocument<Product>(Product, documentReference, isLoading)
}

export const useProviderProductSKU = (productID: string, skuID: string): [SKU | undefined, boolean, Error?] => {
	const [user, isLoading] = useAuthUser()
	const documentReference = user ? new Provider(user.uid).products.doc(productID, Product).skus.collectionReference.doc(skuID) : undefined
	return useDocument<SKU>(SKU, documentReference, isLoading)
}

export const useDocument = <T extends Doc>(type: typeof Doc, documentReference?: DocumentReference, waiting: boolean = false): [T | undefined, boolean, Error?] => {
	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		const fetchData = async (documentReference: DocumentReference) => {
			try {
				const snapshot = await documentReference.get()
				const data = type.fromSnapshot<T>(snapshot)
				if (enabled) {
					setState({
						...state,
						loading: false,
						data
					})
				}
			} catch (error) {
				if (enabled) {
					setState({
						data: undefined,
						loading: false,
						error
					})
				}
			}
		}
		if (!waiting && documentReference) {
			fetchData(documentReference)
		}
		return () => {
			enabled = false
		}
	}, [documentReference?.path, waiting])
	return [state.data, state.loading, state.error]
}

export const useDataSource = <T extends Doc>(type: typeof Doc, query: firebase.firestore.Query, waiting: boolean = false): [T[], boolean, Error | undefined] => {

	interface Prop {
		data: T[]
		loading: boolean
		error?: Error
	}

	const [state, setState] = useState<Prop>({ data: [], loading: true })
	useEffect(() => {
		let enabled = true
		const fetchData = async () => {
			try {
				const snapshot = await query.get()
				const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
				if (enabled) {
					setState({
						...state,
						loading: false,
						data
					});
				}
			} catch (error) {
				if (enabled) {
					setState({
						data: [],
						loading: false,
						error
					});
				}
			}
		};
		setState({
			...state,
			loading: true
		})
		if (!waiting) {
			fetchData()
		}
		return () => {
			enabled = false
		}
	}, [waiting])
	return [state.data, state.loading, state.error]
};

export const useDocumentListen = <T extends Doc>(type: typeof Doc, documentReference?: DocumentReference, waiting: boolean = false): [T | undefined, boolean, Error?] => {
	interface Prop {
		data?: T
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ loading: true })
	useEffect(() => {
		let enabled = true
		let listener: (() => void) | undefined
		const listen = async (documentReference: DocumentReference) => {
			listener = documentReference.onSnapshot({
				next: (snapshot) => {
					const data = type.fromSnapshot<T>(snapshot)
					if (enabled) {
						setState({
							data,
							loading: false,
							error: undefined
						})
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							data: undefined,
							loading: false,
							error
						})
					}
				}
			})
		}
		if (!waiting) {
			if (documentReference) {
				listen(documentReference)
			} else {
				setState({
					data: undefined,
					loading: false,
					error: undefined
				})
			}
		} else {
			setState({
				data: undefined,
				loading: waiting,
				error: undefined
			})
		}
		return () => {
			enabled = false
			if (listener) {
				listener()
			}
		}
	}, [documentReference?.path, waiting])
	return [state.data, state.loading, state.error]
}

export const useDataSourceListen = <T extends Doc>(type: typeof Doc, query?: firebase.firestore.Query, waiting: boolean = false): [T[], boolean, Error | undefined] => {
	interface Prop {
		data: T[]
		loading: boolean
		error?: Error
	}
	const [state, setState] = useState<Prop>({ data: [], loading: true })
	useEffect(() => {
		let enabled = true
		let listener: (() => void) | undefined
		const listen = async () => {
			query?.onSnapshot({
				next: (snapshot) => {
					const data = snapshot.docs.map(doc => type.fromSnapshot<T>(doc))
					if (enabled) {
						setState({
							data,
							loading: false,
							error: undefined
						});
					}
				},
				error: (error) => {
					if (enabled) {
						setState({
							data: [],
							loading: false,
							error
						})
					}
				}
			})
		};

		if (!waiting) {
			if (query) {
				listen()
			} else {
				setState({
					data: [],
					loading: false,
					error: undefined
				})
			}
		} else {
			setState({
				data: [],
				loading: waiting,
				error: undefined
			})
		}
		return () => {
			enabled = false
			if (listener) {
				listener()
			}
		}
	}, [waiting])
	return [state.data, state.loading, state.error]
};

export const useAdminProvider = (): [Provider | undefined, boolean, Error | undefined] => {
	return useContext(AdminProviderContext)
}

export const useCart = (): [Cart | undefined, boolean, Error | undefined] => {
	return useContext(CartContext)
}

export const useUser = (): [User | undefined, boolean, Error | undefined] => {
	return useContext(UserContext)
}

export const useUserShipping = (id?: string): [Shipping | undefined, boolean, Error | undefined] => {
	const [auth, isAuthLoading] = useContext(AuthContext)
	const collectionReference = new User(auth?.uid).shippingAddresses.collectionReference
	const [ref] = useState(id ? collectionReference.doc(id) : collectionReference.doc())
	const [shipping, isLoading, error] = useDocumentListen<Shipping>(Shipping, ref, isAuthLoading)
	return [shipping, isLoading, error]
}

export const useUserShippingAddresses = (): [Shipping[], boolean, Error | undefined] => {
	const [auth, isAuthLoading] = useContext(AuthContext)
	const collectionReference = new User(auth?.uid).shippingAddresses.collectionReference
	const [data, isLoading, error] = useDataSourceListen<Shipping>(Shipping, collectionReference, isAuthLoading)
	return [data, isLoading, error]
}

//

export const useProvider = (): [Provider | undefined, boolean, Error | undefined] => {
	return useContext(ProviderContext)
}

export const useProduct = (): [Product | undefined, boolean, Error | undefined] => {
	return useContext(ProductContext)
}

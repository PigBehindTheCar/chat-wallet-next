// 交易数据模型
export interface Transaction {
	id: string
	date: string
	day: string
	category: string
	note: string
	amount: number // 正数表示收入，负数表示支出
}

// 交易数据响应格式
interface TransactionResponse {
	success: boolean
	data: Transaction[]
	timestamp: string
}

// 单个交易的响应格式
interface SingleTransactionResponse {
	success: boolean
	data: Transaction
	message: string
}

// 本地存储键
const LOCAL_STORAGE_KEY = "wallet_transactions"
const LAST_SYNC_KEY = "wallet_transactions_last_sync"

// 辅助函数：检查是否在浏览器环境
const isBrowser = () => typeof window !== "undefined"

/**
 * 从本地存储获取交易数据
 */
const getLocalTransactions = (): Transaction[] => {
	if (!isBrowser()) return []

	try {
		const storedData = localStorage.getItem(LOCAL_STORAGE_KEY)
		return storedData ? JSON.parse(storedData) : []
	} catch (error) {
		console.error("Error retrieving transactions from local storage:", error)
		return []
	}
}

/**
 * 将交易数据保存到本地存储
 */
const saveLocalTransactions = (transactions: Transaction[]): void => {
	if (!isBrowser()) return

	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions))
		localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString())
	} catch (error) {
		console.error("Error saving transactions to local storage:", error)
	}
}

/**
 * 从API获取交易数据
 */
const fetchTransactionsFromAPI = async (): Promise<Transaction[]> => {
	try {
		const response = await fetch("/api/dummy/transactions")
		const data: TransactionResponse = await response.json()

		if (data.success) {
			return data.data
		} else {
			console.error("API returned unsuccessful response")
			return []
		}
	} catch (error) {
		console.error("Error fetching transactions from API:", error)
		return []
	}
}

/**
 * 获取交易数据（本地优先策略）
 * 1. 首先从本地存储加载
 * 2. 同时在后台从API获取最新数据
 * 3. 如果API返回的数据与本地不同，则更新本地存储并返回
 */
export const getTransactions = async (): Promise<Transaction[]> => {
	// 首先从本地获取数据
	let localTransactions = getLocalTransactions()

	// 如果本地有数据，先返回本地数据给UI使用
	const hasLocalData = localTransactions.length > 0

	// 无论是否有本地数据，都异步请求API获取最新数据
	const apiPromise = fetchTransactionsFromAPI().then((apiTransactions) => {
		// 检查API数据是否与本地数据不同
		if (JSON.stringify(apiTransactions) !== JSON.stringify(localTransactions)) {
			// 如果数据不同，更新本地存储
			saveLocalTransactions(apiTransactions)
			localTransactions = apiTransactions

			// 这里可以添加发布事件或回调通知UI组件数据已更新
			// 例如: eventEmitter.emit('transactions-updated', apiTransactions);

			return apiTransactions
		}
		return localTransactions
	})

	// 如果本地没有数据，等待API响应
	if (!hasLocalData) {
		return await apiPromise
	}

	// 否则立即返回本地数据，让API在后台更新
	return localTransactions
}

/**
 * 添加新交易
 */
export const addTransaction = async (
	transaction: Omit<Transaction, "id">
): Promise<Transaction | null> => {
	try {
		// 调用API添加交易
		const response = await fetch("/api/dummy/transactions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(transaction),
		})

		const result = (await response.json()) as SingleTransactionResponse

		if (result.success) {
			// API添加成功，更新本地存储
			const newTransaction = result.data
			const localTransactions = getLocalTransactions()
			localTransactions.push(newTransaction)
			saveLocalTransactions(localTransactions)

			return newTransaction
		}

		return null
	} catch (error) {
		console.error("Error adding transaction:", error)
		return null
	}
}

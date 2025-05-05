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

// 基础响应格式
interface BaseResponse {
	success: boolean
	message: string
}

// API配置
const API_CONFIG = {
	baseUrl: "http://localhost:8000", // 默认为空，表示使用当前域名
}

// 设置API基础URL
export const setApiBaseUrl = (baseUrl: string): void => {
	API_CONFIG.baseUrl = baseUrl
}

// 获取完整的API URL
const getApiUrl = (path: string): string => {
	return `${API_CONFIG.baseUrl}${path}`
}

// 本地存储键
const LOCAL_STORAGE_KEY = "wallet_transactions"
const LAST_SYNC_KEY = "wallet_transactions_last_sync"

// 数据更新监听器类型
type TransactionUpdateListener = (transactions: Transaction[]) => void

// 存储所有注册的监听器
const updateListeners: TransactionUpdateListener[] = []

// 添加数据更新监听器
export const addTransactionUpdateListener = (
	listener: TransactionUpdateListener
): void => {
	updateListeners.push(listener)
}

// 移除数据更新监听器
export const removeTransactionUpdateListener = (
	listener: TransactionUpdateListener
): void => {
	const index = updateListeners.indexOf(listener)
	if (index !== -1) {
		updateListeners.splice(index, 1)
	}
}

// 通知所有监听器数据已更新
const notifyUpdateListeners = (transactions: Transaction[]): void => {
	updateListeners.forEach((listener) => listener(transactions))
}

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
		const response = await fetch(getApiUrl("/transactions"))
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
 * 3. 如果API返回的数据与本地不同，则更新本地存储并通知组件更新
 */
export const getTransactions = async (): Promise<Transaction[]> => {
	// 首先从本地获取数据
	const localTransactions = getLocalTransactions()

	// 如果本地有数据，先返回本地数据给UI使用
	const hasLocalData = localTransactions.length > 0

	// 无论是否有本地数据，都异步请求API获取最新数据
	fetchTransactionsFromAPI().then((apiTransactions) => {
		// 检查API数据是否与本地数据不同
		if (JSON.stringify(apiTransactions) !== JSON.stringify(localTransactions)) {
			// 如果数据不同，更新本地存储
			saveLocalTransactions(apiTransactions)

			// 通知所有监听器数据已更新
			notifyUpdateListeners(apiTransactions)
		}
	})

	// 如果本地没有数据，等待API响应
	if (!hasLocalData) {
		return await fetchTransactionsFromAPI()
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
		// 确保日期正确，避免时区问题导致日期减少一天
		const correctedTransaction = { ...transaction }

		// 如果只有date字段而没有day字段，则从date生成day
		if (correctedTransaction.date && !correctedTransaction.day) {
			// 直接从日期字符串提取天数，避免时区转换
			correctedTransaction.day = correctedTransaction.date.split("-")[2]
		}

		// 调用API添加交易
		const response = await fetch(getApiUrl("/transactions"), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(correctedTransaction),
		})

		const result = (await response.json()) as SingleTransactionResponse

		if (result.success) {
			// API添加成功，更新本地存储
			const newTransaction = result.data
			const localTransactions = getLocalTransactions()
			localTransactions.push(newTransaction)
			saveLocalTransactions(localTransactions)

			// 通知所有监听器数据已更新
			notifyUpdateListeners(localTransactions)

			return newTransaction
		}

		return null
	} catch (error) {
		console.error("Error adding transaction:", error)
		return null
	}
}

/**
 * 更新现有交易
 */
export const updateTransaction = async (
	transaction: Transaction
): Promise<Transaction | null> => {
	try {
		// 确保日期正确，避免时区问题导致日期减少一天
		const correctedTransaction = { ...transaction }

		// 如果只有date字段而没有day字段，则从date生成day
		if (correctedTransaction.date && !correctedTransaction.day) {
			// 直接从日期字符串提取天数，避免时区转换
			correctedTransaction.day = correctedTransaction.date.split("-")[2]
		}

		// 调用API更新交易
		const response = await fetch(
			getApiUrl(`/transactions/${correctedTransaction.id}`),
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(correctedTransaction),
			}
		)

		const result = (await response.json()) as SingleTransactionResponse

		if (result.success) {
			// API更新成功，更新本地存储
			const updatedTransaction = result.data
			const localTransactions = getLocalTransactions()
			const index = localTransactions.findIndex((t) => t.id === transaction.id)

			if (index !== -1) {
				localTransactions[index] = updatedTransaction
				saveLocalTransactions(localTransactions)

				// 通知所有监听器数据已更新
				notifyUpdateListeners(localTransactions)
			}

			return updatedTransaction
		}

		return null
	} catch (error) {
		console.error("Error updating transaction:", error)
		return null
	}
}

/**
 * 删除交易
 */
export const deleteTransaction = async (
	transactionId: string
): Promise<boolean> => {
	try {
		// 调用API删除交易
		const response = await fetch(getApiUrl(`/transactions/${transactionId}`), {
			method: "DELETE",
		})

		const result = (await response.json()) as BaseResponse

		if (result.success) {
			// API删除成功，更新本地存储
			const localTransactions = getLocalTransactions()
			const updatedTransactions = localTransactions.filter(
				(t) => t.id !== transactionId
			)
			saveLocalTransactions(updatedTransactions)

			// 通知所有监听器数据已更新
			notifyUpdateListeners(updatedTransactions)

			return true
		}

		return false
	} catch (error) {
		console.error("Error deleting transaction:", error)
		return false
	}
}

"use client"

import React, {
	useState,
	useMemo,
	useEffect,
	useCallback,
	Suspense,
	useRef,
} from "react"
import Image from "next/image"
import {
	Transaction,
	getTransactions,
	addTransaction,
	updateTransaction,
	deleteTransaction,
	addTransactionUpdateListener,
	removeTransactionUpdateListener,
	getApiBaseUrl,
} from "@/app/services/transactionService"
import { useRouter, useSearchParams } from "next/navigation"
import DateSelectionModal from "./DateSelectionModal"
import NewTransactionModal from "./NewTransactionModal"
// 注释掉BatchTransactionModal相关导入
// import BatchTransactionModal from "./BatchTransactionModal"
// import { parseNaturalLanguage } from "@/app/services/naturalLanguageParser"
import ConfirmationModal from "./ConfirmationModal"

interface DateSelection {
	year: number
	month: number | null
}

// 新交易的表单数据类型
interface TransactionForm {
	category: string
	note: string
	amount: string
	date: string
	isExpense: boolean
}

// 预设的交易类别
const EXPENSE_CATEGORIES = [
	"Food",
	"Groceries",
	"Transportation",
	"Housing",
	"Entertainment",
	"Shopping",
	"Utilities",
	"Health",
	"Education",
	"Travel",
	"Other",
]

const INCOME_CATEGORIES = [
	"Salary",
	"Bonus",
	"Gift",
	"Investment",
	"Refund",
	"Other",
]

// 添加自定义域名配置
const API_DOMAIN = getApiBaseUrl()

// 创建一个DateSelector组件来处理日期选择和URL参数
function DateSelector({
	onDateSelect,
}: {
	onDateSelect: (date: DateSelection) => void
}) {
	const searchParams = useSearchParams()
	const currentYear = new Date().getFullYear()
	const currentMonth = new Date().getMonth()

	// 根据不同情况处理参数：
	// 1. 如果年和月都没有，使用当前年月
	// 2. 如果只有年参数，使用该年，月为null (显示整年)
	// 3. 如果只有月参数，使用当前年和参数月
	const hasYearParam = searchParams.has("year")
	const hasMonthParam = searchParams.has("month")

	const initialYear = hasYearParam
		? parseInt(searchParams.get("year") as string)
		: currentYear

	const initialMonth = hasMonthParam
		? parseInt(searchParams.get("month") as string)
		: hasYearParam
		? null
		: currentMonth // 如果只有年参数，月为null；否则为当前月

	// 初始化时设置日期
	useEffect(() => {
		onDateSelect({
			year: initialYear,
			month: initialMonth,
		})
	}, [initialYear, initialMonth, onDateSelect])

	return null // 这个组件不渲染任何UI，只处理URL参数
}

const ExpenseTracker: React.FC = () => {
	const router = useRouter()

	// 添加textarea引用
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const [inputMessage, setInputMessage] = useState("")
	const [showDateModal, setShowDateModal] = useState(false)
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isApiSending, setIsApiSending] = useState(false)

	// 新交易Modal状态
	const [showTransactionModal, setShowTransactionModal] = useState(false)

	// 当前年月
	const currentYear = new Date().getFullYear()
	const currentMonth = new Date().getMonth()

	// 默认使用当前日期，稍后由DateSelector根据URL参数更新
	const [selectedDate, setSelectedDate] = useState<DateSelection>({
		year: currentYear,
		month: currentMonth,
	})

	const [customYear, setCustomYear] = useState<string>("")

	// 新增用于编辑和删除的状态
	const [editingTransaction, setEditingTransaction] =
		useState<Transaction | null>(null)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [deletingTransactionId, setDeletingTransactionId] = useState<
		string | null
	>(null)

	// 处理交易数据更新的回调
	const handleTransactionsUpdate = useCallback(
		(updatedTransactions: Transaction[]) => {
			console.log("云端数据已更新，重新渲染UI")
			setTransactions(updatedTransactions)
		},
		[]
	)

	// 更新URL查询参数
	const updateUrlParams = useCallback(
		(year: number, month: number | null) => {
			// 创建新的URLSearchParams对象
			const params = new URLSearchParams()

			// 添加年份参数
			params.set("year", year.toString())

			// 如果有月份，添加月份参数；如果为null，则不添加月份参数
			if (month !== null) {
				params.set("month", month.toString())
			}

			// 更新URL，不触发页面刷新
			router.replace(`?${params.toString()}`, { scroll: false })
		},
		[router]
	)

	// 当选择的日期改变时，更新URL
	useEffect(() => {
		updateUrlParams(selectedDate.year, selectedDate.month)
	}, [selectedDate, updateUrlParams])

	// 加载交易数据 - 只在组件挂载时执行一次
	useEffect(() => {
		let isMounted = true

		const loadTransactions = async () => {
			if (!isMounted) return

			setIsLoading(true)
			try {
				// 获取交易数据（先从本地，同时在后台从API获取更新）
				const data = await getTransactions()
				if (isMounted) {
					setTransactions(data)
				}
			} catch (error) {
				console.error("Error loading transactions:", error)
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		// 注册数据更新监听器
		addTransactionUpdateListener(handleTransactionsUpdate)

		loadTransactions()

		// 可以添加一个周期性的刷新功能，但频率应当降低
		const refreshInterval = setInterval(() => {
			if (!isMounted) return

			// 调用getTransactions会触发后台更新检查
			// 如果有更新，监听器会自动更新UI
			getTransactions()
		}, 300000) // 每5分钟检查一次更新

		// 清理函数
		return () => {
			isMounted = false
			clearInterval(refreshInterval)
			// 移除监听器以防内存泄漏
			removeTransactionUpdateListener(handleTransactionsUpdate)
		}
	}, [handleTransactionsUpdate]) // 空依赖数组确保只执行一次

	// 刷新交易列表的函数 - 用于添加新交易后调用
	const refreshTransactions = useCallback(async () => {
		try {
			const updatedTransactions = await getTransactions()
			setTransactions(updatedTransactions)
		} catch (error) {
			console.error("Error refreshing transactions:", error)
		}
	}, [])

	// Quick access years (8 years with current year in the middle)
	const [quickYears, setQuickYears] = useState<number[]>([])

	// Initialize quick years
	useEffect(() => {
		setQuickYears([
			currentYear - 3,
			currentYear - 2,
			currentYear - 1,
			currentYear,
			currentYear + 1,
			currentYear + 2,
			currentYear + 3,
			currentYear + 4,
		])
	}, [currentYear])

	// 处理自定义年份提交
	const handleCustomYearSubmit = () => {
		if (customYear) {
			const year = parseInt(customYear)

			// 更新quickYears数组，将自定义年份添加到开头
			const updatedQuickYears = [...quickYears]
			updatedQuickYears.unshift(year)
			updatedQuickYears.pop() // 移除最后一个年份
			setQuickYears(updatedQuickYears)

			// 更新选中的年份
			setSelectedDate((prev) => ({ ...prev, year }))
			setCustomYear("")
		}
	}

	// Format the displayed date string
	const displayDate = useMemo(() => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		]

		if (selectedDate.month === null) {
			return `${selectedDate.year}`
		}
		return `${months[selectedDate.month]} ${selectedDate.year}`
	}, [selectedDate])

	// 处理从URL初始化的日期选择
	const handleDateSelect = useCallback((date: DateSelection) => {
		setSelectedDate(date)
	}, [])

	// 打开新交易Modal
	const openTransactionModal = () => {
		setShowTransactionModal(true)
	}

	// 处理添加新交易
	const handleAddNewTransaction = async (form: TransactionForm) => {
		// 验证输入
		if (!form.category || !form.amount || !form.date) {
			alert("Please fill in all required fields!")
			return
		}

		const amount = parseFloat(form.amount)
		if (isNaN(amount) || amount <= 0) {
			alert("Please enter a valid amount greater than zero!")
			return
		}

		try {
			// 注意：直接使用form.date来避免时区转换问题
			const dateParts = form.date.split("-")
			const year = parseInt(dateParts[0])
			const month = parseInt(dateParts[1])
			const day = parseInt(dateParts[2])

			// 使用用户输入的日期值手动构建日期字符串，确保月份和日期保持两位数格式
			const formattedDate = `${month.toString().padStart(2, "0")}.${day
				.toString()
				.padStart(2, "0")}.${year}`

			// 准备星期几 - 手动计算星期几而不依赖Date对象的时区问题
			// Zeller's Congruence算法计算星期几
			let adjustedMonth = month
			let adjustedYear = year
			if (month < 3) {
				adjustedMonth += 12
				adjustedYear -= 1
			}
			const h =
				(day +
					Math.floor((13 * (adjustedMonth + 1)) / 5) +
					adjustedYear +
					Math.floor(adjustedYear / 4) -
					Math.floor(adjustedYear / 100) +
					Math.floor(adjustedYear / 400)) %
				7

			// 转换h到对应的星期名称 (0=Sat, 1=Sun, ..., 6=Fri)
			const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
			const dayName = days[h]

			// 创建新交易对象
			const newTransaction: Omit<Transaction, "id"> = {
				date: formattedDate,
				day: dayName,
				category: form.category,
				note: form.note || "No note",
				amount: form.isExpense ? -amount : amount, // 支出为负，收入为正
			}

			// 调用API添加交易
			const result = await addTransaction(newTransaction)

			if (result) {
				// 刷新交易列表
				await refreshTransactions()
			}
		} catch (error) {
			console.error("Failed to add transaction:", error)
			alert("Failed to add transaction. Please try again.")
		}
	}

	// Filter transactions based on selected date
	const filteredTransactions = useMemo(() => {
		// 首先过滤出符合当前所选年月的交易
		const filtered = transactions.filter((transaction) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const [month, day, year] = transaction.date
				.split(".")
				.map((part) => parseInt(part))

			// If only year is selected, show all transactions from that year
			if (selectedDate.month === null) {
				return year === selectedDate.year
			}

			// If month is also selected, filter by both year and month
			return year === selectedDate.year && month === selectedDate.month + 1
		})

		// 然后按日期从低到高排序（较早的日期显示在前面）
		return filtered.sort((a, b) => {
			// 解析日期字符串，格式为"MM.DD.YYYY"
			const [aMonth, aDay, aYear] = a.date
				.split(".")
				.map((part) => parseInt(part))
			const [bMonth, bDay, bYear] = b.date
				.split(".")
				.map((part) => parseInt(part))

			// 先比较年
			if (aYear !== bYear) return aYear - bYear
			// 年相同则比较月
			if (aMonth !== bMonth) return aMonth - bMonth
			// 月相同则比较日
			return aDay - bDay
		})
	}, [transactions, selectedDate])

	// Calculate monthly expenses, income and balance
	const financialSummary = useMemo(() => {
		let totalExpense = 0
		let totalIncome = 0

		filteredTransactions.forEach((transaction) => {
			if (transaction.amount < 0) {
				totalExpense += Math.abs(transaction.amount)
			} else {
				totalIncome += transaction.amount
			}
		})

		const balance = totalIncome - totalExpense

		return {
			expense: totalExpense,
			income: totalIncome,
			balance: balance,
		}
	}, [filteredTransactions])

	// Close modal when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const modal = document.getElementById("date-modal")
			if (modal && !modal.contains(event.target as Node) && showDateModal) {
				setShowDateModal(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [showDateModal])

	// 添加自动调整高度的函数
	const adjustTextareaHeight = useCallback(() => {
		const textarea = textareaRef.current
		if (textarea) {
			// 重置高度以便准确计算
			textarea.style.height = "auto"

			// 计算新高度，并限制在最小和最大高度之间
			// 确保初始高度足够显示占位符
			const minHeight = 60 // 提高最小高度，确保能显示两行占位符
			const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), 80)
			textarea.style.height = `${newHeight}px`

			// 设置overflow，当内容超出最大高度时允许滚动
			textarea.style.overflowY = textarea.scrollHeight > 80 ? "auto" : "hidden"
		}
	}, [])

	// 监听输入变化自动调整高度，并确保组件挂载时也调整一次
	useEffect(() => {
		adjustTextareaHeight()

		// 添加一个小延迟，确保在DOM完全渲染后再次调整
		const timer = setTimeout(() => {
			adjustTextareaHeight()
		}, 10)

		return () => clearTimeout(timer)
	}, [inputMessage, adjustTextareaHeight])

	// 处理输入变化
	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInputMessage(e.target.value)
	}

	// 修改输入提交的处理函数
	const handleInputSubmit = async () => {
		if (!inputMessage.trim()) {
			// 如果输入为空，打开常规交易modal
			openTransactionModal()
			return
		}

		// 添加发送GET请求的逻辑
		try {
			setIsApiSending(true)
			// 编码输入内容
			const encodedPrompt = encodeURIComponent(inputMessage.trim())
			// 发送GET请求
			const response = await fetch(`${API_DOMAIN}/genai/${encodedPrompt}`)

			if (!response.ok) {
				throw new Error(`API请求失败: ${response.status}`)
			}

			const data = await response.json()
			console.log("API响应:", data)

			// 请求成功后清空输入框
			setInputMessage("")

			// 请求成功后，刷新交易数据和UI
			await refreshTransactions()
		} catch (error) {
			console.error("API请求出错:", error)
			alert("发送请求失败，请重试。")
		} finally {
			setIsApiSending(false)
		}

		/* 注释掉原来的解析逻辑
		try {
			setIsParsingInput(true)
			// Call API to parse natural language input
			const transactions = await parseNaturalLanguage(inputMessage.trim())

			if (transactions.length === 0) {
				// If no transactions recognized, show message
				alert(
					"No transactions could be identified from your input. Please try again or use the form to add manually."
				)
				return
			}

			// Set parsed transactions and open batch modal
			setParsedTransactions(transactions)
			setShowBatchModal(true)
		} catch (error) {
			console.error("Failed to parse input:", error)
			alert("Failed to process your input. Please try again.")
		} finally {
			setIsParsingInput(false)
		}
		*/
	}

	// 处理编辑交易
	const handleEditTransaction = async (form: TransactionForm) => {
		if (!editingTransaction) return

		// 验证输入
		if (!form.category || !form.amount || !form.date) {
			alert("Please fill in all required fields!")
			return
		}

		const amount = parseFloat(form.amount)
		if (isNaN(amount) || amount <= 0) {
			alert("Please enter a valid amount greater than zero!")
			return
		}

		try {
			// 注意：直接使用form.date来避免时区转换问题
			const dateParts = form.date.split("-")
			const year = parseInt(dateParts[0])
			const month = parseInt(dateParts[1])
			const day = parseInt(dateParts[2])

			// 使用用户输入的日期值手动构建日期字符串，确保月份和日期保持两位数格式
			const formattedDate = `${month.toString().padStart(2, "0")}.${day
				.toString()
				.padStart(2, "0")}.${year}`

			// 准备星期几 - 手动计算星期几而不依赖Date对象的时区问题
			// Zeller's Congruence算法计算星期几
			let adjustedMonth = month
			let adjustedYear = year
			if (month < 3) {
				adjustedMonth += 12
				adjustedYear -= 1
			}
			const h =
				(day +
					Math.floor((13 * (adjustedMonth + 1)) / 5) +
					adjustedYear +
					Math.floor(adjustedYear / 4) -
					Math.floor(adjustedYear / 100) +
					Math.floor(adjustedYear / 400)) %
				7

			// 转换h到对应的星期名称 (0=Sat, 1=Sun, ..., 6=Fri)
			const days = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
			const dayName = days[h]

			// 创建更新后的交易对象
			const updatedTransaction: Transaction = {
				...editingTransaction,
				date: formattedDate,
				day: dayName,
				category: form.category,
				note: form.note || "No note",
				amount: form.isExpense ? -Math.abs(amount) : Math.abs(amount),
			}

			// 调用API更新交易
			const result = await updateTransaction(updatedTransaction)

			if (result) {
				// 刷新交易列表
				await refreshTransactions()
				setEditingTransaction(null)
			}
		} catch (error) {
			console.error("Failed to update transaction:", error)
			alert("Failed to update transaction. Please try again.")
		}
	}

	// 处理删除交易
	const handleDeleteTransaction = async () => {
		if (!deletingTransactionId) return

		try {
			const success = await deleteTransaction(deletingTransactionId)
			if (success) {
				// 刷新交易列表
				await refreshTransactions()
			} else {
				alert("Failed to delete transaction. Please try again.")
			}
		} catch (error) {
			console.error("Failed to delete transaction:", error)
			alert("Failed to delete transaction. Please try again.")
		} finally {
			setDeletingTransactionId(null)
		}
	}

	// 为编辑准备表单数据
	const prepareFormDataFromTransaction = (
		transaction: Transaction
	): Partial<TransactionForm> => {
		const isExpense = transaction.amount < 0
		const dateParts = transaction.date.split(".")
		const dateString = `${dateParts[2]}-${dateParts[0].padStart(
			2,
			"0"
		)}-${dateParts[1].padStart(2, "0")}`

		return {
			category: transaction.category,
			note: transaction.note,
			amount: Math.abs(transaction.amount).toString(),
			date: dateString,
			isExpense: isExpense,
		}
	}

	// 打开删除确认对话框
	const confirmDelete = (transactionId: string) => {
		setDeletingTransactionId(transactionId)
		setShowDeleteModal(true)
	}

	return (
		<div className="flex flex-col h-full relative">
			{/* 使用Suspense包装useSearchParams钩子 */}
			<Suspense fallback={null}>
				<DateSelector onDateSelect={handleDateSelect} />
			</Suspense>

			{/* Header with background image - fixed height */}
			<div className="relative min-h-[210px] max-h-[210px] overflow-hidden rounded-t-xl">
				<div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600">
					<Image
						src="/cappadocia.jpg"
						alt="Background"
						layout="fill"
						objectFit="cover"
						className="opacity-40 mix-blend-overlay"
						priority
					/>
				</div>

				{/* Top navigation */}
				<div className="relative flex justify-between items-center p-4">
					{/* Left side - Menu button */}
					<div className="w-10">
						<button className="text-white hover:bg-white/10 p-2 rounded-full transition">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
					</div>

					{/* Center - Date selector */}
					<div className="absolute left-1/2 transform -translate-x-1/2">
						<button
							onClick={() => setShowDateModal(true)}
							className="text-white text-xl font-semibold hover:bg-white/10 px-4 py-1 rounded-full transition"
						>
							{displayDate}
						</button>
					</div>

					{/* Right side - Icons */}
					<div className="flex space-x-2 w-10 justify-end">
						{/* Calendar button */}
						<button className="text-white hover:bg-white/10 p-2 rounded-full transition">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</button>
						{/* Chart/Statistics button */}
						<button className="text-white hover:bg-white/10 p-2 rounded-full transition">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Financial summary */}
				<div className="relative px-6 pb-4">
					<div className="text-white/80 text-sm font-medium">
						MONTHLY EXPENSES
					</div>
					<div className="text-white text-3xl font-bold mt-1">
						${financialSummary.expense.toFixed(2)}
					</div>

					<div className="flex justify-between mt-2 text-white/80 text-sm">
						<div className="flex flex-col">
							<span>MONTHLY INCOME</span>
							<span className="font-semibold text-white text-base">
								${financialSummary.income.toFixed(2)}
							</span>
						</div>
						<div className="flex flex-col">
							<span>MONTHLY BALANCE</span>
							<span
								className={`font-semibold text-base ${
									financialSummary.balance >= 0
										? "text-green-300"
										: "text-red-300"
								}`}
							>
								{financialSummary.balance >= 0 ? "+" : ""}$
								{financialSummary.balance.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content wrapper - scrollable area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Budget section */}
				<div className="bg-white rounded-b-xl flex-grow overflow-y-auto">
					<div className="pt-4 px-6">
						{/* 暂时注释掉Budget部分
						<div className="flex justify-between items-center mb-4">
							<div className="text-lg font-bold text-gray-800">Budget</div>
							<button className="p-1.5 hover:bg-gray-100 rounded-full transition">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 text-gray-500"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
									/>
								</svg>
							</button>
						</div>

						<div className="h-2 bg-gray-100 rounded-full mb-3">
							<div className="h-2 bg-green-400 rounded-full w-1/5"></div>
						</div>

						<div className="flex justify-between text-gray-500 text-sm mb-8">
							<div>Remaining: --</div>
							<div>Total: Not Set</div>
						</div>
						*/}

						{/* Transactions list */}
						<div className="space-y-6 pb-24">
							{isLoading ? (
								<div className="flex justify-center py-10">
									<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
								</div>
							) : filteredTransactions.length > 0 ? (
								filteredTransactions.map((transaction) => (
									<div key={transaction.id} className="transition-all">
										<div className="flex justify-between items-center mb-2">
											<div className="text-md font-medium text-gray-700">
												{transaction.date} {transaction.day}
											</div>
											<div className="text-md font-medium text-gray-700">
												{transaction.amount < 0 ? "Exp" : "Inc"}: $
												{Math.abs(transaction.amount).toFixed(2)}
											</div>
										</div>

										<div
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
											onClick={() => setEditingTransaction(transaction)}
										>
											<div className="flex items-center">
												<div
													className={`h-8 w-8 ${
														transaction.amount < 0
															? "bg-red-100"
															: "bg-green-100"
													} rounded-full flex items-center justify-center mr-3`}
												>
													<div
														className={`h-2 w-2 ${
															transaction.amount < 0
																? "bg-red-500"
																: "bg-green-500"
														} rounded-full`}
													></div>
												</div>
												<div>
													<div className="font-medium text-gray-800">
														{transaction.category}
													</div>
													<div className="text-gray-500 text-sm">
														{transaction.note}
													</div>
												</div>
											</div>
											<div className="flex items-center">
												<div
													className={`font-medium ${
														transaction.amount < 0
															? "text-red-500"
															: "text-green-500"
													} mr-3`}
												>
													{transaction.amount < 0 ? "-" : "+"}$
													{Math.abs(transaction.amount).toFixed(2)}
												</div>
												<button
													className="p-1 text-gray-400 hover:text-red-500 rounded-full"
													onClick={(e) => {
														e.stopPropagation() // 防止触发父元素的点击事件
														confirmDelete(transaction.id)
													}}
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
														/>
													</svg>
												</button>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-10">
									<div className="text-gray-400">
										No transactions found for this period
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Input box at the bottom */}
				<div className="sticky bottom-0 w-full p-4 bg-white border-t border-gray-100 shadow-md">
					<div className="flex items-center">
						<textarea
							ref={textareaRef}
							value={inputMessage}
							onChange={handleInputChange}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault() // 防止换行
									handleInputSubmit()
								}
							}}
							placeholder='Enter the operation you want to perform on the ledger, or simply click the "Add" button to manually add a transaction.'
							className="flex-grow px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 resize-none min-h-[60px] max-h-[80px] overflow-hidden break-words whitespace-pre-wrap"
							rows={2}
						/>
						{/* 根据输入框内容改变按钮样式和功能 */}
						<button
							onClick={handleInputSubmit}
							className="ml-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
							disabled={isApiSending}
						>
							{isApiSending ? (
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
							) : inputMessage.trim() ? (
								// 不为空时显示发送图标
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							) : (
								// 为空时显示添加图标
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Date Selection Modal */}
			<DateSelectionModal
				isOpen={showDateModal}
				onClose={() => setShowDateModal(false)}
				selectedDate={selectedDate}
				onDateChange={setSelectedDate}
				quickYears={quickYears}
				customYear={customYear}
				onCustomYearChange={(value) => {
					setCustomYear(value.replace(/\D/g, ""))
				}}
				onCustomYearSubmit={handleCustomYearSubmit}
			/>

			{/* New Transaction Modal */}
			<NewTransactionModal
				isOpen={showTransactionModal}
				onClose={() => setShowTransactionModal(false)}
				onSubmit={handleAddNewTransaction}
				expenseCategories={EXPENSE_CATEGORIES}
				incomeCategories={INCOME_CATEGORIES}
			/>

			{/* Edit Transaction Modal */}
			{editingTransaction && (
				<NewTransactionModal
					isOpen={true}
					onClose={() => setEditingTransaction(null)}
					onSubmit={handleEditTransaction}
					initialForm={prepareFormDataFromTransaction(editingTransaction)}
					expenseCategories={EXPENSE_CATEGORIES}
					incomeCategories={INCOME_CATEGORIES}
					isEditing={true}
				/>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDeleteTransaction}
				title="Delete Transaction"
				message="Are you sure you want to delete this transaction? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</div>
	)
}

export default ExpenseTracker

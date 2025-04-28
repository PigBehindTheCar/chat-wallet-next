"use client"

import React, {
	useState,
	useMemo,
	useEffect,
	useCallback,
	Suspense,
} from "react"
import Image from "next/image"
import {
	Transaction,
	getTransactions,
	addTransaction,
	addTransactionUpdateListener,
	removeTransactionUpdateListener,
} from "@/app/services/transactionService"
import { useRouter, useSearchParams } from "next/navigation"
import DateSelectionModal from "./DateSelectionModal"
import NewTransactionModal from "./NewTransactionModal"

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

	const [inputMessage, setInputMessage] = useState("")
	const [showDateModal, setShowDateModal] = useState(false)
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// 新交易Modal状态
	const [showTransactionModal, setShowTransactionModal] = useState(false)

	// 新交易表单数据
	const [transactionForm, setTransactionForm] = useState<TransactionForm>({
		category: EXPENSE_CATEGORIES[0],
		note: "",
		amount: "",
		date: new Date().toISOString().split("T")[0], // 今天的日期，格式：YYYY-MM-DD
		isExpense: true, // 默认为支出
	})

	// 当前年月
	const currentYear = new Date().getFullYear()
	const currentMonth = new Date().getMonth()

	// 默认使用当前日期，稍后由DateSelector根据URL参数更新
	const [selectedDate, setSelectedDate] = useState<DateSelection>({
		year: currentYear,
		month: currentMonth,
	})

	const [customYear, setCustomYear] = useState<string>("")

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
	}, []) // 空依赖数组确保只执行一次

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

	// Handle custom year input
	const handleCustomYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Allow only numbers
		const value = e.target.value.replace(/\D/g, "")
		setCustomYear(value)
	}

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

	// Month names
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

	// Format the displayed date string
	const displayDate = useMemo(() => {
		if (selectedDate.month === null) {
			return `${selectedDate.year}`
		}
		return `${months[selectedDate.month]} ${selectedDate.year}`
	}, [selectedDate, months])

	// 处理从URL初始化的日期选择
	const handleDateSelect = useCallback((date: DateSelection) => {
		setSelectedDate(date)
	}, [])

	// 打开新交易Modal
	const openTransactionModal = () => {
		// 重置表单数据
		setTransactionForm({
			category: EXPENSE_CATEGORIES[0],
			note: "",
			amount: "",
			date: new Date().toISOString().split("T")[0],
			isExpense: true,
		})
		setShowTransactionModal(true)
	}

	// 关闭新交易Modal
	const closeTransactionModal = () => {
		setShowTransactionModal(false)
	}

	// 处理交易类型切换（支出/收入）
	const handleTransactionTypeChange = (isExpense: boolean) => {
		setTransactionForm((prev) => ({
			...prev,
			isExpense,
			// 切换类型时同时更新类别为新类型的第一个选项
			category: isExpense ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
		}))
	}

	// 处理表单字段变化
	const handleFormChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target

		// 特殊处理金额字段，只允许输入数字和小数点
		if (name === "amount") {
			// 只接受数字和最多一个小数点
			const regex = /^(\d*\.?\d{0,2})?$/
			if (value === "" || regex.test(value)) {
				setTransactionForm((prev) => ({ ...prev, [name]: value }))
			}
			return
		}

		setTransactionForm((prev) => ({ ...prev, [name]: value }))
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
			// 准备日期格式
			const dateObj = new Date(form.date)
			const month = dateObj.getMonth() + 1
			const day = dateObj.getDate()
			const year = dateObj.getFullYear()
			const formattedDate = `${month}.${day}.${year}`

			// 准备星期几
			const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
			const dayName = days[dateObj.getDay()]

			// 创建交易对象，根据isExpense决定金额的正负
			const newTransaction = {
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
		return transactions.filter((transaction) => {
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

	// 处理按回车键添加交易
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleAddNewTransaction(transactionForm)
		}
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

										<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
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
											<div
												className={`font-medium ${
													transaction.amount < 0
														? "text-red-500"
														: "text-green-500"
												}`}
											>
												{transaction.amount < 0 ? "-" : "+"}$
												{Math.abs(transaction.amount).toFixed(2)}
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
						<input
							type="text"
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							placeholder="Search transactions... (Coming soon)"
							className="flex-grow px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
							disabled
						/>
						{/* Add transaction button */}
						<button
							onClick={openTransactionModal}
							className="ml-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
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
		</div>
	)
}

export default ExpenseTracker

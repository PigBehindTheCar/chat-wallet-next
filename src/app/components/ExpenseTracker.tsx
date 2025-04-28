"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"

interface Transaction {
	id: string
	date: string
	day: string
	category: string
	note: string
	amount: number // positive for income, negative for expense
}

interface DateSelection {
	year: number
	month: number | null
}

const ExpenseTracker: React.FC = () => {
	const [inputMessage, setInputMessage] = useState("")
	const [showDateModal, setShowDateModal] = useState(false)
	const [selectedDate, setSelectedDate] = useState<DateSelection>({
		year: new Date().getFullYear(),
		month: new Date().getMonth(), // Current month (0-based)
	})
	const [customYear, setCustomYear] = useState<string>("")

	// Current year
	const currentYear = new Date().getFullYear()

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

	const handleCustomYearSubmit = () => {
		if (customYear) {
			const year = parseInt(customYear)
			// Validate year is within a reasonable range (e.g., 1900-2100)
			if (year >= 1900 && year <= 2100) {
				// Replace the first quick year with the custom year
				const updatedQuickYears = [...quickYears]
				updatedQuickYears.unshift(year)
				updatedQuickYears.pop() // Remove the last year
				setQuickYears(updatedQuickYears)

				// Set the selected date to the custom year
				setSelectedDate((prev) => ({ ...prev, year }))
				setCustomYear("")
			}
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

	const allTransactions: Transaction[] = [
		{
			id: "1",
			date: "10.22.2024",
			day: "Tue",
			category: "Groceries",
			note: "Weekly shopping",
			amount: -50.0, // expense
		},
		{
			id: "2",
			date: "10.22.2024",
			day: "Tue",
			category: "Meals",
			note: "Lunch with colleagues",
			amount: -25.67, // expense
		},
		{
			id: "3",
			date: "10.16.2024",
			day: "Wed",
			category: "Groceries",
			note: "Household items",
			amount: -14.03, // expense
		},
		{
			id: "4",
			date: "10.15.2024",
			day: "Tue",
			category: "Meals",
			note: "Dinner delivery",
			amount: -540.0, // expense
		},
		{
			id: "5",
			date: "10.12.2024",
			day: "Sat",
			category: "Salary",
			note: "Monthly salary",
			amount: 3000.0, // income
		},
		{
			id: "6",
			date: "10.10.2024",
			day: "Thu",
			category: "Groceries",
			note: "Fresh produce",
			amount: -46.0, // expense
		},
		{
			id: "7",
			date: "09.25.2024",
			day: "Wed",
			category: "Utilities",
			note: "Electricity bill",
			amount: -120.45, // expense
		},
		{
			id: "8",
			date: "09.15.2024",
			day: "Sun",
			category: "Salary",
			note: "Monthly salary",
			amount: 3000.0, // income
		},
	]

	// Filter transactions based on selected date
	const transactions = useMemo(() => {
		return allTransactions.filter((transaction) => {
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
	}, [allTransactions, selectedDate])

	// Calculate monthly expenses, income and balance
	const financialSummary = useMemo(() => {
		let totalExpense = 0
		let totalIncome = 0

		transactions.forEach((transaction) => {
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
	}, [transactions])

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

	return (
		<div className="flex flex-col h-full relative">
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
					{/* Menu button (hamburger icon) */}
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

					{/* Date selector (clickable) */}
					<button
						onClick={() => setShowDateModal(true)}
						className="text-white text-xl font-semibold hover:bg-white/10 px-4 py-1 rounded-full transition"
					>
						{displayDate}
					</button>

					<div className="flex space-x-2">
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
							{transactions.length > 0 ? (
								transactions.map((transaction) => (
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
							placeholder="Enter a new transaction..."
							className="flex-grow px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
						/>
						{/* Add transaction button */}
						<button className="ml-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
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
			{showDateModal && (
				<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 z-30">
					<div
						id="date-modal"
						className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90%] max-h-[90%] overflow-y-auto"
					>
						<div className="flex justify-between items-center mb-5">
							<h3 className="text-lg font-bold text-gray-800">Select Period</h3>
							<button
								className="text-gray-500 hover:text-gray-700"
								onClick={() => setShowDateModal(false)}
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Custom Year Input */}
						<div className="mb-5">
							<h4 className="text-sm font-medium text-gray-600 mb-2">
								Custom Year
							</h4>
							<div className="flex">
								<input
									type="text"
									value={customYear}
									onChange={handleCustomYearChange}
									placeholder="Enter year..."
									className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
									maxLength={4}
								/>
								<button
									onClick={handleCustomYearSubmit}
									className="px-3 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
								>
									Set
								</button>
							</div>
						</div>

						{/* Quick Year Selection */}
						<div className="mb-5">
							<h4 className="text-sm font-medium text-gray-600 mb-2">
								Quick Select
							</h4>
							<div className="grid grid-cols-4 gap-2">
								{quickYears.map((year, index) => (
									<button
										key={`quick-${year}-${index}`}
										className={`py-2 rounded-lg text-sm font-medium ${
											selectedDate.year === year
												? "bg-indigo-600 text-white"
												: "bg-gray-100 text-gray-800 hover:bg-gray-200"
										}`}
										onClick={() =>
											setSelectedDate((prev) => ({ ...prev, year }))
										}
									>
										{year}
									</button>
								))}
							</div>
						</div>

						{/* Month Selection */}
						<div>
							<div className="flex justify-between items-center mb-2">
								<h4 className="text-sm font-medium text-gray-600">Month</h4>
								<button
									className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
									onClick={() =>
										setSelectedDate((prev) => ({ ...prev, month: null }))
									}
								>
									Show All Year
								</button>
							</div>
							<div className="grid grid-cols-3 gap-2">
								{months.map((month, index) => (
									<button
										key={month}
										className={`py-2 px-1 rounded-lg text-sm ${
											selectedDate.month === index
												? "bg-indigo-600 text-white"
												: "bg-gray-100 text-gray-800 hover:bg-gray-200"
										}`}
										onClick={() =>
											setSelectedDate((prev) => ({ ...prev, month: index }))
										}
									>
										{month.substring(0, 3)}
									</button>
								))}
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
								onClick={() => setShowDateModal(false)}
							>
								Apply
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default ExpenseTracker

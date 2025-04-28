"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"

interface Transaction {
	id: string
	date: string
	day: string
	category: string
	merchant: string
	amount: number // positive for income, negative for expense
}

const ExpenseTracker: React.FC = () => {
	const [inputMessage, setInputMessage] = useState("")

	const transactions: Transaction[] = [
		{
			id: "1",
			date: "10.22",
			day: "Tue",
			category: "Groceries",
			merchant: "Walmart",
			amount: -50.0, // expense
		},
		{
			id: "2",
			date: "10.22",
			day: "Tue",
			category: "Meals",
			merchant: "Panda Express",
			amount: -25.67, // expense
		},
		{
			id: "3",
			date: "10.16",
			day: "Wed",
			category: "Groceries",
			merchant: "Walmart",
			amount: -14.03, // expense
		},
		{
			id: "4",
			date: "10.15",
			day: "Tue",
			category: "Meals",
			merchant: "Uber Eats",
			amount: -540.0, // expense
		},
		{
			id: "5",
			date: "10.12",
			day: "Sat",
			category: "Salary",
			merchant: "Company",
			amount: 3000.0, // income
		},
		{
			id: "6",
			date: "10.10",
			day: "Thu",
			category: "Groceries",
			merchant: "Walmart",
			amount: -46.0, // expense
		},
	]

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

	return (
		<div className="flex flex-col h-full relative">
			{/* Header with background image */}
			<div className="relative h-96 overflow-hidden rounded-t-xl">
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

					<div className="text-white text-xl font-semibold">October 2024</div>

					<div className="flex space-x-2">
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
				<div className="relative px-6 pb-6 pt-2">
					<div className="text-white/80 text-sm font-medium">
						MONTHLY EXPENSES
					</div>
					<div className="text-white text-4xl font-bold mt-1">
						${financialSummary.expense.toFixed(2)}
					</div>

					<div className="flex justify-between mt-5 text-white/80 text-sm">
						<div className="flex flex-col">
							<span>MONTHLY INCOME</span>
							<span className="font-semibold text-white text-lg">
								${financialSummary.income.toFixed(2)}
							</span>
						</div>
						<div className="flex flex-col">
							<span>MONTHLY BALANCE</span>
							<span
								className={`font-semibold text-lg ${
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
					<div className="space-y-6 pb-6">
						{transactions.map((transaction) => (
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
												transaction.amount < 0 ? "bg-red-100" : "bg-green-100"
											} rounded-full flex items-center justify-center mr-3`}
										>
											<div
												className={`h-2 w-2 ${
													transaction.amount < 0 ? "bg-red-500" : "bg-green-500"
												} rounded-full`}
											></div>
										</div>
										<div>
											<div className="font-medium text-gray-800">
												{transaction.category}
											</div>
											<div className="text-gray-500 text-sm">
												{transaction.merchant}
											</div>
										</div>
									</div>
									<div
										className={`font-medium ${
											transaction.amount < 0 ? "text-red-500" : "text-green-500"
										}`}
									>
										{transaction.amount < 0 ? "-" : "+"}$
										{Math.abs(transaction.amount).toFixed(2)}
									</div>
								</div>
							</div>
						))}
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
	)
}

export default ExpenseTracker

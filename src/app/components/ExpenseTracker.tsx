"use client"

import React from "react"
import Image from "next/image"

interface Transaction {
	id: string
	date: string
	day: string
	category: string
	merchant: string
	amount: number
}

const ExpenseTracker: React.FC = () => {
	// Mock data (would come from props or API in real implementation)
	const monthlyExpense = 1278.4
	const monthlyIncome = 0.0
	const monthlyBalance = -1278.4

	const transactions: Transaction[] = [
		{
			id: "1",
			date: "10.22",
			day: "周二",
			category: "日用品",
			merchant: "Walmart",
			amount: 50.0,
		},
		{
			id: "2",
			date: "10.22",
			day: "周二",
			category: "三餐",
			merchant: "panda express",
			amount: 25.67,
		},
		{
			id: "3",
			date: "10.16",
			day: "周三",
			category: "日用品",
			merchant: "walmart",
			amount: 14.03,
		},
		{
			id: "4",
			date: "10.15",
			day: "周二",
			category: "三餐",
			merchant: "uber eats",
			amount: 540.0,
		},
		{
			id: "5",
			date: "10.10",
			day: "周四",
			category: "日用品",
			merchant: "Walmart",
			amount: 46.0,
		},
	]

	return (
		<div className="flex flex-col h-full overflow-y-auto">
			{/* Header with background image */}
			<div className="relative h-48 overflow-hidden">
				<div className="absolute inset-0">
					<Image
						src="/cappadocia.jpg"
						alt="Background"
						layout="fill"
						objectFit="cover"
						priority
					/>
				</div>

				{/* Top navigation */}
				<div className="relative flex justify-between items-center p-4">
					<button className="text-white">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
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

					<div className="text-white text-xl font-semibold">2024-10</div>

					<div className="flex space-x-4">
						<button className="text-white">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
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
						<button className="text-white">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
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
				<div className="relative px-6 pt-10">
					<div className="text-white text-lg">月支出</div>
					<div className="text-white text-5xl font-bold mt-1">$1,278.40</div>

					<div className="flex justify-between mt-4 text-white">
						<div>月收入 $0.00</div>
						<div>本月结余 -$1,278.40</div>
					</div>
				</div>
			</div>

			{/* Budget section */}
			<div className="bg-white rounded-t-3xl -mt-5 flex-grow">
				<div className="p-6">
					<div className="flex justify-between items-center mb-4">
						<div className="text-lg font-bold">预算</div>
						<button>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 text-gray-400"
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

					<div className="h-2 bg-gray-100 rounded-full mb-4">
						<div className="h-2 bg-green-200 rounded-full w-1/5"></div>
					</div>

					<div className="flex justify-between text-gray-500 mb-6">
						<div>剩余: --</div>
						<div>总额: 未设置</div>
					</div>

					{/* Transactions list */}
					{transactions.map((transaction, idx) => (
						<React.Fragment key={transaction.id}>
							<div className="flex justify-between items-center py-3">
								<div className="text-lg font-medium">
									{transaction.date} {transaction.day}
								</div>
								<div className="text-lg font-medium">
									支:${transaction.amount.toFixed(2)}
								</div>
							</div>

							<div className="flex items-center justify-between py-2">
								<div className="flex items-center">
									<div className="h-2 w-2 bg-red-500 rounded-full mr-4"></div>
									<div>
										<div className="font-medium">{transaction.category}</div>
										<div className="text-gray-500">{transaction.merchant}</div>
									</div>
								</div>
								<div className="text-red-500 text-lg">
									-${transaction.amount.toFixed(2)}
								</div>
							</div>

							{idx < transactions.length - 1 && (
								<div className="border-b border-gray-100 my-2"></div>
							)}
						</React.Fragment>
					))}
				</div>

				{/* Add button */}
				<div className="fixed bottom-1/2 right-6 transform translate-y-6">
					<button className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
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

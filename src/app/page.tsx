"use client"

import ExpenseTracker from "@/app/components/ExpenseTracker"
import ChatInterface from "@/app/components/ChatInterface"

export default function Home() {
	return (
		<div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<div className="py-4 px-6 bg-white shadow-sm">
				<h1 className="text-xl font-bold text-indigo-800">智能记账助手</h1>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
				{/* Account book section */}
				<div className="md:w-1/2 h-[calc(100vh-8rem)] md:h-auto rounded-xl shadow-md bg-white overflow-hidden">
					<ExpenseTracker />
				</div>

				{/* Chat interface section */}
				<div className="md:w-1/2 h-[calc(100vh-8rem)] md:h-auto rounded-xl shadow-md bg-white overflow-hidden">
					<ChatInterface />
				</div>
			</div>
		</div>
	)
}

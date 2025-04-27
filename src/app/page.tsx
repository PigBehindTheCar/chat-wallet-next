"use client"

import ExpenseTracker from "@/app/components/ExpenseTracker"
import ChatInterface from "@/app/components/ChatInterface"

export default function Home() {
	return (
		<div className="flex flex-col h-screen">
			{/* Account book section (top part) */}
			<div className="h-1/2 overflow-y-auto">
				<ExpenseTracker />
			</div>

			{/* Chat interface section (bottom part) */}
			<div className="h-1/2 border-t border-gray-200">
				<ChatInterface />
			</div>
		</div>
	)
}

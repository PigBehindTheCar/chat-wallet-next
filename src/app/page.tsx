"use client"

import ExpenseTracker from "@/app/components/ExpenseTracker"

export default function Home() {
	return (
		<div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Main content */}
			<div className="flex-1 p-4 overflow-hidden">
				{/* Account book section */}
				<div className="h-full w-full max-w-2xl mx-auto rounded-xl shadow-md bg-white overflow-hidden">
					<ExpenseTracker />
				</div>
			</div>
		</div>
	)
}

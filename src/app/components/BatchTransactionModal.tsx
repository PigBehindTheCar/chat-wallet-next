import React, { useState } from "react"
import { Transaction } from "@/app/services/transactionService"
import NewTransactionModal from "./NewTransactionModal"

interface BatchTransactionModalProps {
	isOpen: boolean
	onClose: () => void
	transactions: Transaction[]
	onSubmit: (transactions: Transaction[]) => Promise<void>
	expenseCategories: string[]
	incomeCategories: string[]
}

interface TransactionFormData {
	category: string
	note: string
	amount: string
	date: string
	isExpense: boolean
}

const BatchTransactionModal: React.FC<BatchTransactionModalProps> = ({
	isOpen,
	onClose,
	transactions: initialTransactions,
	onSubmit,
	expenseCategories,
	incomeCategories,
}) => {
	const [transactions, setTransactions] =
		useState<Transaction[]>(initialTransactions)
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Handle clicks outside the modal to close it
	React.useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			const modal = document.getElementById("batch-transaction-modal")
			if (modal && !modal.contains(event.target as Node)) {
				onClose()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen, onClose])

	// Update internal state when initial transactions change
	React.useEffect(() => {
		setTransactions(initialTransactions)
	}, [initialTransactions])

	// Handle batch submission
	const handleBatchSubmit = async () => {
		try {
			setIsSubmitting(true)
			await onSubmit(transactions)
			onClose()
		} catch (error) {
			console.error("Failed to add batch transactions:", error)
			alert("Failed to add transactions. Please try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle editing a single transaction
	const handleEditTransaction = (form: TransactionFormData, index: number) => {
		const updatedTransactions = [...transactions]

		// Prepare date format
		const dateObj = new Date(form.date)
		const month = dateObj.getMonth() + 1
		const day = dateObj.getDate()
		const year = dateObj.getFullYear()
		const formattedDate = `${month}.${day}.${year}`

		// Prepare day of week
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		const dayName = days[dateObj.getDay()]

		// Update the transaction
		updatedTransactions[index] = {
			...updatedTransactions[index],
			date: formattedDate,
			day: dayName,
			category: form.category,
			note: form.note || "No note",
			amount: form.isExpense
				? -Math.abs(parseFloat(form.amount))
				: Math.abs(parseFloat(form.amount)),
		}

		setTransactions(updatedTransactions)
		setEditingIndex(null)
	}

	// Remove transaction
	const handleRemoveTransaction = (index: number) => {
		const updatedTransactions = transactions.filter((_, i) => i !== index)
		setTransactions(updatedTransactions)
	}

	// Prepare form data for editing
	const prepareFormData = (transaction: Transaction): TransactionFormData => {
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

	if (!isOpen) return null

	return (
		<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 z-30">
			<div
				id="batch-transaction-modal"
				className="bg-white rounded-xl shadow-xl p-5 w-[90%] max-w-lg max-h-[90%] overflow-y-auto"
			>
				<div className="flex justify-between items-center mb-5">
					<h3 className="text-lg font-bold text-gray-800">
						Batch Add Transactions
					</h3>
					<button
						className="text-gray-500 hover:text-gray-700"
						onClick={onClose}
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

				<div className="mb-4">
					<p className="text-sm text-gray-600">
						The following transactions were identified from your input. Click
						the edit button to modify details.
					</p>
				</div>

				{/* Transaction list */}
				<div className="space-y-3 max-h-96 overflow-y-auto mb-5">
					{transactions.length === 0 ? (
						<div className="text-center py-4 text-gray-500">
							No recognizable transactions found
						</div>
					) : (
						transactions.map((transaction, index) => (
							<div
								key={transaction.id || index}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
							>
								<div className="flex items-center flex-1 min-w-0">
									<div
										className={`h-8 w-8 ${
											transaction.amount < 0 ? "bg-red-100" : "bg-green-100"
										} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}
									>
										<div
											className={`h-2 w-2 ${
												transaction.amount < 0 ? "bg-red-500" : "bg-green-500"
											} rounded-full`}
										></div>
									</div>
									<div className="min-w-0">
										<div className="font-medium text-gray-800 truncate">
											{transaction.category}
										</div>
										<div className="text-gray-500 text-sm truncate">
											{transaction.note}
										</div>
										<div className="text-gray-400 text-xs">
											{transaction.date}
										</div>
									</div>
								</div>
								<div className="flex items-center ml-2">
									<div
										className={`font-medium ${
											transaction.amount < 0 ? "text-red-500" : "text-green-500"
										} mr-4`}
									>
										{transaction.amount < 0 ? "-" : "+"}$
										{Math.abs(transaction.amount).toFixed(2)}
									</div>
									<div className="flex space-x-1">
										<button
											onClick={() => setEditingIndex(index)}
											className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
												/>
											</svg>
										</button>
										<button
											onClick={() => handleRemoveTransaction(index)}
											className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4"
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
								</div>
							</div>
						))
					)}
				</div>

				{/* Action buttons */}
				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
						disabled={isSubmitting}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleBatchSubmit}
						className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
						disabled={isSubmitting || transactions.length === 0}
					>
						{isSubmitting
							? "Adding..."
							: `Add ${transactions.length} Transactions`}
					</button>
				</div>

				{/* Edit Transaction Modal */}
				{editingIndex !== null && (
					<NewTransactionModal
						isOpen={true}
						onClose={() => setEditingIndex(null)}
						onSubmit={(form) => handleEditTransaction(form, editingIndex)}
						initialForm={prepareFormData(transactions[editingIndex])}
						expenseCategories={expenseCategories}
						incomeCategories={incomeCategories}
					/>
				)}
			</div>
		</div>
	)
}

export default BatchTransactionModal

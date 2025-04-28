import React from "react"

interface TransactionForm {
	category: string
	note: string
	amount: string
	date: string
	isExpense: boolean
}

interface NewTransactionModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (form: TransactionForm) => void
	initialForm?: Partial<TransactionForm>
	expenseCategories: string[]
	incomeCategories: string[]
}

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	initialForm,
	expenseCategories,
	incomeCategories,
}) => {
	const [form, setForm] = React.useState<TransactionForm>({
		category: expenseCategories[0],
		note: "",
		amount: "",
		date: new Date().toISOString().split("T")[0],
		isExpense: true,
		...initialForm,
	})

	// 当initialForm改变时更新form
	React.useEffect(() => {
		if (initialForm) {
			setForm((prev) => ({
				...prev,
				...initialForm,
			}))
		}
	}, [initialForm])

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
				setForm((prev) => ({ ...prev, [name]: value }))
			}
			return
		}

		setForm((prev) => ({ ...prev, [name]: value }))
	}

	// 处理交易类型切换（支出/收入）
	const handleTransactionTypeChange = (isExpense: boolean) => {
		setForm((prev) => ({
			...prev,
			isExpense,
			// 切换类型时同时更新类别为新类型的第一个选项
			category: isExpense ? expenseCategories[0] : incomeCategories[0],
		}))
	}

	// 处理提交
	const handleSubmit = () => {
		onSubmit(form)
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 z-30">
			<div
				id="transaction-modal"
				className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90%] max-h-[90%] overflow-y-auto"
			>
				<div className="flex justify-between items-center mb-5">
					<h3 className="text-lg font-bold text-gray-800">Add Transaction</h3>
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

				{/* Transaction Type Selector */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Transaction Type
					</label>
					<div className="flex space-x-2">
						<button
							type="button"
							className={`flex-1 py-2 px-4 rounded-md ${
								form.isExpense
									? "bg-red-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
							onClick={() => handleTransactionTypeChange(true)}
						>
							Expense
						</button>
						<button
							type="button"
							className={`flex-1 py-2 px-4 rounded-md ${
								!form.isExpense
									? "bg-green-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
							onClick={() => handleTransactionTypeChange(false)}
						>
							Income
						</button>
					</div>
				</div>

				{/* Category */}
				<div className="mb-4">
					<label
						htmlFor="category"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Category
					</label>
					<select
						id="category"
						name="category"
						value={form.category}
						onChange={handleFormChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						{form.isExpense
							? expenseCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
							  ))
							: incomeCategories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
							  ))}
					</select>
				</div>

				{/* Amount */}
				<div className="mb-4">
					<label
						htmlFor="amount"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Amount ($)
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<span className="text-gray-500">$</span>
						</div>
						<input
							type="text"
							id="amount"
							name="amount"
							value={form.amount}
							onChange={handleFormChange}
							placeholder="0.00"
							className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
				</div>

				{/* Date */}
				<div className="mb-4">
					<label
						htmlFor="date"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Date
					</label>
					<input
						type="date"
						id="date"
						name="date"
						value={form.date}
						onChange={handleFormChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				{/* Note */}
				<div className="mb-6">
					<label
						htmlFor="note"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Note (Optional)
					</label>
					<textarea
						id="note"
						name="note"
						value={form.note}
						onChange={handleFormChange}
						placeholder="Add a note for this transaction"
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						className={`px-4 py-2 rounded-md text-white ${
							form.isExpense
								? "bg-red-500 hover:bg-red-600"
								: "bg-green-500 hover:bg-green-600"
						}`}
					>
						Add {form.isExpense ? "Expense" : "Income"}
					</button>
				</div>
			</div>
		</div>
	)
}

export default NewTransactionModal

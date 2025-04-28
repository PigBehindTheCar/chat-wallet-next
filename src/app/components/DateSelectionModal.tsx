import React from "react"

interface DateSelection {
	year: number
	month: number | null
}

interface DateSelectionModalProps {
	isOpen: boolean
	onClose: () => void
	selectedDate: DateSelection
	onDateChange: (date: DateSelection) => void
	quickYears: number[]
	customYear: string
	onCustomYearChange: (value: string) => void
	onCustomYearSubmit: () => void
}

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

const DateSelectionModal: React.FC<DateSelectionModalProps> = ({
	isOpen,
	onClose,
	selectedDate,
	onDateChange,
	quickYears,
	customYear,
	onCustomYearChange,
	onCustomYearSubmit,
}) => {
	// 处理自定义年份输入
	const handleCustomYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "") // 只允许输入数字
		onCustomYearChange(value)
	}

	// 处理自定义年份提交
	const handleSubmitCustomYear = () => {
		if (customYear) {
			onCustomYearSubmit()
		}
	}

	if (!isOpen) return null

	return (
		<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 z-30">
			<div
				id="date-modal"
				className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90%] max-h-[90%] overflow-y-auto"
			>
				<div className="flex justify-between items-center mb-5">
					<h3 className="text-lg font-bold text-gray-800">Select Period</h3>
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

				{/* Custom Year Input */}
				<div className="mb-5">
					<h4 className="text-sm font-medium text-gray-600 mb-2">
						Custom Year
					</h4>
					<div className="flex">
						<input
							type="text"
							value={customYear}
							onChange={handleCustomYearInput}
							placeholder="Enter year..."
							className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							maxLength={4}
						/>
						<button
							onClick={handleSubmitCustomYear}
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
								onClick={() => onDateChange({ ...selectedDate, year })}
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
							onClick={() => onDateChange({ ...selectedDate, month: null })}
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
								onClick={() => onDateChange({ ...selectedDate, month: index })}
							>
								{month.substring(0, 3)}
							</button>
						))}
					</div>
				</div>

				<div className="mt-6 flex justify-end">
					<button
						className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
						onClick={onClose}
					>
						Apply
					</button>
				</div>
			</div>
		</div>
	)
}

export default DateSelectionModal

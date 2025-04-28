import React, { useEffect } from "react"

interface ConfirmationModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title: string
	message: string
	confirmText?: string
	cancelText?: string
	confirmButtonClass?: string
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmButtonClass = "bg-red-500 hover:bg-red-600",
}) => {
	// Handle clicks outside the modal to close it
	useEffect(() => {
		if (!isOpen) return

		const handleClickOutside = (event: MouseEvent) => {
			const modal = document.getElementById("confirmation-modal")
			if (modal && !modal.contains(event.target as Node)) {
				onClose()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/50 z-40">
			<div
				id="confirmation-modal"
				className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90%]"
			>
				<div className="mb-4">
					<h3 className="text-lg font-bold text-gray-800">{title}</h3>
				</div>

				<div className="mb-6">
					<p className="text-gray-600">{message}</p>
				</div>

				<div className="flex justify-end space-x-3">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={() => {
							onConfirm()
							onClose()
						}}
						className={`px-4 py-2 text-white rounded-md ${confirmButtonClass}`}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmationModal

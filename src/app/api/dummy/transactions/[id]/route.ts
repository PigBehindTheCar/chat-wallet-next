import { NextResponse } from "next/server"
import { transactions, Transaction } from "../data"

// 处理删除交易请求
export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const id = params.id

	if (!id) {
		return NextResponse.json(
			{ success: false, message: "Transaction ID is required" },
			{ status: 400 }
		)
	}

	try {
		// 在真实应用中，这里会从数据库中删除数据
		const index = transactions.findIndex((t: Transaction) => t.id === id)

		if (index === -1) {
			return NextResponse.json(
				{ success: false, message: "Transaction not found" },
				{ status: 404 }
			)
		}

		// 从数组中移除事务
		transactions.splice(index, 1)

		return NextResponse.json({
			success: true,
			message: "Transaction deleted successfully",
		})
	} catch (error) {
		console.error("Error deleting transaction:", error)
		return NextResponse.json(
			{ success: false, message: "Failed to delete transaction" },
			{ status: 500 }
		)
	}
}

// 处理更新交易请求
export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const id = params.id

	if (!id) {
		return NextResponse.json(
			{ success: false, message: "Transaction ID is required" },
			{ status: 400 }
		)
	}

	const body = (await request.json()) as Transaction

	try {
		// 在真实应用中，这里会更新数据库中的数据
		const index = transactions.findIndex((t: Transaction) => t.id === id)

		if (index === -1) {
			return NextResponse.json(
				{ success: false, message: "Transaction not found" },
				{ status: 404 }
			)
		}

		// 更新事务
		transactions[index] = {
			...body,
			id, // 确保ID不变
		}

		return NextResponse.json({
			success: true,
			data: transactions[index],
			message: "Transaction updated successfully",
		})
	} catch (error) {
		console.error("Error updating transaction:", error)
		return NextResponse.json(
			{ success: false, message: "Failed to update transaction" },
			{ status: 500 }
		)
	}
}

import { NextResponse } from "next/server"
import { transactions, TransactionRequest, Transaction } from "./data"

// 获取所有交易记录的API路由处理函数
export async function GET() {
	// 模拟API延迟
	await new Promise((resolve) => setTimeout(resolve, 500))

	// 返回所有交易数据
	return NextResponse.json({
		success: true,
		data: transactions,
		timestamp: new Date().toISOString(),
	})
}

// 添加新交易的POST请求处理
export async function POST(request: Request) {
	const body = (await request.json()) as TransactionRequest

	try {
		const newTransaction: Transaction = {
			id: `${transactions.length + 1}`,
			date: body.date,
			day: body.day,
			category: body.category,
			note: body.note,
			amount: body.amount,
		}

		// 在真实应用中，这里会将数据保存到数据库
		transactions.push(newTransaction)

		return NextResponse.json({
			success: true,
			data: newTransaction,
			message: "Transaction added successfully",
		})
	} catch (error) {
		console.error("Error adding transaction:", error)
		return NextResponse.json(
			{ success: false, message: "Failed to add transaction" },
			{ status: 400 }
		)
	}
}

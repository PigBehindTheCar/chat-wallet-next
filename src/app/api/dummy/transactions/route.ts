import { NextResponse } from "next/server"

// 交易数据模型
interface Transaction {
	id: string
	date: string
	day: string
	category: string
	note: string
	amount: number // 正数表示收入，负数表示支出
}

// 新交易请求体接口
interface TransactionRequest {
	date: string
	day: string
	category: string
	note: string
	amount: number
}

// 模拟数据库中的交易数据
const transactions: Transaction[] = [
	{
		id: "1",
		date: "10.22.2024",
		day: "Tue",
		category: "Groceries",
		note: "Weekly shopping",
		amount: -50.0,
	},
	{
		id: "2",
		date: "10.22.2024",
		day: "Tue",
		category: "Meals",
		note: "Lunch with colleagues",
		amount: -25.67,
	},
	{
		id: "3",
		date: "10.16.2024",
		day: "Wed",
		category: "Groceries",
		note: "Household items",
		amount: -14.03,
	},
	{
		id: "4",
		date: "10.15.2024",
		day: "Tue",
		category: "Meals",
		note: "Dinner delivery",
		amount: -540.0,
	},
	{
		id: "5",
		date: "10.12.2024",
		day: "Sat",
		category: "Salary",
		note: "Monthly salary",
		amount: 3000.0,
	},
	{
		id: "6",
		date: "10.10.2024",
		day: "Thu",
		category: "Groceries",
		note: "Fresh produce",
		amount: -46.0,
	},
	{
		id: "7",
		date: "09.25.2024",
		day: "Wed",
		category: "Utilities",
		note: "Electricity bill",
		amount: -120.45,
	},
	{
		id: "8",
		date: "09.15.2024",
		day: "Sun",
		category: "Salary",
		note: "Monthly salary",
		amount: 3000.0,
	},
]

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

// 添加新交易的POST请求处理（实际项目中会添加到数据库）
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
		return NextResponse.json(
			{ success: false, message: "Failed to add transaction" },
			{ status: 400 }
		)
	}
}

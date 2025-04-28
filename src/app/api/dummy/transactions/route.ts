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
export const transactions: Transaction[] = [
	{
		id: "1",
		date: "05.30.2025",
		day: "Fri",
		category: "Shopping",
		note: "Clothing purchase",
		amount: -89.99,
	},
	{
		id: "2",
		date: "05.28.2025",
		day: "Wed",
		category: "Meals",
		note: "Takeout dinner",
		amount: -32.5,
	},
	{
		id: "3",
		date: "05.25.2025",
		day: "Sun",
		category: "Transportation",
		note: "Taxi fare",
		amount: -25.0,
	},
	{
		id: "4",
		date: "05.20.2025",
		day: "Tue",
		category: "Groceries",
		note: "Supermarket shopping",
		amount: -78.35,
	},
	{
		id: "5",
		date: "05.15.2025",
		day: "Thu",
		category: "Salary",
		note: "Monthly salary",
		amount: 4500.0,
	},
	{
		id: "6",
		date: "05.10.2025",
		day: "Sat",
		category: "Entertainment",
		note: "Movie tickets",
		amount: -45.0,
	},
	{
		id: "7",
		date: "05.05.2025",
		day: "Mon",
		category: "Utilities",
		note: "Water and electricity bills",
		amount: -120.8,
	},
	{
		id: "8",
		date: "04.30.2025",
		day: "Wed",
		category: "Rent",
		note: "Apartment rent",
		amount: -1200.0,
	},
	{
		id: "9",
		date: "04.25.2025",
		day: "Fri",
		category: "Healthcare",
		note: "Pharmacy purchase",
		amount: -65.5,
	},
	{
		id: "10",
		date: "04.20.2025",
		day: "Sun",
		category: "Shopping",
		note: "Electronics",
		amount: -299.99,
	},
	{
		id: "11",
		date: "04.15.2025",
		day: "Tue",
		category: "Salary",
		note: "Monthly salary",
		amount: 4500.0,
	},
	{
		id: "12",
		date: "04.10.2025",
		day: "Thu",
		category: "Transportation",
		note: "Public transit",
		amount: -30.0,
	},
	{
		id: "13",
		date: "04.05.2025",
		day: "Sat",
		category: "Groceries",
		note: "Fresh food",
		amount: -95.6,
	},
	{
		id: "14",
		date: "04.01.2025",
		day: "Tue",
		category: "Bonus",
		note: "Quarterly bonus",
		amount: 1200.0,
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
		return NextResponse.json(
			{ success: false, message: "Failed to add transaction" },
			{ status: 400 }
		)
	}
}

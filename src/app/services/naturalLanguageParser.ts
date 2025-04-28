import { Transaction } from "./transactionService"

// Mock natural language input parsing to transaction records
export async function parseNaturalLanguage(
	text: string
): Promise<Transaction[]> {
	console.log("Parsing natural language input:", text)

	// This is just a dummy implementation, returning fixed mock data
	// In a real implementation, we would intelligently parse based on text content
	return [
		{
			id: "temp-1",
			date:
				new Date().getMonth() +
				1 +
				"." +
				new Date().getDate() +
				"." +
				new Date().getFullYear(),
			day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
				new Date().getDay()
			],
			category: "Food",
			note: "Parsed from text: " + text,
			amount: -25.99,
		},
		{
			id: "temp-2",
			date:
				new Date().getMonth() +
				1 +
				"." +
				new Date().getDate() +
				"." +
				new Date().getFullYear(),
			day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
				new Date().getDay()
			],
			category: "Transportation",
			note: "Parsed from text: " + text,
			amount: -12.5,
		},
	]
}

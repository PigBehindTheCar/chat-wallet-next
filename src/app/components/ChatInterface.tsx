"use client"

import React, { useState } from "react"

interface Message {
	id: string
	sender: "user" | "ai"
	text: string
	timestamp: Date
}

const ChatInterface: React.FC = () => {
	// Mock initial messages (would be managed by state in real implementation)
	const initialMessages: Message[] = [
		{
			id: "1",
			sender: "ai",
			text: "你好！我是你的AI财务助手。我可以帮你分析支出、设置预算或者回答关于你账本的问题。有什么我可以帮助你的吗？",
			timestamp: new Date(),
		},
	]

	const [messages] = useState<Message[]>(initialMessages)
	const [newMessage, setNewMessage] = useState("")

	return (
		<div className="flex flex-col h-full bg-gray-50">
			{/* Messages container */}
			<div className="flex-grow p-4 overflow-y-auto">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`mb-4 ${
							message.sender === "user"
								? "flex justify-end"
								: "flex justify-start"
						}`}
					>
						<div
							className={`max-w-3/4 rounded-lg px-4 py-2 ${
								message.sender === "user"
									? "bg-blue-500 text-white"
									: "bg-white border border-gray-200"
							}`}
						>
							<p>{message.text}</p>
							<div
								className={`text-xs mt-1 ${
									message.sender === "user" ? "text-blue-100" : "text-gray-500"
								}`}
							>
								{message.timestamp.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Message input */}
			<div className="p-4 bg-white border-t">
				<div className="flex items-center">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="输入消息..."
						className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button className="ml-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}

export default ChatInterface

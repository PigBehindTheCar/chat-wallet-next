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
		<div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white rounded-xl">
			{/* Chat header */}
			<div className="p-4 border-b border-gray-100 flex items-center justify-between">
				<div className="flex items-center">
					<div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
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
								d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
							/>
						</svg>
					</div>
					<div className="ml-3">
						<div className="font-medium text-gray-800">AI财务助手</div>
						<div className="text-xs text-green-500">在线</div>
					</div>
				</div>
				<button className="p-2 hover:bg-gray-100 rounded-full transition">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5 text-gray-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
						/>
					</svg>
				</button>
			</div>

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
						{message.sender === "ai" && (
							<div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
								<div className="w-4 h-4 rounded-full bg-indigo-600"></div>
							</div>
						)}
						<div
							className={`max-w-[80%] rounded-2xl px-4 py-3 ${
								message.sender === "user"
									? "bg-indigo-600 text-white"
									: "bg-gray-100 text-gray-800"
							}`}
						>
							<p className="text-sm">{message.text}</p>
							<div
								className={`text-xs mt-1 ${
									message.sender === "user"
										? "text-indigo-200"
										: "text-gray-500"
								}`}
							>
								{message.timestamp.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
						{message.sender === "user" && (
							<div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center ml-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Message input */}
			<div className="p-4 bg-white border-t border-gray-100">
				<div className="flex items-center">
					<input
						type="text"
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						placeholder="输入消息..."
						className="flex-grow px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
					/>
					<button className="ml-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
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

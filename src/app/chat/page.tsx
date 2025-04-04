"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface SSEResponse {
  response?: string;
  p?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export default function ChatPage() {
  // System prompt and initial messages
  const systemPrompt =
    "You are a helpful AI assistant. Be concise, friendly, and provide accurate information.";
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: systemPrompt },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare the conversation history for the API
      const conversationHistory = messages.concat(userMessage);

      // Call the AI API with the user's message and conversation history
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = ""; // 添加缓冲区存储未处理完的数据

      // Add empty assistant message to start with
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantMessage },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将新块添加到缓冲区
        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // 处理缓冲区中的完整行
        const lines = buffer.split("\n");
        // 保留最后一行，它可能不完整
        buffer = lines.pop() || "";

        for (const line of lines.filter((line) => line.trim() !== "")) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6); // Remove "data: " prefix

            // Handle [DONE] message
            if (data === "[DONE]") {
              continue;
            }

            try {
              // Parse the JSON data
              const jsonData: SSEResponse = JSON.parse(data);

              // Only append the actual response text (skip tokens, usage info)
              if (jsonData.response !== undefined) {
                assistantMessage += jsonData.response;

                // Update the assistant message content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.content = assistantMessage;
                    return [...newMessages];
                  }
                  return newMessages;
                });
              }
            } catch (error) {
              console.error("Error parsing SSE data:", error, data);
            }
          }
        }
      }

      // 处理流结束时可能剩余的数据
      if (buffer.trim() !== "") {
        const lastChunk = decoder.decode(); // 获取任何剩余的字节
        buffer += lastChunk;

        if (buffer.startsWith("data: ")) {
          const data = buffer.substring(6);
          if (data !== "[DONE]") {
            try {
              const jsonData: SSEResponse = JSON.parse(data);
              if (jsonData.response !== undefined) {
                assistantMessage += jsonData.response;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.content = assistantMessage;
                    return [...newMessages];
                  }
                  return newMessages;
                });
              }
            } catch (error) {
              console.error("Error parsing final SSE data:", error, data);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <header className="p-4 border-b">
        <h1 className="text-xl font-bold">AI Chat</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length <= 1 && (
          <div className="text-center text-gray-500 my-8">
            Start a conversation by sending a message
          </div>
        )}

        {/* Only display user and assistant messages, not system messages */}
        {messages
          .filter((message) => message.role !== "system")
          .map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

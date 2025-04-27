import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
	title: "Chat Wallet",
	description: "AI-powered accounting app",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`antialiased`}>{children}</body>
		</html>
	)
}

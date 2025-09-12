import { handlers } from "@/auth"

console.log("🌐 API роут NextAuth загружается, handlers:", !!handlers)

export const { GET, POST } = handlers

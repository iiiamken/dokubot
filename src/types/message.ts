import { AppRouter } from "@/app/server"
import { inferRouterOutputs } from "@trpc/server"
import { JSX } from "react"

type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput["getFileMessages"]["messages"]

type OmitText = Omit<Messages[number], "text">

type ExtendedText = {
  text: string | JSX.Element
}

export type ExtendedMessages = OmitText & ExtendedText
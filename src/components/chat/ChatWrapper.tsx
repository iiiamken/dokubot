"use client"

import { trpc } from "@/app/_trpc/client"
import { PLANS } from "@/config/stripe"
import { ChevronLeft, Loader2, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { buttonVariants } from "../ui/button"
import { ChatContextProvider } from "./ChatContext"
import ChatInput from "./ChatInput"
import Messages from "./Messages"

interface ChatWrapperProps {
  fileId: string
  isSubscribed: boolean
}

const ChatWrapper = ({ fileId, isSubscribed }: ChatWrapperProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data, mutate: getUploadstatus } =
    trpc.getFileUploadStatus.useMutation({
      onSuccess: () => {
        setIsLoading(false)
      },
      onMutate: () => setIsLoading(true),
      onSettled: () => {
        setIsLoading(false)
        getUploadstatus({ fileId })
      },
    })

  useEffect(() => {
    if (data?.status === "PENDING") {
      getUploadstatus({ fileId })
    }
    const uploadStatus = getUploadstatus({ fileId })
    return uploadStatus
  }, [getUploadstatus, fileId, data?.status])

  if (isLoading)
    return (
      <div
        id="message_content"
        className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2"
      >
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Loading...</h3>
            <p className="text-zinc-500 text-sm">
              We&apos;re preparing your PDF.
            </p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 id="processing_pdf" className="font-semibold text-xl">
              Processing PDF...
            </h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div
            id="too_many_pages_error"
            className="flex flex-col items-center gap-2"
          >
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Too many pages in PDF</h3>
            <p id="error_plan_info" className="text-zinc-500 text-sm">
              Your{" "}
              <span className="font-medium">
                {isSubscribed ? "Pro" : "Free"}
              </span>{" "}
              plan supports up to{" "}
              {isSubscribed
                ? PLANS.find((p) => p.name === "Pro")?.pagesPerPdf
                : PLANS.find((p) => p.name === "Free")?.pagesPerPdf}{" "}
              pages per PDF.
            </p>
            <Link
              id="too_many_pages_back_button"
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    )

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId={fileId} />
        </div>

        <ChatInput />
      </div>
    </ChatContextProvider>
  )
}

export default ChatWrapper

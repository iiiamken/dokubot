"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../_trpc/client"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const origin = searchParams.get("origin")

  // DEPRECIATED USEQUERY METHOD
  // trpc.authCallback.useQuery(undefined, {
  //   onSuccess: (success) => {
  //     if (success) {
  //       router.push(origin ? `/${origin}` : "/dashboard")
  //     }
  //   },
  //   onError: (err) => {
  //     if (err.data?.code === "UNAUTHORIZED") {
  //       router.push("/sign-in")
  //     }
  //   },
  //   retry: true,
  //   retryDelay: 500,
  // })

  const { data, isError, error, isSuccess } = trpc.authCallback.useQuery(
    undefined,
    {
      retry: true,
      retryDelay: 500,
    }
  )

  // Handle success using a `useEffect`
  useEffect(() => {
    if (isSuccess && data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard")
    }
  }, [data, origin, router, isSuccess])

  // Handle errors
  useEffect(() => {
    if (isError && error?.data?.code === "UNAUTHORIZED") {
      router.push("/sign-in")
    }
  }, [isError, error, router])

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically when completed.</p>
      </div>
    </div>
  )
}

export default Page

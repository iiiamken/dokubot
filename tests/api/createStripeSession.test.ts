import test, { expect } from "@playwright/test"

test.describe("api test cases for createStripeSession api endpoint", () => {
  test("create stripe session", async ({ request }) => {
    const response = await request.post(
      "https://dokubot.vercel.app/api/trpc/createStripeSession",
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          id: process.env.USER_ID!,
          email: process.env.KINDE_USERNAME!,
          given_name: "test",
          family_name: "test",
          picture: "test",
        }),
      }
    )
    const data = await response.json()

    expect(data.result.data.url).toBeTruthy()
  })

  test("input invalid user returns UNAUTHORIZED", async ({ request }) => {
    const response = await request.post(
      "https://dokubot.vercel.app/api/trpc/createStripeSession",
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          id: "",
          email: "",
          given_name: "test",
          family_name: "test",
          picture: "test",
        }),
      }
    )
    const data = await response.json()

    expect(data.error.data.code).toBe("UNAUTHORIZED")
  })
})

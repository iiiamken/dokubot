import { openaiClient } from "@/app/lib/openai"
import { pc } from "@/app/lib/pinecode"
import { SendMessageValidator } from "@/app/lib/SendMessageValidator"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest } from "next/server"

export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json()

  const { getUser } = getKindeServerSession()
  const user = getUser()

  const { id: userId } = await user

  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { fileId, message } = SendMessageValidator.parse(body)

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) return new Response("Not found", { status: 404 })

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  })

  //1. vectorize message
  const pineconeIndex = pc.Index("docubot3")
  const model = "multilingual-e5-large"

  const query = [message]

  const embedding = await pc.inference.embed(model, query, {
    inputType: "query",
  })

  const results = await pineconeIndex.namespace(file.id).query({
    topK: 4,
    vector: embedding[0].values!,
    includeValues: false,
    includeMetadata: true,
  })

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  })

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }))

  //2. send to openAI to get response
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4",
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.

      \n----------------\n

      PREVIOUS CONVERSATION:
      ${formattedPrevMessages.map((message) => {
        if (message.role === "user") return `User: ${message.content}\n`
        return `Docubot: ${message.content}\n`
      })}

      \n----------------\n

      CONTEXT:
      ${results.matches.map((r) => r.metadata).join("\n\n")}

      USER INPUT: ${message}`,
      },
    ],
  })

  let completeMessage = ""

  // for await (const part of response) {
  //   const content = part.choices[0]?.delta?.content || ""
  //   console.log("content", content)

  //   completeResponse += content // Accumulate the chunks
  // }

  // console.log(completeResponse)
  // await db.message.create({
  //   data: {
  //     text: completeResponse,
  //     isUserMessage: false,
  //     fileId,
  //     userId,
  //   },
  // })

  const encoder = new TextEncoder()

  async function* makeIterator() {
    // first send the OAI chunks
    for await (const chunk of response) {
      const delta = chunk.choices[0].delta.content as string
      // you can do any additional post processing / transformation step here, like
      completeMessage += delta
      console.log(completeMessage)

      // you can yield any string by `yield encoder.encode(str)`, including JSON:
      yield encoder.encode(JSON.stringify(delta))
    }

    // optionally, some additional info can be sent here, like
    // yield encoder.encode(JSON.stringify({ thread_id: thread._id }))
  }

  return new Response(iteratorToStream(makeIterator()))
}

function iteratorToStream(
  iterator: AsyncGenerator<Uint8Array<ArrayBufferLike>, void, unknown>
) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()

      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}

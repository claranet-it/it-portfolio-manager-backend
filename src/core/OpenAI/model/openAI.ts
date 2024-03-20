import { Static, Type } from '@sinclair/typebox'

export const openAIPrompt = Type.Object({
  prompt: Type.String(),
  company: Type.String(),
})

export type openAIPromptType = Static<typeof openAIPrompt>

export const openAIResponse = Type.Object({
  message: Type.String(),
})

export type openAiResponseType = Static<typeof openAIResponse>

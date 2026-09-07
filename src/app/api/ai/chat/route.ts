import { NextRequest } from 'next/server';
import { getGroqClient, GROQ_MODEL, isGroqConfigured } from '@/lib/ai/groq';
import { AI_TOOLS, executeTool } from '@/lib/ai/tools';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are the Caseline AI assistant, embedded in a police case records management system.
You have access to tools that query live case data: cases, criminals, officers, victims, FIRs, police stations, evidence, investigation logs, and dashboard stats.
Always use the tools to look up real data before answering questions about specific records, counts, or statuses — never guess or invent data.
Be concise and factual. When listing multiple records, use a short bulleted list.`;

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  caseId?: string;
}

export async function POST(req: NextRequest) {
  if (!isGroqConfigured()) {
    return new Response(JSON.stringify({ error: 'AI assistant not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body: ChatRequestBody = await req.json();
  const groq = getGroqClient();

  const systemContent = body.caseId
    ? `${SYSTEM_PROMPT}\n\nThe user is currently viewing case ${body.caseId}. If their question is ambiguous about which case, assume they mean this one — use getCaseById with this id.`
    : SYSTEM_PROMPT;

  const conversation: any[] = [
    { role: 'system', content: systemContent },
    ...body.messages,
  ];

  const MAX_TOOL_ITERATIONS = 5;
  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: conversation,
      tools: AI_TOOLS,
      tool_choice: 'auto',
    });

    const message = completion.choices[0].message;

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return textResponse(message.content ?? '');
    }

    conversation.push({
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls,
    });

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments || '{}');
      const result = await executeTool(toolCall.function.name, args);
      conversation.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  // Iteration cap hit — ask for a final answer with whatever context we have, no more tools.
  const fallback = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      ...conversation,
      { role: 'system', content: 'Tool lookups were truncated after 5 steps. Answer with what you found so far and note the search was truncated.' },
    ],
  });
  return textResponse(fallback.choices[0].message.content ?? '');
}

function textResponse(content: string) {
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

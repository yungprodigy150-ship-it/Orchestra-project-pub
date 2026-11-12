/**
 * ORCHESTRA Multi-Agent Dialogue Reasoner Engine
 * Powers authentic peer-to-peer conversations between specialized agents.
 * Recipient agent reasons within its professional digital persona,
 * exchanges findings, challenges assumptions, and synthesizes conclusions.
 */

import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

export const dialogueRouter = Router();

dialogueRouter.post('/reason', async (req: Request, res: Response) => {
  const {
    conversationId,
    topic,
    initiatingAgent,
    recipientAgent,
    messages = [],
    taskContext = ''
  } = req.body;

  const startTime = performance.now();

  if (!recipientAgent || !recipientAgent.name) {
    return res.status(400).json({ error: 'Field "recipientAgent" is required.' });
  }

  const promptTranscript = messages.map((m: any) => `[${m.senderName} (${m.senderRole}) - ${m.messageType}]:\n${m.content}`).join('\n\n');

  const systemInstruction = `You are ${recipientAgent.name}, operating as ${recipientAgent.role} in ORCHESTRA's Autonomous Multi-Agent Workforce.
Your specialization is: ${recipientAgent.specialization || recipientAgent.role}.
You are in an active peer-to-peer technical consultation with ${initiatingAgent?.name || 'Peer Agent'}.
Consultation Topic: "${topic}"
${taskContext ? `Associated Task Context: ${taskContext}` : ''}

CRITICAL OPERATIONAL RULES:
1. Speak in your authentic agent persona. Be concise, rigorous, and technically precise.
2. Provide concrete answers, point out edge cases or strategic risks, and exchange actionable telemetry.
3. If the other agent asked an inquiry, answer directly. If they shared findings, synthesize or challenge them.
4. Structure your response as a clean JSON object with this exact schema:
{
  "messageType": "FINDINGS_SHARE" | "CHALLENGE" | "SYNTHESIS" | "DELEGATION_REQUEST",
  "content": "Your concise, professional response to your peer agent",
  "keyTakeaways": ["point 1", "point 2"],
  "consensusReached": true | false
}`;

  const prompt = `Here is the current conversation transcript so far:\n\n${promptTranscript || '[Conversation initiated on topic: ' + topic + ']'}\n\nRespond as ${recipientAgent.name}.`;

  // Fallback response if GEMINI_API_KEY is not configured or in test mode
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.length < 15 || apiKey.includes('MY_')) {
    const durationMs = Math.round(performance.now() - startTime);
    const mockMsg = {
      id: `msg-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      conversationId,
      senderAgentId: recipientAgent.id,
      senderName: recipientAgent.name,
      senderRole: recipientAgent.role,
      senderAvatar: recipientAgent.avatar,
      recipientAgentId: initiatingAgent?.id || 'operator',
      messageType: 'FINDINGS_SHARE',
      content: `I reviewed the objective regarding "${topic}". From the perspective of ${recipientAgent.role}, the primary architectural lever is establishing clear invariant bounds before scaling. Let's align on the qualification criteria.`,
      structuredHandoffData: {
        keyTakeaways: ['Aligned on qualification baseline', 'Awaiting verification metrics'],
        consensusReached: false
      },
      timestamp: new Date().toISOString()
    };
    return res.json({ message: mockMsg, durationMs, provider: 'offline_fallback' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    });

    const durationMs = Math.round(performance.now() - startTime);
    const textResult = response.text || '';
    let parsed: any = {};
    try {
      parsed = JSON.parse(textResult);
    } catch {
      parsed = {
        messageType: 'FINDINGS_SHARE',
        content: textResult.replace(/^\{[\s\S]*\}$/, '').trim() || textResult,
        keyTakeaways: []
      };
    }

    const newMsg = {
      id: `msg-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      conversationId,
      senderAgentId: recipientAgent.id,
      senderName: recipientAgent.name,
      senderRole: recipientAgent.role,
      senderAvatar: recipientAgent.avatar,
      recipientAgentId: initiatingAgent?.id || 'operator',
      messageType: parsed.messageType || 'FINDINGS_SHARE',
      content: parsed.content || textResult,
      structuredHandoffData: {
        keyTakeaways: parsed.keyTakeaways || [],
        consensusReached: Boolean(parsed.consensusReached)
      },
      timestamp: new Date().toISOString()
    };

    return res.json({
      message: newMsg,
      durationMs,
      provider: 'gemini',
      tokensUsed: response.usageMetadata?.totalTokenCount || Math.round((prompt.length + textResult.length) / 4)
    });
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return res.status(500).json({ error: `Dialogue reasoning failed: ${err.message}`, durationMs });
  }
});

const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

let client = null;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured on the server');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

const MODEL = "gemini-3.5-flash-lite";
/**
 * Calls Gemini with a prompt and returns the raw text response.
 */
const generateText = async (prompt) => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      throw new ApiError(502, 'Gemini returned an empty response');
    }
    return text;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, `Gemini API request failed: ${err.message}`);
  }
};

/**
 * Strips markdown code fences (```json ... ```) that Gemini sometimes wraps JSON in,
 * then safely parses it. Throws ApiError(502) on malformed JSON rather than crashing.
 */
const safeParseJson = (rawText) => {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  // Some models add stray text before/after the JSON body - try to isolate the
  // outermost {...} or [...] block as a fallback.
  try {
    return JSON.parse(cleaned);
  } catch (firstErr) {
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    const candidate = objMatch ? objMatch[0] : arrMatch ? arrMatch[0] : null;
    if (candidate) {
      try {
        return JSON.parse(candidate);
      } catch (secondErr) {
        throw new ApiError(502, 'Gemini returned malformed JSON that could not be parsed');
      }
    }
    throw new ApiError(502, 'Gemini returned malformed JSON that could not be parsed');
  }
};

const generateSummary = async (content) => {
  const prompt = `You are an expert educational assistant. Summarize the following study material into a concise, clear, easy-to-understand summary for a student who wants to quickly review key concepts. Use short paragraphs and, where helpful, bullet points. Do not include any preamble like "Here is the summary" - respond only with the summary text itself.

STUDY MATERIAL:
"""
${content}
"""`;
  const text = await generateText(prompt);
  return text.trim();
};

const generateFlashcards = async (content, count = 10) => {
  const prompt = `You are an expert educational assistant. Based strictly on the study material below, generate exactly ${count} flashcards to help a student revise the material. Each flashcard must have a clear "question" and a correct, concise "answer" derived only from the material provided.

Respond with ONLY valid JSON, no markdown formatting, no explanation, in exactly this shape:
{"flashcards": [{"question": "string", "answer": "string"}]}

STUDY MATERIAL:
"""
${content}
"""`;
  const raw = await generateText(prompt);
  const parsed = safeParseJson(raw);
  const flashcards = parsed.flashcards;
  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    throw new ApiError(502, 'Gemini did not return a valid flashcards array');
  }
  const cleaned = flashcards
    .filter((f) => f && typeof f.question === 'string' && typeof f.answer === 'string')
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }));
  if (cleaned.length === 0) {
    throw new ApiError(502, 'Gemini returned flashcards in an unexpected format');
  }
  return cleaned;
};

const generateQuiz = async (content, count = 5) => {
  const prompt = `You are an expert educational assistant. Based strictly on the study material below, generate a multiple-choice quiz with exactly ${count} questions to test a student's understanding of this specific material. Do not invent facts that are not supported by the material.

Each question must have:
- "question": string
- "options": an array of exactly 4 distinct answer choices (strings)
- "correctAnswer": a string that exactly matches one of the entries in "options"
- "explanation": a short string explaining why the answer is correct

Respond with ONLY valid JSON, no markdown formatting, no explanation, in exactly this shape:
{"questions": [{"question": "string", "options": ["string","string","string","string"], "correctAnswer": "string", "explanation": "string"}]}

STUDY MATERIAL:
"""
${content}
"""`;
  const raw = await generateText(prompt);
  const parsed = safeParseJson(raw);
  const questions = parsed.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(502, 'Gemini did not return a valid questions array');
  }
  const cleaned = questions
    .filter(
      (q) =>
        q &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctAnswer === 'string'
    )
    .map((q) => ({
      question: q.question.trim(),
      options: q.options.map((o) => String(o).trim()),
      correctAnswer: q.correctAnswer.trim(),
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
    }))
    // Guard against a correctAnswer that doesn't actually match one of the options
    .filter((q) => q.options.includes(q.correctAnswer));
  if (cleaned.length === 0) {
    throw new ApiError(502, 'Gemini returned quiz data in an unexpected or inconsistent format');
  }
  return cleaned;
};

const generateStudyPlan = async ({ subject, examDate, hoursPerDay, goals, topics }) => {
  const prompt = `You are an expert academic study planner. Create a realistic, day-by-day personalized study plan for a student with the following details:

- Subject: ${subject}
- Exam date: ${examDate}
- Available study hours per day: ${hoursPerDay}
- Learning goals: ${goals || 'Not specified'}
- Topics to focus on: ${topics || 'Not specified'}

Today's date should be treated as the current real-world date. Distribute topics sensibly across the available days leading up to the exam date, include short review/revision days near the end, and keep daily sessions realistic for the stated hours per day.

Respond with ONLY valid JSON, no markdown formatting, no explanation, in exactly this shape:
{"overview": "short string summarizing the plan strategy", "days": [{"date": "YYYY-MM-DD", "focus": "string", "tasks": ["string", "string"], "hours": number}]}`;
  const raw = await generateText(prompt);
  const parsed = safeParseJson(raw);
  if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
    throw new ApiError(502, 'Gemini did not return a valid study plan');
  }
  return parsed;
};

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
};

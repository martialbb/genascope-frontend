// src/pages/api/submit_answer.ts
import type { APIRoute } from 'astro';

// Mock data for subsequent questions
const questions = [
  { id: 1, text: "Welcome to Genascope! To start, could you please provide the patient's primary diagnosis?" },
  { id: 2, text: "Thank you. What stage is the cancer?" },
  { id: 3, text: "Understood. Has the patient undergone any previous treatments (e.g., chemotherapy, radiation)?" },
  { id: 4, text: "Noted. Are there any known genetic mutations associated with the patient's cancer (e.g., BRCA1/2)?" },
  // Add more questions as needed
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, questionId, answer } = body;

    console.log(`API: Received answer for session ${sessionId}, question ${questionId}: ${answer}`);

    // In a real app, save the answer and determine the next question based on logic/state

    const currentQuestionIndex = questions.findIndex(q => q.id === questionId);
    let nextQuestion = null;
    if (currentQuestionIndex !== -1 && currentQuestionIndex < questions.length - 1) {
      nextQuestion = questions[currentQuestionIndex + 1];
    }

    // Simulate a short delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return new Response(JSON.stringify({ nextQuestion: nextQuestion }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("API Error in /api/submit_answer:", error);
    return new Response(JSON.stringify({ error: 'Failed to submit answer' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

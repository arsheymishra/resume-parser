import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extractFieldsFromResume(fullText: string) {
  const trimmedText = fullText.slice(0, 3000);

  const prompt = `
You are a resume parser. Extract the following structured fields from the given resume content.
Respond ONLY with a valid JSON object and NO explanations.

Required fields:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "skills": ["Skill1", "Skill2", ...],
  "experience_years": "e.g. '2 years' or 'Fresher'",
  "education": "Highest qualification and institution",
  "experience": "Work summary or internships",
  "suggested_roles": ["Suggested job roles"]
}

Resume:
${trimmedText}

Return only JSON. Do not explain anything.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}') + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON found in model response');
    }

    const jsonText = content.slice(jsonStart, jsonEnd);

    try {
      return JSON.parse(jsonText);
    } catch {
      const cleaned = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');
      return JSON.parse(cleaned);
    }
  } catch (err: any) {
    console.error('❌ Gemini extraction error:', err.message || err);
    return { error: 'Failed to extract fields' };
  }
}

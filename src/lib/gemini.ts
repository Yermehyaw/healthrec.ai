import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function analyzePatient(patient: any, inventory: any[]) {
  const inventoryContext = inventory.map(item => `${item.name}: ${item.quantity}`).join(', ');
  const prompt = `
    You are a medical inventory optimization assistant.
    Given this patient profile: ${JSON.stringify(patient)}
    And the current ward inventory: ${inventoryContext}
    
    Suggest restocking priorities and flag any care risks based on the patient's diagnosis and medications vs available supplies.
    Provide the response in clear, bolded sections. Use professional medical terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI diagnostic service.";
  }
}

export async function generateWardReport(patients: any[], inventory: any[]) {
  const prompt = `
    You are a head nurse/hospital administrator.
    Analyze the current state of the ward.
    Patients: ${JSON.stringify(patients)}
    Inventory: ${JSON.stringify(inventory)}
    
    Provide a holistic summary of the ward's status, critical supply needs, and overall patient care load.
    Format with professional headers and clear actionable items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate ward report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating ward report.";
  }
}

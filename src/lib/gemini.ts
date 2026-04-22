import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error("Missing Gemini API Key. Please add GEMINI_API_KEY to your environment variables or Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function analyzePatient(patient: any, inventory: any[]) {
  const inventoryContext = inventory.map(item => `${item.name}: ${item.quantity}`).join(', ');
  const prompt = `
    You are a medical inventory optimization assistant.
    Analyze this patient profile:
    - Name: ${patient.name} (${patient.age}y)
    - Priority: ${patient.priority}
    - Diagnosis: ${patient.diagnosis}
    - Vitals: BP ${patient.vitals.bp}, HR ${patient.vitals.hr}, Temp ${patient.vitals.temp}, SpO2 ${patient.vitals.oxygen}%
    - Prescriptions: ${patient.prescriptions.map((p: any) => `${p.name} ${p.dosage} ${p.frequency}`).join(', ')}
    
    Current Ward Inventory: ${inventoryContext}
    
    TASK:
    1. Suggest restocking priorities based on this patient's prescriptions vs inventory.
    2. Flag any care risks (e.g., vital abnormalities or medication shortages).
    3. Suggest a care path.
    
    Provide the response in clear, bolded sections. Use professional medical terminology.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `AI Analysis unavailable: ${error.message || "Unknown error"}`;
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate ward report.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Ward Report unavailable: ${error.message || "Unknown error"}`;
  }
}

export async function optimizeInventory(patients: any[], inventory: any[]) {
  const prompt = `
    You are a medical supply chain strategist.
    Current Inventory: ${JSON.stringify(inventory)}
    Active Patients & Prescriptions: ${JSON.stringify(patients)}
    
    TASK:
    1. Identify critical stock-out risks based on current patient load.
    2. Propose an optimization strategy (e.g., redistributing supplies or urgent ordering).
    3. Suggest preventative measures for common high-demand items.
    
    Provide a concise, strategic summary with actionable items.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response.text || "Unable to generate optimization insights.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return `Optimization analysis unavailable: ${error.message || "Unknown error"}`;
  }
}

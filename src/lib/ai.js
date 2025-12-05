// Google Gemini AI Integration
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate text with Gemini
 */
export async function generateText(prompt, options = {}) {
  try {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: options.model || 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, text };
  } catch (error) {
    console.error('AI generation failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Categorize invoice item using AI
 */
export async function categorizeInvoiceItem(itemDescription) {
  const prompt = `
    Categorize the following invoice item into one of these categories:
    - Office Supplies
    - Equipment
    - Services
    - Software
    - Marketing
    - Travel
    - Utilities
    - Other
    
    Item: "${itemDescription}"
    
    Respond with ONLY the category name, nothing else.
  `;

  const result = await generateText(prompt);
  return result.success ? result.text.trim() : 'Other';
}

/**
 * Generate invoice description using AI
 */
export async function generateInvoiceDescription(items) {
  const itemsList = items.map((item) => `- ${item.name} (${item.quantity}x)`).join('\n');

  const prompt = `
    Generate a professional Arabic invoice description for the following items:
    ${itemsList}
    
    Make it concise (max 2 sentences) and professional.
    Respond in Arabic only.
  `;

  return generateText(prompt);
}

/**
 * Analyze spending patterns using AI
 */
export async function analyzeSpending(transactions) {
  const summary = transactions.map((t) => `${t.category}: ${t.amount} EGP on ${t.date}`).join('\n');

  const prompt = `
    Analyze the following spending data and provide:
    1. Top 3 spending categories
    2. Unusual patterns or anomalies
    3. Cost-saving recommendations
    
    Data:
    ${summary}
    
    Respond in Arabic, be concise and actionable.
  `;

  return generateText(prompt);
}

/**
 * Generate product description using AI
 */
export async function generateProductDescription(productName, features = []) {
  const featuresList = features.join(', ');

  const prompt = `
    Generate a professional Arabic product description for:
    Product: ${productName}
    Features: ${featuresList}
    
    Make it compelling and SEO-friendly (max 100 words).
    Respond in Arabic only.
  `;

  return generateText(prompt);
}

/**
 * Smart search using AI
 */
export async function smartSearch(query, context) {
  const prompt = `
    User query: "${query}"
    
    Context: ${JSON.stringify(context)}
    
    Provide the most relevant results and explain why they match.
    Respond in Arabic.
  `;

  return generateText(prompt);
}

/**
 * Generate email content using AI
 */
export async function generateEmailContent(type, data) {
  const prompts = {
    invoice: `Generate a professional Arabic email for sending invoice #${data.number} to customer. Include greeting, invoice details, and call-to-action.`,
    reminder: `Generate a polite Arabic payment reminder email for overdue invoice #${data.number}. Amount: ${data.amount} EGP. Days overdue: ${data.daysOverdue}.`,
    welcome: `Generate a warm Arabic welcome email for new user ${data.name}. Introduce the ERP system features briefly.`,
  };

  return generateText(prompts[type] || prompts.invoice);
}

// Example usage:
// const category = await categorizeInvoiceItem('Microsoft Office 365 Subscription');
// const description = await generateInvoiceDescription(items);
// const analysis = await analyzeSpending(transactions);

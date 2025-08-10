import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '../../../lib/pages/home/components/transaction';
import { GoogleGenAI } from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const prompt = `

Extract transaction details from the following HTML email content. Focus on identifying the **Name**, **Description**, **Company**, **Amount**, **Date**, **Status** (e.g., "complete", "pending", "failed"), **Type** (e.g., "income", "expense"), and **Labels** (e.g., "shopping", "services", "food", "travel"). If a field cannot be found, omit it from the JSON. For 'Amount', extract the numerical value and currency if present. For 'Date', extract the full date.
Return the extracted information as a single JSON object.

**HTML Email Content:**
[HTML]
**Desired JSON Output Format:**
{
"transaction": {
  "receiptId": "string", // Any reference to the receipt, like a receipt number, invoice number, that can distinguish it from other transactions.
  "name": "string",
  "description": "string",
  "company": "string",
  "amount": "number",
  "currency": "string",
  "date": "YYYY-MM-DD",
  "status": "string",
  "type": "string",
  "labels": ["string"]
  }
}

If the email is found to be a non transaction email - such as a newsletter, a marketing email, a support email, etc. - return "null" for "transaction".

RETURN WITHOUT ANY OTHER TEXT OR COMMENTS. OR MARKDOWN. JUST THE JSON.
IF THERE ARE NO TRANSACTIONS, RETURN AN EMPTY ARRAY.

`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export async function POST(request: NextRequest) {
  try {
    const { transaction: _transaction, email } = await request.json();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt.replace('[HTML]', email.body_html),
            },
          ],
        },
      ],
    });
    const json = JSON.parse(
      response.text?.replace(/```[^\n]*\n|\n```/g, '') || '{}'
    );
    if (!json || json?.transaction === null || json?.transaction === 'null') {
      return NextResponse.json({ transaction: null });
    }
    const transactionResponse = json.transaction;
    const transaction: Transaction = {
      id: _transaction.id,
      receiptId: email.id,
      name: transactionResponse.name || email.subject || '',
      description: transactionResponse.description || email.description || '',
      company: transactionResponse.company || email.description || '',
      amount: transactionResponse.amount || 0,
      date: new Date(email.date),
      status: 'complete',
      type: transactionResponse.type || 'expense',
      labels: transactionResponse.labels || ['other'],
      emailId: email.id,
    };

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}

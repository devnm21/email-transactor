import fs from 'fs';
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
[{
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
}]

RETURN WITHOUT ANY OTHER TEXT OR COMMENTS. OR MARKDOWN. JUST THE JSON.
IF THERE ARE NO TRANSACTIONS, RETURN AN EMPTY ARRAY.

`;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (email.body_html) {
      fs.writeFileSync(`./${email.id}.html`, email.body_html);
    }
    // const uploadResponse = await ai.files.upload({
    //   file: new Blob([email.body_html], { type: 'text/html' }),
    // });
    // console.log(uploadResponse);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            // {
            //   fileData: {
            //     mimeType: 'text/html',
            //     fileUri: uploadResponse.uri,
            //   },
            // },
            {
              text: prompt.replace('[HTML]', email.body_html),
            },
          ],
        },
      ],
    });
    const json = JSON.parse(response.text || '{}');
    console.log(json);
    if (json.length === 0) {
      return NextResponse.json({ transaction: null });
    }
    const transactionResponse = json[0];
    // Create transaction object (basic example)
    const transaction: Transaction = {
      receiptId: email.id,
      name:
        email.properties?.['ff7a032a-38cf-4776-804b-342f6c2803ab']?.value ||
        'Unknown Transaction',
      description:
        email.properties?.['e86975bf-f22f-4197-a1e3-828616b4692b']?.value || '',
      company:
        transactionResponse.company ||
        email.properties?.['ff7a032a-38cf-4776-804b-342f6c2803ab']?.value ||
        'Unknown Company',
      amount: transactionResponse.amount || 0,
      date: new Date(email.date),
      status: 'pending',
      type: transactionResponse.type || 'expense',
      labels: transactionResponse.labels || ['other'],
      emailId: email.id,
    };

    // Log the transaction
    console.log('Processed transaction:', transaction);

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error processing email:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}

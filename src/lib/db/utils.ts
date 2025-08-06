import { Email, EmailService } from './email';

export const propertiiesIdMap = {
  subject: 'ff7a032a-38cf-4776-804b-342f6c2803ab',
  description: '900deab4-7a9b-439b-9eab-d6549ea609d0',
};

export const transformRawEmailObject = (rawEmail: any): Email => {
  return {
    id: rawEmail.id,
    body_html: rawEmail.body_html,
    status: 'pending',
    description:
      rawEmail?.properties[propertiiesIdMap.description]?.value || '',
    subject: rawEmail?.properties[propertiiesIdMap.subject]?.value || '',
    source: rawEmail.source,
    external_thread_id: rawEmail.external_thread_id,
    date: rawEmail.date,
    provider_id: rawEmail.provider_id,
  };
};

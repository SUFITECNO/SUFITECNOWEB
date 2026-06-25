const SHEET_NAME = 'Contact Submissions';
const NOTIFICATION_EMAIL = 'ummisyahirah83@gmail.com';

function doPost(e) {
  if (!e || !e.parameter) {
    return createJsonResponse({
      result: 'error',
      message: 'No form data received. Submit the website form or use doGet to test the deployment.',
    });
  }

  const sheet = getContactSheet();
  const data = e.parameter || {};

  sheet.appendRow([
    new Date(),
    data.fullName || '',
    data.email || '',
    data.phone || '',
    data.message || '',
    data.source || '',
  ]);

  if (NOTIFICATION_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: 'New website enquiry from Sufi Tecno Global',
      htmlBody: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.fullName || '')}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email || '')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone || '')}</p>
        <p><strong>Message:</strong><br>${escapeHtml(data.message || '').replace(/\n/g, '<br>')}</p>
        <p><strong>Source:</strong> ${escapeHtml(data.source || '')}</p>
      `,
    });
  }

  return createJsonResponse({ result: 'success' });
}

function doGet() {
  getContactSheet();

  return createJsonResponse({
    result: 'ready',
    message: 'Contact form endpoint is ready. Submit from the website to add rows.',
  });
}

function getContactSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Full Name',
      'Email',
      'Phone',
      'Message',
      'Source URL',
    ]);
  }

  return sheet;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createJsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

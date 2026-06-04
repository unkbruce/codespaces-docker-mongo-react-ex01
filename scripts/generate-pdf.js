const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer');

const rootDir = path.resolve(__dirname, '..');
const pdfDir = path.join(rootDir, 'docs', 'pdf');

const documents = [
  {
    input: path.join(rootDir, 'docs', 'html', 'requirements.html'),
    output: path.join(pdfDir, 'requirements.pdf'),
  },
  {
    input: path.join(rootDir, 'docs', 'html', 'wireframe.html'),
    output: path.join(pdfDir, 'wireframe.pdf'),
  },
];

async function generatePdf() {
  await fs.mkdir(pdfDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-crash-reporter',
      '--disable-crashpad',
    ],
  });

  try {
    for (const document of documents) {
      const page = await browser.newPage();
      const url = `file://${document.input}`;

      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.emulateMediaType('print');
      await page.pdf({
        path: document.output,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      await page.close();

      console.log(`Generated ${path.relative(rootDir, document.output)}`);
    }
  } finally {
    await browser.close();
  }
}

generatePdf().catch((error) => {
  console.error(error);
  process.exit(1);
});

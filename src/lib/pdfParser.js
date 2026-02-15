/**
 * Extract raw text from a PDF file (client-side only).
 * Uses dynamic import to avoid SSR issues with pdfjs-dist.
 * @param {File} file - The PDF file to parse
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromPDF(file) {
    // Dynamically import to avoid SSR — pdfjs-dist uses DOM APIs
    const pdfjsLib = await import('pdfjs-dist');

    // Point to the worker file in /public — avoids CDN loading issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument({
                    data: typedArray,
                }).promise;

                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map((item) => item.str)
                        .join(' ');
                    fullText += pageText + '\n\n';
                }

                resolve(fullText.trim());
            } catch (err) {
                reject(new Error('Failed to parse PDF: ' + err.message));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

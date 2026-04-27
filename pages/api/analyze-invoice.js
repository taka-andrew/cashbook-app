import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, mediaType } = req.body;

  if (!base64 || !mediaType) {
    return res.status(400).json({ error: 'base64とmediaTypeが必要です' });
  }

  const prompt = `あなたは日本の請求書読み取りの専門家です。
添付された請求書（PDFまたは画像）を読み取り、以下の項目を抽出してください。
項目が読み取れない場合は空文字列を返してください。
必ず以下のJSON形式のみで返答し、余分なテキストや説明は一切含めないでください。

{
  "vendor": "仕入先名・会社名",
  "invoice_date": "請求日（YYYY/MM/DD形式）",
  "due_date": "支払期日（YYYY/MM/DD形式）",
  "amount_with_tax": "請求金額税込（数字のみ、カンマなし）",
  "tax_amount": "消費税額（数字のみ）",
  "bank_info": "振込先口座情報",
  "description": "摘要・品目の概要",
  "department": "宛先部門・店舗名",
  "account_suggestion": "勘定科目候補（仕入高/外注費/消耗品費/地代家賃/その他から最適なもの）",
  "confidence": "読み取り精度の自己評価（high/medium/low）",
  "notes": "特記事項や読み取りが不確かな部分"
}`;

  const contentBlocks =
    mediaType === 'application/pdf'
      ? [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: prompt },
        ]
      : [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt },
        ];

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: contentBlocks }],
    });

    const rawText = message.content.map((b) => b.text || '').join('');
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json({ result: parsed });
  } catch (err) {
    console.error('AI読み取りエラー:', err);
    return res.status(500).json({ error: err.message || 'AI読み取りに失敗しました' });
  }
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

const SUPPORTED_LANGUAGES = ['en', 'yo', 'ig', 'ha', 'fr'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export async function translateStrings(
  strings: Record<string, string>,
  targetLanguage: SupportedLanguage
): Promise<Record<string, string>> {
  if (targetLanguage === 'en') return strings

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured')

  const entries = Object.entries(strings)
  const prompt = `Translate each of the following UI strings from English to ${getLanguageName(targetLanguage)}.
Return ONLY a JSON object with the same keys, with translated values. Do not add explanations.

${JSON.stringify(Object.fromEntries(entries))}`

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    }),
  })

  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`)

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? '{}'

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('DeepSeek returned no valid JSON')

  return JSON.parse(jsonMatch[0]) as Record<string, string>
}

function getLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    yo: 'Yoruba',
    ig: 'Igbo',
    ha: 'Hausa',
    fr: 'French',
  }
  return names[code]
}

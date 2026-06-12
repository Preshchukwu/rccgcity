export function extractPublicId(url: string): string {
  // https://res.cloudinary.com/cloud/image/upload/v1234/rccgcity/filename.jpg → rccgcity/filename
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/)
  return match?.[1] ?? ''
}

export function getTransformedUrl(url: string, width = 800): string {
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}

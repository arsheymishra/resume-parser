import { NextRequest } from 'next/server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document } from 'langchain/document'
import { extractFieldsFromResume } from '@/app/lib/extractFields' 

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File

    if (!file || file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'Invalid PDF file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: file.type })

    const loader = new PDFLoader(blob, {
      splitPages: false,
    })

    const docs: Document[] = await loader.load()
    const fullText = docs.map((doc) => doc.pageContent).join('\n\n')
    console.log("📄 Extracted text:", fullText.slice(0, 500))

    const structured = await extractFieldsFromResume(fullText)

    return new Response(JSON.stringify(structured), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('❌ Route error:', error.message || error)
    return new Response(JSON.stringify({ error: 'Server error while parsing resume.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

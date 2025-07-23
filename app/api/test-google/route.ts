import { NextResponse } from 'next/server';
import { getGoogleCredentials } from '@/lib/google-credentials';
import { VertexAI } from '@google-cloud/vertexai';

export async function GET() {
  try {
    // Configurar credenciais
    const creds = getGoogleCredentials();
    
    // Verificar se temos o projeto correto
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'exzosverce';
    
    // Testar Vertex AI
    const vertexAI = new VertexAI({
      project: projectId,
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
    
    const result = await model.generateContent('Olá! Teste do ExzosNexus com projeto exzosverce.');
    
    return NextResponse.json({
      success: true,
      project: projectId,
      response: result.response.text()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'exzosverce'
    }, { status: 500 });
  }
}
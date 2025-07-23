import fs from 'fs';
import path from 'path';

let credentials: any = null;

export function getGoogleCredentials() {
  if (credentials) return credentials;

  // Em produção, usar base64
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    const decoded = Buffer.from(
      process.env.GOOGLE_CREDENTIALS_BASE64, 
      'base64'
    ).toString('utf-8');
    
    credentials = JSON.parse(decoded);
    
    // Salvar temporariamente para SDKs que precisam de arquivo
    const tempPath = '/tmp/google-credentials.json';
    fs.writeFileSync(tempPath, decoded);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
    
    return credentials;
  }

  // Em desenvolvimento, usar arquivo local
  if (process.env.NODE_ENV === 'development') {
    const localPath = path.join(process.cwd(), 'google-credentials.json');
    if (fs.existsSync(localPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = localPath;
      credentials = JSON.parse(fs.readFileSync(localPath, 'utf-8'));
      return credentials;
    }
  }

  throw new Error('Google credentials not found');
}
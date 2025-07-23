import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExzosNexus MCP Hub',
  description: 'Hub centralizado para 100+ MCPs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
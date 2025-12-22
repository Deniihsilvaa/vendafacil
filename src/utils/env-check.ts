/**
 * Utilitário para verificar e depurar variáveis de ambiente
 */

/**
 * Verifica se as variáveis de ambiente do Supabase estão configuradas
 * e exibe informações úteis para debug
 */
export const checkSupabaseEnv = (): {
  isConfigured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  url: string | undefined;
  keyPreview: string | undefined;
  allSupabaseKeys: string[];
  recommendations: string[];
} => {
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const hasUrl = !!(url && url !== 'undefined' && url.trim() !== '');
  const hasKey = !!(key && key !== 'undefined' && key.trim() !== '');
  const isConfigured = hasUrl && hasKey;
  
  const allSupabaseKeys = Object.keys(import.meta.env).filter(k => 
    k.includes('SUPABASE') || k.includes('supabase')
  );
  
  const recommendations: string[] = [];
  
  if (!isConfigured) {
    recommendations.push('Verifique se o arquivo .env está na raiz do projeto');
    recommendations.push('Certifique-se de que as variáveis começam com VITE_');
    recommendations.push('Reinicie o servidor de desenvolvimento após adicionar variáveis (Ctrl+C e npm run dev)');
    
    if (!hasUrl) {
      recommendations.push('Adicione VITE_SUPABASE_URL=https://seu-projeto.supabase.co no arquivo .env');
    }
    
    if (!hasKey) {
      recommendations.push('Adicione VITE_SUPABASE_ANON_KEY=sua-chave-anon-key no arquivo .env');
    }
  }
  
  return {
    isConfigured,
    hasUrl,
    hasKey,
    url,
    keyPreview: key ? `${key.substring(0, 20)}...` : undefined,
    allSupabaseKeys,
    recommendations,
  };
};

/**
 * Exibe informações de debug sobre as variáveis de ambiente do Supabase
 * (apenas em desenvolvimento)
 */
export const debugSupabaseEnv = (): void => {
  if (!import.meta.env.DEV) {
    return; // Não fazer debug em produção
  }
  
  const check = checkSupabaseEnv();
  
  console.group('🔍 Debug - Variáveis de Ambiente Supabase');
  console.log('Configurado:', check.isConfigured ? '✅ Sim' : '❌ Não');
  console.log('URL presente:', check.hasUrl ? '✅ Sim' : '❌ Não');
  console.log('Key presente:', check.hasKey ? '✅ Sim' : '❌ Não');
  
  if (check.url) {
    console.log('URL:', check.url);
  }
  
  if (check.keyPreview) {
    console.log('Key (preview):', check.keyPreview);
  }
  
  console.log('Todas as chaves Supabase encontradas:', check.allSupabaseKeys);
  
  if (check.recommendations.length > 0) {
    console.group('💡 Recomendações:');
    check.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};


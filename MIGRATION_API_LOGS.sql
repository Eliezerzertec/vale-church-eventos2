-- Tabela para registrar todas as transações de API AbacatePay
CREATE TABLE IF NOT EXISTS api_transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL, -- ID único para correlacionar requisição/resposta
  api_type TEXT NOT NULL, -- 'abacatepay', 'webhook', etc
  endpoint TEXT NOT NULL, -- /billing/create, /billing/{id}, etc
  method TEXT NOT NULL, -- GET, POST, PUT, DELETE
  request_body JSONB, -- Payload enviado
  response_status INTEGER, -- HTTP status code
  response_body JSONB, -- Resposta recebida
  error_message TEXT, -- Mensagem de erro se houver
  duration_ms INTEGER, -- Tempo de execução em ms
  user_email TEXT, -- Email do usuário (se aplicável)
  registration_id UUID REFERENCES event_registrations(id), -- ID da inscrição (se aplicável)
  billing_id TEXT, -- ID de billing do AbacatePay
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX idx_api_logs_transaction_id ON api_transaction_logs(transaction_id);
CREATE INDEX idx_api_logs_created_at ON api_transaction_logs(created_at DESC);
CREATE INDEX idx_api_logs_endpoint ON api_transaction_logs(endpoint);
CREATE INDEX idx_api_logs_user_email ON api_transaction_logs(user_email);
CREATE INDEX idx_api_logs_billing_id ON api_transaction_logs(billing_id);
CREATE INDEX idx_api_logs_status ON api_transaction_logs(response_status);

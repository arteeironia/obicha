# Check-in e histórico de tentativas do Respira

- `Hoje não fumei` confirma apenas a data local atual; a pessoa pode desfazer o toque no mesmo dia.
- Uma restrição única por pessoa/data e a transação com bloqueio do perfil evitam duplicidade e recomeços concorrentes.
- Ausência de check-in significa ausência de confirmação, nunca uma recaída automática. A contagem por tempo e o calendário de confirmações são apresentados separadamente.
- `Voltei a fumar` aceita uma data retroativa dentro da tentativa ativa. Essa tentativa termina no início do dia informado (limitado ao início da própria tentativa se ambos ocorrerem no mesmo dia). Confirmações incompatíveis a partir dessa data são retiradas.
- `Estou recomeçando hoje` abre uma nova tentativa a partir do momento da confirmação, preservando todas as anteriores. O primeiro check-in da nova tentativa estará disponível no dia seguinte.
- O histórico exibe datas e estimativas por tentativa. O duelo compara dias e as estimativas de cigarros evitados e dinheiro economizado. A melhor marca é um horizonte; o próximo marco de poucos dias continua em destaque.
- As medalhas consideram também as melhores tentativas arquivadas. A contagem atual e suas estimativas ficam zeradas quando a pessoa registra retorno ao cigarro, até recomeçar.
- Estatísticas da comunidade somam os períodos encerrados e a tentativa ativa, excluindo os intervalos registrados de retorno ao cigarro.
- A primeira tentativa parte da data já cadastrada no perfil, quando a própria pessoa abre o recurso. Eventos antigos de recaída permanecem guardados; não foram inventadas datas nem check-ins retroativos. Registros antigos com apenas `days_reached` continuam participando da comparação de dias, sem fabricar estimativas monetárias.
- O calendário mantém a consulta dos últimos 366 registros, com visão inicial dos últimos 28 dias. O histórico completo de tentativas continua disponível.

## Segurança e dados

As tabelas `quit_attempts` e `quit_checkins` têm RLS e leitura limitada ao proprietário. Escrita direta por clientes é bloqueada. A API valida a identidade com Supabase Auth e não aceita um identificador de usuário vindo do corpo. Alterações exigem a mesma origem do site e são transacionais. Exclusão de conta também remove os novos registros.

O esquema aditivo está documentado em `db/respira-journey.sql` e foi aplicado pela migração `add_smoking_attempts_and_daily_checkins`. Nenhum perfil pessoal foi pausado ou reiniciado por essa migração.

## Validação

- 40 testes da jornada com banco e autenticação simulados: duplicidade, retorno retroativo, congelamento de duração, recomeço, sobreposição, dia do recomeço, correção de data, autorização e preservação do histórico.
- 85 verificações existentes de segurança; 14 de acesso da vitrine; 26 de catálogo, abrangendo 485 opções de compra.
- TypeScript e build de produção.
- Conferência visual dos estados ativo e pausado em largura de 393 px; fluxos reais com uma conta pessoal permanecem sujeitos à validação no site publicado.

Nenhum teste enviou e-mails/notificações nem alterou históricos pessoais de produção.

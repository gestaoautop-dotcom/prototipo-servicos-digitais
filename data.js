/* Dados FICTÍCIOS para o protótipo conceitual. Nada aqui é dado oficial. */
window.CIDADES = {
  canoas: {
    id: 'canoas', nome: 'Canoas', uf: 'RS',
    cor: '#0b6e4f', cor2: '#0a5a41', corSoft: '#e6f4ee', acento: '#f2b705',
    centro: [-29.9178, -51.1839],
    protocolo: '25.0.000123456-7', // formato inspirado no SEI, número fictício
    ubs: [
      { nome: 'UBS Centro (exemplo)', dist: '1,2 km', coord: [-29.9155, -51.1810] },
      { nome: 'UBS Niterói (exemplo)', dist: '2,8 km', coord: [-29.9300, -51.1600] },
      { nome: 'UBS Mathias Velho (exemplo)', dist: '3,5 km', coord: [-29.9050, -51.2050] }
    ],
    bairros: ['Centro', 'Niterói', 'Mathias Velho', 'Igara', 'Estância Velha', 'Guajuviras'],
    canal: 'Central de Atendimento (canal fictício neste protótipo)'
  },
  cachoeirinha: {
    id: 'cachoeirinha', nome: 'Cachoeirinha', uf: 'RS',
    cor: '#1f5fae', cor2: '#174a88', corSoft: '#e8f0fb', acento: '#f28c28',
    centro: [-29.9472, -51.0936],
    protocolo: '00000/2026', // número fictício
    ubs: [
      { nome: 'UBS Vila Cachoeirinha (exemplo)', dist: '0,9 km', coord: [-29.9460, -51.0960] },
      { nome: 'UBS Parque da Matriz (exemplo)', dist: '2,1 km', coord: [-29.9380, -51.1050] },
      { nome: 'UBS Granja Esperança (exemplo)', dist: '3,0 km', coord: [-29.9600, -51.0800] }
    ],
    bairros: ['Vila Cachoeirinha', 'Parque da Matriz', 'Granja Esperança', 'Vila Imbuí', 'Distrito Industrial'],
    canal: 'Ouvidoria (canal fictício neste protótipo)'
  }
};

/* Catálogo de serviços com sinônimos em linguagem do cidadão (busca inteligente) */
window.SERVICOS = [
  { id: 'iptu', titulo: 'Pagar IPTU (2ª via, cota única ou parcelas)', cat: 'Impostos', rota: '#/iptu', tempo: '2 min', online: true,
    termos: 'iptu imposto casa boleto 2a via segunda via carne carnê parcela cota unica pagar imposto predial territorial tcl lixo pix' },
  { id: 'cnd', titulo: 'Certidão negativa de débitos (CND)', cat: 'Certidões', rota: '#/iptu?doc=cnd', tempo: '1 min', online: true,
    termos: 'certidao negativa cnd nada consta debito divida comprovante regularidade documento imovel cpf cnpj' },
  { id: 'processo', titulo: 'Acompanhar meu processo / protocolo', cat: 'Processos', rota: '#/processo', tempo: 'agora', online: true,
    termos: 'processo protocolo andamento acompanhar pedido requerimento solicitacao status responder anexar documento exigencia paralisado' },
  { id: 'saude', titulo: 'Agendar consulta na UBS', cat: 'Saúde', rota: '#/saude', tempo: '3 min', online: true,
    termos: 'consulta medico médico ubs posto de saude agendar marcar ficha clinico pediatra dentista odontologia vacina sus' },
  { id: 'endereco', titulo: 'Atualizar endereço / localizar imóvel no mapa', cat: 'Cadastro', rota: '#/endereco', tempo: '2 min', online: true,
    termos: 'endereco cep mudar mudanca localizacao mapa terreno lote imovel coordenada pino rua bairro' },
  { id: 'matricula', titulo: 'Inscrição em creche / escola municipal', cat: 'Educação', rota: '#/em-breve?s=matricula', tempo: '10 min', online: true,
    termos: 'creche escola matricula matrícula vaga educacao infantil bercario maternal pre escola ensino fundamental filho crianca' },
  { id: 'nfse', titulo: 'Emitir nota fiscal de serviço (NFS-e)', cat: 'Empresas', rota: '#/em-breve?s=nfse', tempo: '3 min', online: true,
    termos: 'nota fiscal nfse nfs-e iss emitir nota servico empresa mei prestador' },
  { id: 'alvara', titulo: 'Alvará de funcionamento', cat: 'Empresas', rota: '#/em-breve?s=alvara', tempo: '15 min', online: true,
    termos: 'alvara alvará abrir empresa funcionamento licenca licença comercio negocio autonomo' },
  { id: 'obra', titulo: 'Aprovar projeto / licença de obra / habite-se', cat: 'Obras', rota: '#/em-breve?s=obra', tempo: '20 min', online: true,
    termos: 'obra construir construcao reforma projeto aprovacao habite-se habitese desmembramento loteamento planta arquiteto engenheiro' },
  { id: 'ouvidoria', titulo: 'Falar com a Ouvidoria (reclamação, elogio, denúncia)', cat: 'Atendimento', rota: '#/em-breve?s=ouvidoria', tempo: '3 min', online: true,
    termos: 'ouvidoria reclamacao reclamar denuncia elogio sugestao 156 falar com prefeitura buraco lampada luz poste lixo' },
  { id: 'zeladoria', titulo: 'Pedir conserto: buraco, iluminação, poda, lixo', cat: 'Zeladoria', rota: '#/em-breve?s=zeladoria', tempo: '2 min', online: true,
    termos: 'buraco asfalto rua iluminacao poste lampada queimada poda arvore lixo entulho limpeza boca de lobo' },
  { id: 'transparencia', titulo: 'Transparência: gastos, salários e contratos', cat: 'Transparência', rota: '#/em-breve?s=transparencia', tempo: '—', online: true,
    termos: 'transparencia gastos despesas salario servidor contrato licitacao lai informacao pedido esic' },
  { id: 'itbi', titulo: 'ITBI — compra e venda de imóvel', cat: 'Impostos', rota: '#/em-breve?s=itbi', tempo: '10 min', online: true,
    termos: 'itbi compra venda imovel escritura transferencia' }
];

/* Processo de exemplo — inspirado no tipo de situação relatada (nº e nomes fictícios) */
window.PROCESSO = {
  assunto: 'Desmembramento de lote (exemplo)',
  aberto: '02/10/2026', status: 'Aguardando você', prazo: '05/12/2026',
  setor: 'Secretaria de Planejamento (exemplo)', responsavel: 'Analista: João S. (fictício)',
  etapas: ['Pedido enviado', 'Triagem', 'Análise técnica', 'Aguardando você', 'Decisão', 'Concluído'],
  etapaAtual: 3,
  pendencia: {
    titulo: 'Informe a qual ato da matrícula a área se refere',
    texto: 'Um dos planimétricos cita um número de registro diferente da matrícula. Confirme o ato correto (ex.: R-26/00.000) e, se possível, anexe a planta corrigida.',
    pedidoPor: 'João S. (fictício) · Análise técnica', em: '18/11/2026 às 10:42'
  },
  timeline: [
    { data: '18/11/2026 10:42', tipo: 'pedido', titulo: 'Análise técnica pediu uma informação', autor: 'João S. (fictício) · Planejamento', detalhe: 'Pendência aberta: informar o ato da matrícula. Processo pausado até sua resposta.' },
    { data: '10/11/2026 15:03', tipo: 'tramite', titulo: 'Processo encaminhado para Análise técnica', autor: 'Triagem', detalhe: 'Encaminhado ao setor de parcelamento do solo.' },
    { data: '02/10/2026 09:15', tipo: 'anexo', titulo: '4 documentos anexados por você', autor: 'Maria (exemplo) · Requerente', arquivos: ['planta-situacao.pdf (1,2 MB)', 'planimetrico-lote-A.pdf (860 KB)', 'ART-responsavel-tecnico.pdf (310 KB)', 'matricula-atualizada.pdf (540 KB)'] },
    { data: '02/10/2026 09:12', tipo: 'inicio', titulo: 'Pedido enviado', autor: 'Maria (exemplo) · Requerente', detalhe: 'Protocolo gerado automaticamente. Você recebeu a confirmação por e-mail e WhatsApp.' }
  ]
};

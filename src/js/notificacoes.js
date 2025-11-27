// Sistema de Notificações Profissional - HelioOne
class SistemaNotificacoes {
    constructor() {
        this.notificacoes = this.carregarNotificacoes();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.atualizarBadge();
        this.carregarNotificacoesExistentes();
        console.log('Sistema de notificações inicializado');
    }

    setupEventListeners() {
        // Botão de notificações
        const botaoNotificacoes = document.getElementById('botao-notificacoes');
        const painelNotificacoes = document.getElementById('painel-notificacoes');
        const fecharNotificacoes = document.getElementById('fechar-notificacoes');
        const marcarTodasLidas = document.getElementById('marcar-todas-lidas');

        if (botaoNotificacoes) {
            botaoNotificacoes.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePainel();
            });
        }

        if (fecharNotificacoes) {
            fecharNotificacoes.addEventListener('click', () => {
                this.fecharPainel();
            });
        }

        if (marcarTodasLidas) {
            marcarTodasLidas.addEventListener('click', () => {
                this.marcarTodasComoLidas();
            });
        }

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!painelNotificacoes.contains(e.target) && !botaoNotificacoes.contains(e.target)) {
                this.fecharPainel();
            }
        });
    }

    togglePainel() {
        const painel = document.getElementById('painel-notificacoes');
        painel.classList.toggle('hidden');
        
        if (!painel.classList.contains('hidden')) {
            setTimeout(() => {
                painel.classList.remove('opacity-0', 'scale-95');
                painel.classList.add('opacity-100', 'scale-100');
            }, 50);
        } else {
            painel.classList.remove('opacity-100', 'scale-100');
            painel.classList.add('opacity-0', 'scale-95');
        }
    }

    fecharPainel() {
        const painel = document.getElementById('painel-notificacoes');
        painel.classList.remove('opacity-100', 'scale-100');
        painel.classList.add('opacity-0', 'scale-95');
        
        setTimeout(() => {
            painel.classList.add('hidden');
        }, 300);
    }

    carregarNotificacoes() {
        const salvas = localStorage.getItem('helione_notificacoes');
        return salvas ? JSON.parse(salvas) : this.criarNotificacoesPadrao();
    }

    criarNotificacoesPadrao() {
        const notificacoesPadrao = [
            {
                id: 1,
                tipo: 'consulta',
                titulo: 'Consulta Confirmada',
                mensagem: 'Sua consulta com Dr. Silva está confirmada para 15/01/2024 às 14:30',
                lida: false,
                data: new Date().toISOString(),
                prioridade: 'media',
                icone: 'fas fa-calendar-check'
            },
            {
                id: 2,
                tipo: 'lembrete',
                titulo: 'Lembrete de Medicação',
                mensagem: 'Lembre-se de tomar sua medicação às 20:00',
                lida: false,
                data: new Date().toISOString(),
                prioridade: 'alta',
                icone: 'fas fa-pills'
            },
            {
                id: 3,
                tipo: 'resultado',
                titulo: 'Resultados Disponíveis',
                mensagem: 'Seus exames laboratoriais estão disponíveis para consulta',
                lida: true,
                data: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
                prioridade: 'media',
                icone: 'fas fa-file-medical'
            }
        ];
        
        this.salvarNotificacoes(notificacoesPadrao);
        return notificacoesPadrao;
    }

    salvarNotificacoes(notificacoes) {
        localStorage.setItem('helione_notificacoes', JSON.stringify(notificacoes));
    }

    carregarNotificacoesExistentes() {
        const lista = document.getElementById('lista-notificacoes');
        const semNotificacoes = document.getElementById('sem-notificacoes');
        
        if (!lista) return;

        // Limpar lista
        lista.innerHTML = '';
        
        const notificacoesNaoLidas = this.notificacoes.filter(n => !n.lida);
        
        if (this.notificacoes.length === 0) {
            semNotificacoes.classList.remove('hidden');
            return;
        }

        semNotificacoes.classList.add('hidden');

        this.notificacoes.forEach(notificacao => {
            const elemento = this.criarElementoNotificacao(notificacao);
            lista.appendChild(elemento);
        });
    }

    criarElementoNotificacao(notificacao) {
        const div = document.createElement('div');
        const corPrioridade = this.getCorPrioridade(notificacao.prioridade);
        const dataFormatada = this.formatarData(notificacao.data);
        
        div.className = `p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-200 ${notificacao.lida ? 'bg-white' : 'bg-blue-50'}`;
        div.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i class="${notificacao.icone} ${corPrioridade.texto} text-lg mt-1"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <p class="font-semibold text-gray-800 text-sm ${notificacao.lida ? '' : 'font-bold'}">${notificacao.titulo}</p>
                        <span class="text-xs text-gray-500">${dataFormatada}</span>
                    </div>
                    <p class="text-gray-600 text-sm mt-1">${notificacao.mensagem}</p>
                    <div class="flex justify-between items-center mt-2">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${corPrioridade.fundo} ${corPrioridade.texto}">
                            ${notificacao.prioridade.toUpperCase()}
                        </span>
                        ${!notificacao.lida ? `
                            <button onclick="sistemaNotificacoes.marcarComoLida(${notificacao.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-xs font-medium transition duration-300">
                                Marcar como lida
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    getCorPrioridade(prioridade) {
        const cores = {
            alta: { fundo: 'bg-red-100', texto: 'text-red-800' },
            media: { fundo: 'bg-yellow-100', texto: 'text-yellow-800' },
            baixa: { fundo: 'bg-blue-100', texto: 'text-blue-800' }
        };
        return cores[prioridade] || cores.media;
    }

    formatarData(dataString) {
        const data = new Date(dataString);
        const agora = new Date();
        const diffMs = agora - data;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins} min atrás`;
        if (diffHours < 24) return `${diffHours} h atrás`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        
        return data.toLocaleDateString('pt-BR');
    }

    atualizarBadge() {
        const badge = document.getElementById('badge-notificacoes');
        const notificacoesNaoLidas = this.notificacoes.filter(n => !n.lida).length;
        
        if (badge) {
            if (notificacoesNaoLidas > 0) {
                badge.classList.remove('hidden');
                badge.textContent = notificacoesNaoLidas > 99 ? '99+' : notificacoesNaoLidas;
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    adicionarNotificacao(titulo, mensagem, tipo = 'info', prioridade = 'media') {
        const novaNotificacao = {
            id: Date.now(),
            tipo,
            titulo,
            mensagem,
            lida: false,
            data: new Date().toISOString(),
            prioridade,
            icone: this.getIconePorTipo(tipo)
        };

        this.notificacoes.unshift(novaNotificacao); // Adiciona no início
        this.salvarNotificacoes(this.notificacoes);
        this.carregarNotificacoesExistentes();
        this.atualizarBadge();
        
        // Mostrar notificação toast se o painel não estiver aberto
        if (!document.getElementById('painel-notificacoes').classList.contains('hidden')) {
            this.mostrarNotificacaoToast(novaNotificacao);
        }
    }

    getIconePorTipo(tipo) {
        const icones = {
            consulta: 'fas fa-calendar-check',
            lembrete: 'fas fa-bell',
            resultado: 'fas fa-file-medical',
            alerta: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            sucesso: 'fas fa-check-circle'
        };
        return icones[tipo] || icones.info;
    }

    marcarComoLida(id) {
        this.notificacoes = this.notificacoes.map(notificacao =>
            notificacao.id === id ? { ...notificacao, lida: true } : notificacao
        );
        
        this.salvarNotificacoes(this.notificacoes);
        this.carregarNotificacoesExistentes();
        this.atualizarBadge();
    }

    marcarTodasComoLidas() {
        this.notificacoes = this.notificacoes.map(notificacao => ({
            ...notificacao,
            lida: true
        }));
        
        this.salvarNotificacoes(this.notificacoes);
        this.carregarNotificacoesExistentes();
        this.atualizarBadge();
    }

    mostrarNotificacaoToast(notificacao) {
        // Implementação opcional para notificações toast
        console.log('Nova notificação:', notificacao);
    }
}

// Inicializar sistema
let sistemaNotificacoes;

document.addEventListener('DOMContentLoaded', function() {
    sistemaNotificacoes = new SistemaNotificacoes();
    
    // Expor globalmente para uso em outros scripts
    window.sistemaNotificacoes = sistemaNotificacoes;
});
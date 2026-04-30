package com.locvac.config;

import com.locvac.model.associacao.AgendaVacinal;
import com.locvac.model.associacao.Notificacao;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.PublicoAlvo;
import com.locvac.model.enums.StatusAplicacao;
import com.locvac.model.enums.TipoNotificacao;
import com.locvac.repository.AgendaVacinalRepository;
import com.locvac.repository.CampanhaRepository;
import com.locvac.repository.NotificacaoRepository;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.service.NotificacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Component
public class NotificacaoScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoScheduler.class);

    private static final Set<Integer> OFFSETS_VACINA_PROXIMA = Set.of(30, 14, 7, 0);
    private static final Set<Integer> OFFSETS_CAMPANHA = Set.of(7, 3, 1, 0);

    private final AgendaVacinalRepository agendaRepository;
    private final CampanhaRepository campanhaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioPessoaRepository usuarioPessoaRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final NotificacaoService notificacaoService;

    public NotificacaoScheduler(
            AgendaVacinalRepository agendaRepository,
            CampanhaRepository campanhaRepository,
            UsuarioRepository usuarioRepository,
            UsuarioPessoaRepository usuarioPessoaRepository,
            NotificacaoRepository notificacaoRepository,
            NotificacaoService notificacaoService
    ) {
        this.agendaRepository = agendaRepository;
        this.campanhaRepository = campanhaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.notificacaoService = notificacaoService;
    }

    @Scheduled(cron = "0 0 7 * * *", zone = "America/Sao_Paulo")
    @Transactional
    public void executar() {
        log.info("Iniciando varredura diária de notificações");
        LocalDate hoje = LocalDate.now();

        processarAgendas(hoje);
        processarCampanhas(hoje);
        cleanupPersistentes(hoje);

        log.info("Varredura de notificações finalizada");
    }

    private void processarAgendas(LocalDate hoje) {
        List<AgendaVacinal> pendentes = agendaRepository.findByStatusNotIn(
                List.of(StatusAplicacao.APLICADA, StatusAplicacao.CANCELADA)
        );

        for (AgendaVacinal a : pendentes) {
            if (a.getDataPrevista() == null) continue;

            long dias = ChronoUnit.DAYS.between(hoje, a.getDataPrevista());

            if (dias >= 0 && OFFSETS_VACINA_PROXIMA.contains((int) dias)) {
                notificacaoService.notificarVacinaProxima(a, (int) dias);
            } else if (dias < 0 && Math.abs(dias) % 7 == 0) {
                notificacaoService.notificarVacinaAtrasada(a, (int) dias);
            }
        }
    }

    private void processarCampanhas(LocalDate hoje) {
        List<Campanha> ativas = campanhaRepository.findByAtivaTrueAndDataFimGreaterThanEqual(hoje);

        for (Campanha c : ativas) {
            if (c.getDataInicio() == null) continue;

            long dias = ChronoUnit.DAYS.between(hoje, c.getDataInicio());
            if (dias < 0 || !OFFSETS_CAMPANHA.contains((int) dias)) continue;

            PublicoAlvo alvo = c.getPublicoAlvo();
            for (Usuario u : usuarioRepository.findAll()) {
                if (alvo != PublicoAlvo.TODOS && !usuarioTemPessoaNoAlvo(u, alvo)) continue;
                notificacaoService.notificarCampanha(u, c, (int) dias);
            }
        }
    }

    private boolean usuarioTemPessoaNoAlvo(Usuario u, PublicoAlvo alvo) {
        List<UsuarioPessoa> vinculos = usuarioPessoaRepository.findByUsuarioId(u.getId());
        for (UsuarioPessoa up : vinculos) {
            Pessoa p = up.getPessoa();
            if (p != null && alvo.inclui(p.getDataNascimento())) {
                return true;
            }
        }
        return false;
    }

    private void cleanupPersistentes(LocalDate hoje) {
        List<Notificacao> persistentes = notificacaoRepository.findByPersistenteTrue();

        for (Notificacao n : persistentes) {
            boolean apagar = false;
            TipoNotificacao tipo = n.getTipoNotificacao();

            if (tipo == TipoNotificacao.NOVA_CAMPANHA && n.getCampanha() != null) {
                if (n.getCampanha().getDataFim() != null && n.getCampanha().getDataFim().isBefore(hoje)) {
                    apagar = true;
                }
            } else if ((tipo == TipoNotificacao.PROXIMA_VACINA || tipo == TipoNotificacao.VACINA_ATRASADA)
                    && n.getAgenda() != null) {
                StatusAplicacao status = n.getAgenda().getStatus();
                if (status == StatusAplicacao.APLICADA || status == StatusAplicacao.CANCELADA) {
                    apagar = true;
                }
            }

            if (apagar) notificacaoRepository.delete(n);
        }
    }
}

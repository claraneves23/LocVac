package com.locvac.repository;

import com.locvac.model.associacao.AgendaVacinal;
import com.locvac.model.associacao.Notificacao;
import com.locvac.model.core.Campanha;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    boolean existsByAgendaAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
            AgendaVacinal agenda,
            TipoNotificacao tipo,
            Integer diasOffset,
            LocalDate dataCriacao
    );

    boolean existsByUsuarioAndCampanhaAndTipoNotificacaoAndDiasOffsetAndDataCriacao(
            Usuario usuario,
            Campanha campanha,
            TipoNotificacao tipo,
            Integer diasOffset,
            LocalDate dataCriacao
    );

    List<Notificacao> findByUsuarioAndLidaFalseOrUsuarioAndPersistenteTrueOrderByDataCriacaoDesc(
            Usuario usuario1, Usuario usuario2
    );

    List<Notificacao> findByPersistenteTrue();

    List<Notificacao> findByPessoaId(Long idPessoa);
}

package com.locvac.service.impl;

import com.locvac.dto.auth.TokenData;
import com.locvac.dto.compartilhamento.AcessoResponseDTO;
import com.locvac.dto.compartilhamento.ConvitePreviewDTO;
import com.locvac.dto.compartilhamento.ConvitePreviewItemDTO;
import com.locvac.dto.compartilhamento.ConviteResponseDTO;
import com.locvac.dto.compartilhamento.CriarConviteRequestDTO;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.ConviteCompartilhamento;
import com.locvac.model.core.Pessoa;
import com.locvac.model.core.Usuario;
import com.locvac.model.enums.StatusConvite;
import com.locvac.model.enums.TipoVinculo;
import com.locvac.repository.ConviteCompartilhamentoRepository;
import com.locvac.repository.PessoaRepository;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.service.CompartilhamentoService;
import com.locvac.service.PessoaService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CompartilhamentoServiceImpl implements CompartilhamentoService {

    private static final char[] ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int CODIGO_TAMANHO = 8;
    private static final int VALIDADE_PADRAO_MIN = 1440;      // 24h
    private static final int VALIDADE_MIN = 5;
    private static final int VALIDADE_MAX = 10080;            // 7 dias
    private static final String DEEP_LINK_BASE = "locvac://importar?token=";

    private final ConviteCompartilhamentoRepository conviteRepository;
    private final UsuarioPessoaRepository usuarioPessoaRepository;
    private final PessoaRepository pessoaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PessoaService pessoaService;
    private final SecureRandom random = new SecureRandom();

    public CompartilhamentoServiceImpl(
            ConviteCompartilhamentoRepository conviteRepository,
            UsuarioPessoaRepository usuarioPessoaRepository,
            PessoaRepository pessoaRepository,
            UsuarioRepository usuarioRepository,
            PessoaService pessoaService
    ) {
        this.conviteRepository = conviteRepository;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
        this.pessoaRepository = pessoaRepository;
        this.usuarioRepository = usuarioRepository;
        this.pessoaService = pessoaService;
    }

    @Override
    public ConviteResponseDTO criarConvite(CriarConviteRequestDTO dto) {
        UUID usuarioId = usuarioAutenticado().usuarioId();

        // Remove duplicados preservando a ordem informada.
        List<Long> ids = new ArrayList<>(new LinkedHashSet<>(dto.idsPessoa()));
        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione ao menos um dependente.");
        }

        List<String> nomes = new ArrayList<>();
        for (Long idPessoa : ids) {
            if (!usuarioPessoaRepository.existsByUsuarioIdAndPessoaId(usuarioId, idPessoa)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso a um dos dependentes selecionados.");
            }
            Pessoa pessoa = pessoaRepository.findById(idPessoa)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dependente não encontrado."));
            nomes.add(pessoa.getNome());
        }

        Usuario origem = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        int validade = dto.validadeMinutos() != null
                ? Math.max(VALIDADE_MIN, Math.min(VALIDADE_MAX, dto.validadeMinutos()))
                : VALIDADE_PADRAO_MIN;

        ConviteCompartilhamento convite = new ConviteCompartilhamento();
        convite.setToken(gerarToken());
        convite.setCodigo(gerarCodigoUnico());
        convite.setPessoaIds(ids);
        convite.setUsuarioOrigem(origem);
        convite.setPodeEditar(true);
        convite.setStatus(StatusConvite.PENDENTE);
        convite.setExpiraEm(LocalDateTime.now().plusMinutes(validade));
        convite = conviteRepository.save(convite);

        return new ConviteResponseDTO(
                convite.getToken(),
                convite.getCodigo(),
                DEEP_LINK_BASE + convite.getToken(),
                convite.getExpiraEm(),
                nomes
        );
    }

    @Override
    public ConvitePreviewDTO previewConvite(String tokenOuCodigo) {
        ConviteCompartilhamento convite = resolver(tokenOuCodigo);
        garantirPendenteValido(convite);

        UUID usuarioId = usuarioAutenticado().usuarioId();

        List<ConvitePreviewItemDTO> itens = new ArrayList<>();
        for (Long idPessoa : convite.getPessoaIds()) {
            pessoaRepository.findById(idPessoa).ifPresent(pessoa -> itens.add(new ConvitePreviewItemDTO(
                    idPessoa,
                    pessoa.getNome(),
                    usuarioPessoaRepository.existsByUsuarioIdAndPessoaId(usuarioId, idPessoa)
            )));
        }

        return new ConvitePreviewDTO(
                itens,
                convite.getUsuarioOrigem().getNome(),
                convite.isPodeEditar(),
                convite.getExpiraEm()
        );
    }

    @Override
    public void aceitarConvite(String tokenOuCodigo) {
        ConviteCompartilhamento convite = resolver(tokenOuCodigo);
        garantirPendenteValido(convite);

        UUID usuarioId = usuarioAutenticado().usuarioId();

        if (convite.getUsuarioOrigem().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Você não pode aceitar o próprio convite.");
        }

        Usuario destino = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        int vinculados = 0;
        for (Long idPessoa : convite.getPessoaIds()) {
            Pessoa pessoa = pessoaRepository.findById(idPessoa).orElse(null);
            if (pessoa == null) {
                continue; // dependente removido após a criação do convite
            }
            if (usuarioPessoaRepository.existsByUsuarioIdAndPessoaId(usuarioId, idPessoa)) {
                continue; // já tem acesso a este
            }
            UsuarioPessoa vinculo = new UsuarioPessoa();
            vinculo.setUsuario(destino);
            vinculo.setPessoa(pessoa);
            vinculo.setTipoVinculo(TipoVinculo.DEPENDENTE);
            vinculo.setPodeVisualizar(true);
            vinculo.setPodeEditar(convite.isPodeEditar());
            vinculo.setDataVinculo(LocalDate.now());
            usuarioPessoaRepository.save(vinculo);
            vinculados++;
        }

        if (vinculados == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Você já tem acesso a todos os dependentes deste convite.");
        }

        convite.setStatus(StatusConvite.ACEITO);
        convite.setAceitoEm(LocalDateTime.now());
        convite.setUsuarioDestino(destino);
        conviteRepository.save(convite);
    }

    @Override
    public void cancelarConvite(String tokenOuCodigo) {
        ConviteCompartilhamento convite = resolver(tokenOuCodigo);
        UUID usuarioId = usuarioAutenticado().usuarioId();

        if (!convite.getUsuarioOrigem().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas quem gerou o convite pode cancelá-lo.");
        }
        if (convite.getStatus() == StatusConvite.PENDENTE) {
            convite.setStatus(StatusConvite.REVOGADO);
            conviteRepository.save(convite);
        }
    }

    @Override
    public List<AcessoResponseDTO> listarAcessos(Long idPessoa) {
        UUID usuarioId = usuarioAutenticado().usuarioId();
        if (!usuarioPessoaRepository.existsByUsuarioIdAndPessoaId(usuarioId, idPessoa)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não tem acesso a este dependente.");
        }

        return usuarioPessoaRepository.findByPessoaId(idPessoa).stream()
                .map(vinculo -> {
                    Usuario u = vinculo.getUsuario();
                    return new AcessoResponseDTO(
                            vinculo.getId(),
                            u.getNome(),
                            u.getEmail(),
                            vinculo.getTipoVinculo() != null ? vinculo.getTipoVinculo().name() : null,
                            vinculo.isPodeEditar(),
                            vinculo.getDataVinculo(),
                            u.getId().equals(usuarioId)
                    );
                })
                .toList();
    }

    @Override
    public void revogarAcesso(Long idUsuarioPessoa) {
        UUID usuarioId = usuarioAutenticado().usuarioId();
        UsuarioPessoa alvo = usuarioPessoaRepository.findByIdEquals(idUsuarioPessoa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acesso não encontrado."));

        Long idPessoa = alvo.getPessoa().getId();
        boolean ehProprio = alvo.getUsuario().getId().equals(usuarioId);
        boolean controla = usuarioPessoaRepository.existsByUsuarioIdAndPessoaId(usuarioId, idPessoa);
        if (!ehProprio && !controla) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Você não pode revogar este acesso.");
        }

        long total = usuarioPessoaRepository.findByPessoaId(idPessoa).size();
        if (total <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este é o único responsável. Para excluir o dependente use a remoção.");
        }
        usuarioPessoaRepository.delete(alvo);
    }

    @Override
    public void removerMeuAcesso(Long idPessoa) {
        UUID usuarioId = usuarioAutenticado().usuarioId();
        List<UsuarioPessoa> meus = usuarioPessoaRepository.findByUsuarioIdAndPessoaId(usuarioId, idPessoa);
        if (meus.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo não encontrado.");
        }

        long total = usuarioPessoaRepository.findByPessoaId(idPessoa).size();
        if (total > 1) {
            // Há outros responsáveis: desvincula apenas este usuário, preservando a pessoa.
            usuarioPessoaRepository.deleteAll(meus);
        } else {
            // Último responsável: exclui a pessoa por completo (doses, vínculos, foto, etc.).
            pessoaService.deletar(idPessoa);
        }
    }

    // ---------- helpers ----------

    private ConviteCompartilhamento resolver(String tokenOuCodigo) {
        String valor = tokenOuCodigo == null ? "" : tokenOuCodigo.trim();
        return conviteRepository.findByToken(valor)
                .or(() -> conviteRepository.findByCodigoIgnoreCase(valor))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Convite não encontrado."));
    }

    private void garantirPendenteValido(ConviteCompartilhamento convite) {
        if (convite.getStatus() == StatusConvite.ACEITO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este convite já foi utilizado.");
        }
        if (convite.getStatus() == StatusConvite.REVOGADO) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este convite foi cancelado.");
        }
        if (convite.getExpiraEm().isBefore(LocalDateTime.now())) {
            if (convite.getStatus() != StatusConvite.EXPIRADO) {
                convite.setStatus(StatusConvite.EXPIRADO);
                conviteRepository.save(convite);
            }
            throw new ResponseStatusException(HttpStatus.GONE, "Este convite expirou.");
        }
    }

    private String gerarToken() {
        return UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private String gerarCodigoUnico() {
        for (int tentativa = 0; tentativa < 10; tentativa++) {
            StringBuilder sb = new StringBuilder(CODIGO_TAMANHO);
            for (int i = 0; i < CODIGO_TAMANHO; i++) {
                sb.append(ALFABETO_CODIGO[random.nextInt(ALFABETO_CODIGO.length)]);
            }
            String codigo = sb.toString();
            if (conviteRepository.findByCodigoIgnoreCase(codigo).isEmpty()) {
                return codigo;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao gerar código do convite.");
    }

    private TokenData usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof TokenData dados)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido.");
        }
        return dados;
    }
}

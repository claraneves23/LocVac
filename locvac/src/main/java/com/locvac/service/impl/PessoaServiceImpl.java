package com.locvac.service.impl;

import com.locvac.dto.auth.TokenData;
import com.locvac.dto.pessoa.PessoaRequestDTO;
import com.locvac.dto.pessoa.PessoaResponseDTO;
import com.locvac.mapper.PessoaMapper;
import com.locvac.model.associacao.UsuarioPessoa;
import com.locvac.model.core.Usuario;
import com.locvac.repository.DoseAplicadaRepository;
import com.locvac.repository.NotificacaoRepository;
import com.locvac.repository.ParticipacaoCampanhaRepository;
import com.locvac.repository.UsuarioPessoaRepository;
import com.locvac.repository.UsuarioRepository;
import com.locvac.model.enums.TipoVinculo;
import com.locvac.model.core.Pessoa;
import com.locvac.repository.PessoaRepository;
import com.locvac.service.PessoaService;
import com.locvac.utils.ValidacaoCnsUtils;
import com.locvac.utils.ValidacaoCpfUtils;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class PessoaServiceImpl implements PessoaService {

    private final PessoaRepository repository;
    private final PessoaMapper mapper;
    private final UsuarioPessoaRepository usuarioPessoaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DoseAplicadaRepository doseAplicadaRepository;
    private final ParticipacaoCampanhaRepository participacaoCampanhaRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final ValidacaoCpfUtils validacaoCpfUtils;
    private final ValidacaoCnsUtils validacaoCnsUtils;

    public PessoaServiceImpl(
            PessoaRepository repository,
            PessoaMapper mapper,
            UsuarioPessoaRepository usuarioPessoaRepository,
            UsuarioRepository usuarioRepository,
            DoseAplicadaRepository doseAplicadaRepository,
            ParticipacaoCampanhaRepository participacaoCampanhaRepository,
            NotificacaoRepository notificacaoRepository,
            ValidacaoCpfUtils validacaoCpfUtils,
            ValidacaoCnsUtils validacaoCnsUtils
    ) {
        this.repository = repository;
        this.mapper = mapper;
        this.usuarioPessoaRepository = usuarioPessoaRepository;
        this.usuarioRepository = usuarioRepository;
        this.doseAplicadaRepository = doseAplicadaRepository;
        this.participacaoCampanhaRepository = participacaoCampanhaRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.validacaoCpfUtils = validacaoCpfUtils;
        this.validacaoCnsUtils = validacaoCnsUtils;
    }
    @Override
    public List<PessoaResponseDTO> listarDependentes(java.util.UUID usuarioId) {
        TipoVinculo tipoDependente = TipoVinculo.getByCodigo(3);
        List<UsuarioPessoa> dependentes = usuarioPessoaRepository.findByUsuarioIdAndTipoVinculo(usuarioId, tipoDependente);
        return dependentes.stream()
            .map(vinculo -> mapper.toResponse(vinculo.getPessoa(), vinculo.getDscParentesco()))
            .toList();
    }

    @Override
    public PessoaResponseDTO cadastrar(PessoaRequestDTO dto) {
        validacaoCpfUtils.validarCpfDuplicado(dto.cpf());
        validacaoCnsUtils.validarCnsDuplicado(dto.cns());
        Pessoa pessoa = mapper.toEntity(dto);
        Pessoa salvo = repository.save(pessoa);
        return mapper.toResponse(salvo);
    }

    @Override
    @Transactional
    public PessoaResponseDTO cadastrarTitular(PessoaRequestDTO dto) {
        TokenData dados = usuarioAutenticado();

        if (usuarioPessoaRepository.existsByUsuarioIdAndTipoVinculo(dados.usuarioId(), TipoVinculo.TITULAR)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Titular já cadastrado para este usuário.");
        }
        validacaoCpfUtils.validarCpfDuplicado(dto.cpf());
        validacaoCnsUtils.validarCnsDuplicado(dto.cns());

        Usuario usuario = usuarioRepository.findById(dados.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        Pessoa pessoa = mapper.toEntity(dto);
        pessoa.setAtivo(true);
        pessoa = repository.save(pessoa);

        UsuarioPessoa vinculo = new UsuarioPessoa();
        vinculo.setUsuario(usuario);
        vinculo.setPessoa(pessoa);
        vinculo.setTipoVinculo(TipoVinculo.TITULAR);
        vinculo.setPodeVisualizar(true);
        vinculo.setPodeEditar(true);
        vinculo.setDataVinculo(LocalDate.now());
        usuarioPessoaRepository.save(vinculo);

        usuario.setNome(dto.nome());
        usuario.setTelefone(dto.telefone());
        usuarioRepository.save(usuario);

        return mapper.toResponse(pessoa);
    }

    private TokenData usuarioAutenticado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof TokenData dados)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido.");
        }
        return dados;
    }

    @Override
    public List<PessoaResponseDTO> listarTodos() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public PessoaResponseDTO getPerfil(Long idPessoa) {
        Pessoa pessoa = repository.findById(idPessoa)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada"));
        return mapper.toResponse(pessoa);
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        Pessoa pessoa = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada com o ID: " + id));
        notificacaoRepository.deleteAll(notificacaoRepository.findByPessoaId(id));
        doseAplicadaRepository.deleteAll(doseAplicadaRepository.findByPessoaId(id));
        participacaoCampanhaRepository.deleteAll(participacaoCampanhaRepository.findByPessoaId(id));
        usuarioPessoaRepository.deleteAll(usuarioPessoaRepository.findByPessoaId(id));
        repository.delete(pessoa);
    }

    @Override
    public PessoaResponseDTO atualizar(Long id, PessoaRequestDTO dto) {
        Pessoa pessoa = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pessoa não encontrada com o ID: " + id));
        pessoa.setNome(dto.nome());
        pessoa.setDataNascimento(dto.dataNascimento());
        pessoa.setSexoBiologico(dto.sexoBiologico());
        pessoa.setCep(dto.cep());
        pessoa.setRua(dto.rua());
        pessoa.setComplemento(dto.complemento());
        pessoa.setMunicipio(dto.municipio());
        pessoa.setEstado(dto.estado());
        pessoa.setTelefone(dto.telefone());
        pessoa.setFotoUrl(dto.fotoUrl());
        pessoa.setNomeResponsavel(dto.nomeResponsavel());
        return mapper.toResponse(repository.save(pessoa));
    }
}

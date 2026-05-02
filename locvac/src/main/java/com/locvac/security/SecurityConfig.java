package com.locvac.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtFilter jwtFilter, CorsConfigurationSource corsConfigurationSource) {
        this.jwtFilter = jwtFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Desabilita CSRF — não necessário para APIs REST stateless
            .csrf(AbstractHttpConfigurer::disable)

            // Sem sessão — autenticação via JWT a cada requisição
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Regras de acesso por rota
            .authorizeHttpRequests(auth -> auth
                // Rotas públicas — não precisam de token
                .requestMatchers(
                    "/auth/login",
                    "/auth/refresh",
                    "/auth/mfa/verify",
                    "/usuarios/cadastro/iniciar",
                    "/usuarios/cadastro/confirmar",
                    "/usuarios/cadastro/reenviar",
                    "/usuarios/senha/esqueci",
                    "/usuarios/senha/reenviar",
                    "/usuarios/senha/redefinir",
                    "/error"
                ).permitAll()

                // Todas as outras rotas exigem autenticação
                .anyRequest().authenticated()
            )

            // Adiciona o filtro JWT antes do filtro padrão do Spring Security
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
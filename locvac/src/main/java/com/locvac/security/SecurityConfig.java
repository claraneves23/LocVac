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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
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
                    "/usuarios/cadastro",
                    "/campanhas",
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
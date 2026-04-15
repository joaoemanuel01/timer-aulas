package com.timerpro.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDTO {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        @Size(max = 150)
        private String email;

        @NotBlank(message = "Senha e obrigatoria")
        @Size(min = 8, message = "Senha deve ter no minimo 8 caracteres")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Senha deve conter maiuscula, minuscula e numero"
        )
        private String password;
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Email e obrigatorio")
        @Email(message = "Email invalido")
        private String email;

        @NotBlank(message = "Senha e obrigatoria")
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String aulaMode;
        private String aulaImageUrl;
    }
}
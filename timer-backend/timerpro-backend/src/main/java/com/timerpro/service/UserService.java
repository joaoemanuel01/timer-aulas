package com.timerpro.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.timerpro.dto.UserDTO.*;
import com.timerpro.model.User;
import com.timerpro.repository.UserRepository;
import com.timerpro.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final Cloudinary cloudinary;

    // Busca usuario pelo token
    private User getUserFromToken(String token) {
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    // GET /api/user/me
    public UserResponse getMe(String token) {
        User user = getUserFromToken(token);
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getAulaMode(), user.getAulaImageUrl());
    }

    // PATCH /api/user/prefs — atualiza modo (cronometro ou personalizado)
    public UserResponse updatePrefs(String token, UpdatePrefsRequest dto) {
        User user = getUserFromToken(token);
        user.setAulaMode(dto.getAulaMode());

        // Se voltou para cronometro, limpa a imagem
        if ("cronometro".equals(dto.getAulaMode())) {
            user.setAulaImageUrl(null);
        }

        userRepository.save(user);
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getAulaMode(), user.getAulaImageUrl());
    }

    // POST /api/user/upload-aula-image — faz upload e salva URL
    public Map<String, String> uploadAulaImage(String token, MultipartFile file) {
        User user = getUserFromToken(token);

        if (file.isEmpty()) {
            throw new RuntimeException("Arquivo vazio");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", "timerpro/aula_" + user.getId(),
                            "overwrite", true
                    )
            );

            String imageUrl = (String) uploadResult.get("secure_url");

            // Salva URL e define modo como personalizado automaticamente
            user.setAulaImageUrl(imageUrl);
            user.setAulaMode("personalizado");
            userRepository.save(user);

            return Map.of(
                    "url",      imageUrl,
                    "aulaMode", "personalizado"
            );

        } catch (IOException e) {
            throw new RuntimeException("Erro ao fazer upload: " + e.getMessage());
        }
    }

    // DELETE /api/user/aula-image — remove imagem e volta para cronometro
    public UserResponse removeAulaImage(String token) {
        User user = getUserFromToken(token);

        // Remove do Cloudinary
        try {
            cloudinary.uploader().destroy(
                    "timerpro/aula_" + user.getId(),
                    ObjectUtils.emptyMap()
            );
        } catch (IOException ignored) {
            // ignora erro se imagem nao existir no Cloudinary
        }

        user.setAulaImageUrl(null);
        user.setAulaMode("cronometro");
        userRepository.save(user);

        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getAulaMode(), user.getAulaImageUrl());
    }
}
package com.timerpro.controller;

import com.timerpro.dto.UserDTO.*;
import com.timerpro.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/user/me — dados do usuario logado
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getMe(token));
    }

    // PATCH /api/user/prefs — atualiza preferencia (cronometro ou personalizado)
    @PatchMapping("/prefs")
    public ResponseEntity<UserResponse> updatePrefs(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdatePrefsRequest dto) {
        return ResponseEntity.ok(userService.updatePrefs(token, dto));
    }

    // POST /api/user/upload-aula-image — envia imagem personalizada
    @PostMapping("/upload-aula-image")
    public ResponseEntity<Map<String, String>> uploadAulaImage(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadAulaImage(token, file));
    }

    // DELETE /api/user/aula-image — remove imagem e volta para cronometro
    @DeleteMapping("/aula-image")
    public ResponseEntity<UserResponse> removeAulaImage(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.removeAulaImage(token));
    }
}
package com.example.backend.controller;

import com.example.backend.model.Gimnasio;
import com.example.backend.model.Usuario;
import com.example.backend.repository.GimnasioRepository;
import com.example.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired
    private GimnasioRepository gimnasioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public static class RegistroSaaSRequest{
        public String nombreGimnasio;
        public String direccion;
        public String usernameAdmin;
        public String passwordAdmin;
    }
    @PostMapping("/registrar-cliente")
    public Map<String, String> registrarNuevoGimnasio(@RequestBody RegistroSaaSRequest request){
        if(usuarioRepository.findByUsername(request.usernameAdmin).isPresent()){
            throw new RuntimeException("Error: El nombre usuario ya está ocupado.");
        }
        Gimnasio nuevoGimnasio = new Gimnasio();
        nuevoGimnasio.setNombre(request.nombreGimnasio);
        nuevoGimnasio.setDireccion(request.direccion);
        Gimnasio gimnasioGuardado = gimnasioRepository.save(nuevoGimnasio);

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(request.usernameAdmin);
        nuevoUsuario.setPassword(passwordEncoder.encode(request.passwordAdmin));
        nuevoUsuario.setRol("ADMIN");
        nuevoUsuario.setIdGimnasio(gimnasioGuardado.getIdGimnasio());

        usuarioRepository.save(nuevoUsuario);

        return Map.of("mensaje", "Gimnasio ' "+ request.nombreGimnasio + " ' creado exitosamente.");
    }
}

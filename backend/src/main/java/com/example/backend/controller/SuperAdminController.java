package com.example.backend.controller;

import com.example.backend.model.Gimnasio;
import com.example.backend.model.Usuario;
import com.example.backend.repository.GimnasioRepository;
import com.example.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @Autowired
    private GimnasioRepository gimnasioRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public static class RegistroSaaSRequest {
        public String nombreGimnasio;
        public String direccion;
        public String usernameAdmin;
        public String passwordAdmin;
        public Integer mesesLicencia;
    }

    // 1. Obtener TODOS los gimnasios (Para tu nuevo Dashboard Maestro)
    @GetMapping("/gimnasios")
    public List<Gimnasio> listarGimnasios(Authentication authentication) {
        verificarSuperAdmin(authentication);
        return gimnasioRepository.findAll();
    }

    // 2. Registrar un nuevo gimnasio
    @PostMapping("/gimnasios")
    public Map<String, String> registrarNuevoGimnasio(@RequestBody RegistroSaaSRequest request, Authentication authentication) {
        verificarSuperAdmin(authentication);

        if (usuarioRepository.findByUsername(request.usernameAdmin).isPresent()) {
            throw new RuntimeException("Error: El nombre de usuario ya está ocupado.");
        }

        Gimnasio nuevoGimnasio = new Gimnasio();
        nuevoGimnasio.setNombre(request.nombreGimnasio);
        nuevoGimnasio.setDireccion(request.direccion);
        nuevoGimnasio.setEstado("ACTIVO"); // Nace activo

        int meses = (request.mesesLicencia != null && request.mesesLicencia > 0) ? request.mesesLicencia : 1;
        nuevoGimnasio.setFechaVencimiento(LocalDate.now().plusMonths(meses));

        Gimnasio gimnasioGuardado = gimnasioRepository.save(nuevoGimnasio);

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setUsername(request.usernameAdmin);
        nuevoUsuario.setPassword(passwordEncoder.encode(request.passwordAdmin));
        nuevoUsuario.setRol("ADMIN");
        nuevoUsuario.setIdGimnasio(gimnasioGuardado.getIdGimnasio());

        usuarioRepository.save(nuevoUsuario);

        return Map.of("mensaje", "Gimnasio '" + request.nombreGimnasio + "' creado exitosamente.");
    }
    @PutMapping("/gimnasios/{id}/renovar")
    public Map<String, String> renovarLicencia(@PathVariable Integer id, @RequestBody Map<String, Integer> body, Authentication authentication) {
        verificarSuperAdmin(authentication);
        Gimnasio gimnasio = gimnasioRepository.findById(id).orElseThrow(() -> new RuntimeException("Gimnasio no encontrado"));

        int mesesAExtender = body.getOrDefault("meses", 1);

        // Si ya estaba vencido, contamos a partir de hoy. Si le quedaban días, se los sumamos.
        LocalDate fechaBase = (gimnasio.getFechaVencimiento() != null && gimnasio.getFechaVencimiento().isAfter(LocalDate.now()))
                ? gimnasio.getFechaVencimiento()
                : LocalDate.now();

        gimnasio.setFechaVencimiento(fechaBase.plusMonths(mesesAExtender));

        // Si estaba clausurado por falta de pago, lo reactivamos automáticamente
        if("CLAUSURADO".equals(gimnasio.getEstado())) {
            gimnasio.setEstado("ACTIVO");
        }

        gimnasioRepository.save(gimnasio);
        return Map.of("mensaje", "Licencia renovada hasta: " + gimnasio.getFechaVencimiento());
    }
    @PostMapping("/gimnasios/{id}/recordatorio")
    public Map<String, String> enviarRecordatorioPago(@PathVariable Integer id, Authentication authentication) {
        verificarSuperAdmin(authentication);
        // Aquí a futuro implementaremos la API de WhatsApp/SMS
        // Por ahora, simulamos que se envió.
        return Map.of("mensaje", "Aviso de vencimiento enviado al propietario.");
    }

    // 3. CLAUSURAR o REACTIVAR un gimnasio
    @PutMapping("/gimnasios/{id}/estado")
    public Map<String, String> cambiarEstadoGimnasio(@PathVariable Integer id, @RequestBody Map<String, String> body, Authentication authentication) {
        verificarSuperAdmin(authentication);

        Gimnasio gimnasio = gimnasioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gimnasio no encontrado"));

        String nuevoEstado = body.get("estado"); // Recibe "ACTIVO" o "CLAUSURADO"
        gimnasio.setEstado(nuevoEstado);
        gimnasioRepository.save(gimnasio);

        return Map.of("mensaje", "El gimnasio ahora está " + nuevoEstado);
    }

    // --- FUNCIÓN DE SEGURIDAD INTERNA ---
    private void verificarSuperAdmin(Authentication authentication) {
        String usernameLogueado = authentication.getName();
        Usuario usuarioActual = usuarioRepository.findByUsername(usernameLogueado)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!"SUPERADMIN".equals(usuarioActual.getRol())) {
            throw new RuntimeException("Acceso denegado: Exclusivo para el dueño del software.");
        }
    }
}
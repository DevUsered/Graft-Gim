package com.example.backend.controller;

import com.example.backend.model.Asistencia;
import com.example.backend.repository.AsistenciaRepository;
import com.example.backend.service.AsistenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    @Autowired
    private AsistenciaService asistenciaService;

    @GetMapping
    public List<Asistencia> listarAsistencias(){
        return asistenciaService.listarAsistencias();
    }

    @PostMapping
    public Asistencia registrarIngreso(@RequestBody Asistencia asistencia){
        return asistenciaService.registrarIngreso(asistencia);
    }

    @GetMapping("/cliente/{idCliente}")
    public ResponseEntity<List<Asistencia>> obtenerHistorialCliente(@PathVariable Integer idCliente) {
        List<Asistencia> historial = asistenciaService.obtenerHistorialPorCliente(idCliente);
        return ResponseEntity.ok(historial);
    }
}

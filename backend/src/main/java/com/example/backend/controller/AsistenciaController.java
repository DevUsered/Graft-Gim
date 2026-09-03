package com.example.backend.controller;

import com.example.backend.model.Asistencia;
import com.example.backend.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {
    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @GetMapping
    public List<Asistencia> listarAsistencias(){
        return asistenciaRepository.findAll();
    }

    @PostMapping
    public Asistencia registrarIngreso(@RequestBody Asistencia asistencia){
        return asistenciaRepository.save(asistencia);
    }
}

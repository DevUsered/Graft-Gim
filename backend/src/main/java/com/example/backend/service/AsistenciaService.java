package com.example.backend.service;

import com.example.backend.model.Asistencia;
import com.example.backend.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AsistenciaService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    public List<Asistencia> listarAsistencias(){
        return asistenciaRepository.findAll();
    }

    public Asistencia registrarIngreso(Asistencia asistencia){
        return asistenciaRepository.save(asistencia);
    }

    public List<Asistencia> obtenerHistorialPorCliente(Integer idCliente){
        return asistenciaRepository.findByCliente_IdCliente(idCliente);
    }
}

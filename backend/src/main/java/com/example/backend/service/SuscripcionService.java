package com.example.backend.service;

import com.example.backend.model.Membresia;
import com.example.backend.model.Suscripcion;
import com.example.backend.repository.MembresiaRepository;
import com.example.backend.repository.SuscripcionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SuscripcionService {

    @Autowired
    private SuscripcionRepository suscripcionRepository;

    @Autowired
    private MembresiaRepository membresiaRepository;

    public List<Suscripcion> obtenerTodas(){
        return suscripcionRepository.findAll();
    }

    public Suscripcion guardar(Suscripcion suscripcion){
        if(suscripcion.getMembresia() != null && suscripcion.getMembresia().getIdMembresia() != null){
            Integer id = suscripcion.getMembresia().getIdMembresia();
            Membresia membresiaReal = membresiaRepository.findById(id).orElse(null);

            if(membresiaReal != null){
                suscripcion.setMembresia(membresiaReal);

                if(suscripcion.getFechaFin() == null){
                    LocalDate inicio = suscripcion.getFechaInicio();
                    int dias = membresiaReal.getDuracionDias();
                    suscripcion.setFechaFin(inicio.plusDays(dias));
                }
            }
        }
        return suscripcionRepository.save(suscripcion);
    }
    public Suscripcion actualizar(Integer id, Suscripcion detalles){
        Suscripcion existente = suscripcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suscripción no encontrada"));

        if(detalles.getCliente() != null && detalles.getCliente().getIdCliente() != null){
            existente.setCliente(detalles.getCliente());
        }
        if(detalles.getMembresia() != null && detalles.getMembresia().getIdMembresia() != null){
            Membresia membresiaReal = membresiaRepository.findById(detalles.getMembresia().getIdMembresia()).orElse(null);
            if(membresiaReal != null){
                existente.setMembresia(membresiaReal);
                LocalDate inicio = existente.getFechaInicio();
                existente.setFechaFin(inicio.plusDays(membresiaReal.getDuracionDias()));
            }
        }
        if(detalles.getEstado() != null){
            existente.setEstado(detalles.getEstado());
        }
        return suscripcionRepository.save(existente);
    }
    public void eliminar(Integer id){
        suscripcionRepository.deleteById(id);
    }
}

package com.example.backend.service;

import com.example.backend.repository.AsistenciaRepository;
import com.example.backend.repository.ClienteRepository;
import com.example.backend.repository.PagoRepository;
import com.example.backend.repository.SuscripcionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {
    @Autowired
    private ClienteRepository clienteRepository;
    @Autowired
    private SuscripcionRepository suscripcionRepository;
    @Autowired
    private PagoRepository pagoRepository;
    @Autowired
    private AsistenciaRepository asistenciaRepository;

    public Map<String, Object> obtenerMetricasDiarias(){
        Map<String, Object> metricas = new HashMap<>();
        LocalDate hoy = LocalDate.now();

        long totalClientes = clienteRepository.count();

        double ingresosHoy = pagoRepository.findAll().stream()
                .filter(p -> p.getFechaHora() != null && p.getFechaHora().toLocalDate().isEqual(hoy))
                .mapToDouble(p -> p.getMonto().doubleValue())
                .sum();
        long clientesActivos = suscripcionRepository.findAll().stream()
                .filter(s -> "VIGENTE".equals(s.getEstado()) && !s.getFechaFin().isBefore(hoy))
                .count();
        long asistenciasHoy = asistenciaRepository.findAll().stream()
                .filter(a -> a.getFechaHora() != null && a.getFechaHora().toLocalDate().isEqual(hoy))
                .count();
        metricas.put("totalClientes", totalClientes);
        metricas.put("ingresosHoy", ingresosHoy);
        metricas.put("clientesActivos", clientesActivos);
        metricas.put("asistenciasHoy", asistenciasHoy);

        return metricas;
    }
}

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

        long totalClientes = clienteRepository.count();

        double ingresosHoy = pagoRepository.sumarTotalHoy();

        long clientesActivos = suscripcionRepository.contarSuscripcionesActivas();
        long asistenciasHoy = asistenciaRepository.contarAsistenciasHoy();
        metricas.put("totalClientes", totalClientes);
        metricas.put("ingresosHoy", ingresosHoy);
        metricas.put("clientesActivos", clientesActivos);
        metricas.put("asistenciasHoy", asistenciasHoy);

        return metricas;
    }
}

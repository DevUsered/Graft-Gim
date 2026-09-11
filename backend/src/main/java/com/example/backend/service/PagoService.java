package com.example.backend.service;

import com.example.backend.model.Pago;
import com.example.backend.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    public Map<String, Object> obtenerResumenFinanzas(){
        LocalDate hoy = LocalDate.now();
        List<Pago> pagos = pagoRepository.findAll();

        pagos.sort((p1, p2) -> p2.getFechaHora().compareTo(p1.getFechaHora()));
        double totalHistorico = pagos.stream()
                .mapToDouble(p -> p.getMonto().doubleValue())
                .sum();

        double totalHoy = pagos.stream()
                .filter(p -> p.getFechaHora() != null && p.getFechaHora().toLocalDate().isEqual(hoy))
                .mapToDouble(p -> p.getMonto().doubleValue())
                .sum();

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("listaPagos", pagos);
        respuesta.put("totalHistorico", totalHistorico);
        respuesta.put("totalHoy", totalHoy);

        return respuesta;
    }
    public Pago guardarPago(Pago pago){
        return pagoRepository.save(pago);
    }
    public List<Pago> listarPagos(){
        return pagoRepository.findAll();
    }
}

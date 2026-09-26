package com.example.backend.service;

import com.example.backend.model.Pago;
import com.example.backend.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
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
        Map<String, Object> respuesta = new HashMap<>();

        double totalHistorico = pagoRepository.sumarTotalHistorico();
        double totalHoy = pagoRepository.sumarTotalHoy();

        List<Pago> pagos = pagoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaHora"));

        respuesta.put("listaPagos", pagos);
        respuesta.put("totalHistorico", totalHistorico);
        respuesta.put("totalHoy", totalHoy);

        return respuesta;
    }
    public Pago guardarPago(Pago pago){
        return pagoRepository.save(pago);
    }
    public List<Pago> listarPagos(){

        return pagoRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaHora"));
    }
}

package com.example.backend.repository;

import com.example.backend.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    //Poner métodos para ver pagos por fechas
}

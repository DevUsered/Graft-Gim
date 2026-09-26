package com.example.backend.repository;

import com.example.backend.model.Pago;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {
    List<Pago> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p")
    Double sumarTotalHistorico();

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE CAST(p.fechaHora AS date) = CURRENT_DATE")
    Double sumarTotalHoy();

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM Pago p WHERE p.fechaHora BETWEEN :inicio AND :fin")
    Double sumarTotalPorFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}

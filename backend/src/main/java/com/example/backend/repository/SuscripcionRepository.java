package com.example.backend.repository;

import com.example.backend.model.Suscripcion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuscripcionRepository extends JpaRepository<Suscripcion, Integer> {
    @EntityGraph(attributePaths = {"cliente","membresia"})
    Optional<Suscripcion> findFirstByCliente_IdClienteAndEstadoOrderByFechaFinDesc(Integer idCliente, String estado);

    @EntityGraph(attributePaths = {"cliente","membresia"})
    List<Suscripcion> findAll();

    @Query("SELECT COUNT(s) FROM Suscripcion s WHERE s.estado = 'VIGENTE' AND s.fechaFin >= CURRENT_DATE")
    Long contarSuscripcionesActivas();
}

package com.example.backend.repository;

import com.example.backend.model.Asistencia;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Integer> {
    @EntityGraph(attributePaths = {"cliente"})
    List<Asistencia> findByCliente_IdCliente(Integer idCliente);

    @EntityGraph(attributePaths = {"cliente"})
    List<Asistencia> findAll();

    @Query("SELECT COUNT(a) FROM Asistencia a WHERE CAST(a.fechaHora AS date) = CURRENT_DATE")
    Long contarAsistenciasHoy();
}

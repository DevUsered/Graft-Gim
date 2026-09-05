package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cliente")
public class Cliente extends TenantEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Integer idCliente;

    @Column(name = "carnet_identidad", unique = true, nullable = false, length = 20)
    private String carnetIdentidad;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Column(name = "estado", length = 20)
    private String estado;

    // --- CONSTRUCTOR POR DEFECTO ---
    // Esto hace que cuando creemos un cliente nuevo en Java,
    // automáticamente se le asigne la fecha de hoy y el estado ACTIVO.
    public Cliente() {
        this.fechaRegistro = LocalDate.now();
        this.estado = "ACTIVO";
    }

    // --- GETTERS Y SETTERS ---
    // (Sirven para leer y modificar los datos de forma segura)

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    public String getCarnetIdentidad() { return carnetIdentidad; }
    public void setCarnetIdentidad(String carnetIdentidad) { this.carnetIdentidad = carnetIdentidad; }

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}
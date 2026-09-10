package com.example.backend.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "gimnasios")
public class Gimnasio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gimnasio")
    private Integer idGimnasio;

    @Column(nullable = false)
    private String nombre;

    private String direccion;

    @Column(nullable = false)
    private String estado = "ACTIVO";

    @Column(name = "fecha_vencimiento")
    private LocalDate fechaVencimiento;

    public LocalDate getFechaVencimiento() {
        return fechaVencimiento;
    }

    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public Integer getIdGimnasio() {
        return idGimnasio;
    }

    public void setIdGimnasio(Integer idGimnasio) {
        this.idGimnasio = idGimnasio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

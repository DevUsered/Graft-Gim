package com.example.backend.dto;

import java.util.Map;

public class VentaRequest {
    private boolean incluyePaseLibre;
    private Integer idCliente;
    private Map<Integer, Integer> carritoProductos;

    public boolean isIncluyePaseLibre() {
        return incluyePaseLibre;
    }

    public void setIncluyePaseLibre(boolean incluyePaseLibre) {
        this.incluyePaseLibre = incluyePaseLibre;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public Map<Integer, Integer> getCarritoProductos() {
        return carritoProductos;
    }

    public void setCarritoProductos(Map<Integer, Integer> carritoProductos) {
        this.carritoProductos = carritoProductos;
    }
}

package com.example.backend.service;

import com.example.backend.dto.VentaRequest;
import com.example.backend.model.Asistencia;
import com.example.backend.model.Cliente;
import com.example.backend.model.Pago;
import com.example.backend.model.Producto;
import com.example.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class RecepcionService {

    @Autowired
    private ProductoService productoService;
    @Autowired
    private PagoService pagoService;
    @Autowired
    private AsistenciaService asistenciaService;
    @Autowired
    private ClienteService clienteService;

    @Transactional
    public void procesarCobroRecepcion(VentaRequest request){
        BigDecimal totalCobrar = BigDecimal.ZERO;
        StringBuilder conceptoPago = new StringBuilder("Venta Recepción: ");
        if(request.getCarritoProductos() != null && !request.getCarritoProductos().isEmpty()){
            for(Map.Entry<Integer, Integer> item : request.getCarritoProductos().entrySet()){
                Integer idProducto = item.getKey();
                Integer cantidadCompra = item.getValue();

                Producto producto = productoService.buscarPorId(idProducto);
                if(producto.getStock() < cantidadCompra){
                    throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre() + ". Quedan " + producto.getStock() + " unidades.");
                }
                producto.setStock(producto.getStock() - cantidadCompra);
                productoService.guardarProducto(producto);

                BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(cantidadCompra));
                totalCobrar = totalCobrar.add(subtotal);
                conceptoPago.append(producto.getNombre()).append(" (x").append(cantidadCompra).append("), ");
            }
            if(totalCobrar.compareTo(BigDecimal.ZERO) > 0){
                String descripcionFinal = conceptoPago.toString();
                if(descripcionFinal.endsWith(", ")){
                    descripcionFinal = descripcionFinal.substring(0, descripcionFinal.length() - 2);
                }
                Pago nuevoPago = new Pago();
                nuevoPago.setMonto(totalCobrar);
                nuevoPago.setConcepto(descripcionFinal);
                nuevoPago.setFechaHora(LocalDateTime.now());

                pagoService.guardarPago(nuevoPago);
            }
            if(request.getIdCliente() != null){
                Cliente cliente = clienteService.buscarPorId(request.getIdCliente());
                Asistencia asistencia = new Asistencia();
                asistencia.setCliente(cliente);
                asistencia.setFechaHora(LocalDateTime.now());
                asistenciaService.registrarIngreso(asistencia);
            }
        }
        if(request.isIncluyePaseLibre()){
            System.out.println("Incluye pase libre");
        }
        if(request.getIdCliente() != null){
            System.out.println("Cliente: " + request.getIdCliente());
        }
    }
}

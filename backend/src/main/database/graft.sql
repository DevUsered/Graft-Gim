CREATE TABLE membresia (
    id_membresia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    duracion_dias INTEGER NOT NULL,
    descripcion VARCHAR(255)
);
INSERT INTO membresia (nombre, precio, duracion_dias, descripcion) VALUES
    ('Plan Estudiante', 150.00, 30, 'Acceso a pesas de 8am a 4pm con carnet universitario'),
    ('Plan Mensual Ilimitado', 200.00, 30, 'Acceso libre a todas las áreas del gimnasio'),
    ('Plan Trimestral', 550.00, 90, 'Acceso libre con descuento por pago adelantado');
CREATE TABLE cliente (
                         id_cliente SERIAL PRIMARY KEY,
                         carnet_identidad VARCHAR(20) UNIQUE NOT NULL,
                         nombre_completo VARCHAR(150) NOT NULL,
                         telefono VARCHAR(15),
                         fecha_registro DATE DEFAULT CURRENT_DATE,
                         estado VARCHAR(20) DEFAULT 'ACTIVO'
    -- Estado puede ser: 'ACTIVO', 'INACTIVO'
);
CREATE TABLE suscripcion (
                             id_suscripcion SERIAL PRIMARY KEY,
                             id_cliente INTEGER NOT NULL,
                             id_membresia INTEGER NOT NULL,
                             fecha_inicio DATE NOT NULL,
                             fecha_fin DATE NOT NULL,
                             estado VARCHAR(20) DEFAULT 'VIGENTE',
    -- Estado puede ser: 'VIGENTE', 'VENCIDA', 'CANCELADA'

    -- Relaciones:
                             FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE,
                             FOREIGN KEY (id_membresia) REFERENCES membresia(id_membresia) ON DELETE RESTRICT
);
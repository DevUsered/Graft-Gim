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

CREATE TABLE asistencia(
    id_asistencia SERIAL PRIMARY KEY ,
    id_cliente INT NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    CONSTRAINT fk_asistencia_cliente
                       FOREIGN KEY (id_cliente)
                       REFERENCES cliente(id_cliente)
                       ON DELETE CASCADE
);
INSERT INTO cliente (carnet_identidad, nombre_completo)
VALUES (0, 'Cliente Casual');

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY ,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);
INSERT INTO usuarios (username, password, rol)
VALUES ('edgar', '$2a$10$D.pB49U6/L8r9Z8z5T7z.O1/X34m9t61.P79O.g14/Q8q5X.T5/4q', 'ADMIN');

CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY ,
    monto DECIMAL(10, 2) NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL
);
CREATE TABLE gimnacios(
    id_gimnacio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO gimnacios(nombre, direccion)
VALUES('Graft Gym', 'Cochabamba, Bolivia');

ALTER TABLE usuarios ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);
ALTER TABLE cliente ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);
ALTER TABLE membresia ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);
ALTER TABLE suscripcion ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);
ALTER TABLE asistencia ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);
ALTER TABLE pago ADD COLUMN id_gimnasio INTEGER DEFAULT 1 REFERENCES gimnasios(id_gimnasio);

ALTER TABLE gimnacios RENAME TO gimnasios;
ALTER TABLE gimnasios RENAME COLUMN id_gimnacio TO id_gimnasio;
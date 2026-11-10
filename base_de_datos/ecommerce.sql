-- Base de datos del ecommerce
DROP DATABASE IF EXISTS ecommerce;
CREATE DATABASE ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- Tabla de usuarios del sistema (para el login)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(30) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    rol ENUM('admin', 'empleado') NOT NULL DEFAULT 'empleado'
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NOT NULL,
    CONSTRAINT chk_precio CHECK (precio > 0),
    CONSTRAINT chk_stock CHECK (stock >= 0),
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150)
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'pagado', 'enviado', 'entregado') NOT NULL DEFAULT 'pendiente',
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id)
        REFERENCES clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detalle_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT chk_cantidad CHECK (cantidad > 0),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id)
        REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Procedimiento almacenado para crear un pedido completo.
-- Recibe el cliente y los productos en formato JSON, por ejemplo:
-- [{"producto_id": 1, "cantidad": 2}, {"producto_id": 3, "cantidad": 1}]
-- Si algo falla (cliente inexistente, falta de stock, etc.) se hace ROLLBACK.
DELIMITER $$

CREATE PROCEDURE sp_crear_pedido(IN p_cliente_id INT, IN p_items JSON)
BEGIN
    DECLARE v_pedido_id INT;
    DECLARE v_total DECIMAL(12,2) DEFAULT 0;
    DECLARE v_cantidad_items INT;
    DECLARE i INT DEFAULT 0;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_nombre VARCHAR(100);
    DECLARE v_precio DECIMAL(10,2);
    DECLARE v_stock INT;
    DECLARE v_existe INT;
    DECLARE v_mensaje VARCHAR(200);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_existe FROM clientes WHERE id = p_cliente_id;
    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El cliente no existe';
    END IF;

    SET v_cantidad_items = JSON_LENGTH(p_items);
    IF v_cantidad_items IS NULL OR v_cantidad_items = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no tiene productos';
    END IF;

    INSERT INTO pedidos (cliente_id) VALUES (p_cliente_id);
    SET v_pedido_id = LAST_INSERT_ID();

    WHILE i < v_cantidad_items DO
        SET v_producto_id = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].producto_id')));
        SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].cantidad')));

        SET v_precio = NULL;
        SELECT nombre, precio, stock INTO v_nombre, v_precio, v_stock
        FROM productos WHERE id = v_producto_id FOR UPDATE;

        IF v_precio IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Uno de los productos no existe';
        END IF;

        IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cantidad debe ser mayor a 0';
        END IF;

        IF v_stock < v_cantidad THEN
            SET v_mensaje = CONCAT('Stock insuficiente para el producto: ', v_nombre);
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_mensaje;
        END IF;

        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (v_pedido_id, v_producto_id, v_cantidad, v_precio);

        UPDATE productos SET stock = stock - v_cantidad WHERE id = v_producto_id;

        SET v_total = v_total + (v_precio * v_cantidad);
        SET i = i + 1;
    END WHILE;

    UPDATE pedidos SET total = v_total WHERE id = v_pedido_id;

    COMMIT;

    SELECT v_pedido_id AS pedido_id;
END$$

DELIMITER ;

-- Datos de prueba
-- Usuario admin: admin / admin123
INSERT INTO usuarios (nombre_usuario, password_hash, rol) VALUES
('admin', 'a3f1c9d27b5e48601d2c9e7f4b8a1c03$ab2c27d96f438615511f74ee335e4a5af56e2e5d72e7c066a21fce67eac13eab', 'admin');

INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos y accesorios electrónicos'),
('Hogar', 'Artículos para el hogar'),
('Indumentaria', 'Ropa y calzado'),
('Deportes', 'Artículos deportivos');

INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id) VALUES
('Auriculares Bluetooth', 'Auriculares inalámbricos con micrófono', 25000.00, 20, 1),
('Cargador USB-C', 'Cargador rápido de 20W', 9500.00, 35, 1),
('Mouse inalámbrico', 'Mouse óptico con receptor USB', 12000.00, 15, 1),
('Lámpara de escritorio', 'Lámpara LED con brazo flexible', 15000.00, 10, 2),
('Juego de sábanas', 'Sábanas de algodón 2 plazas', 32000.00, 8, 2),
('Remera básica', 'Remera de algodón talle M', 8000.00, 40, 3),
('Zapatillas urbanas', 'Zapatillas de lona', 45000.00, 12, 3),
('Pelota de fútbol', 'Pelota número 5', 18000.00, 4, 4),
('Botella deportiva', 'Botella de 750 ml', 6000.00, 30, 4),
('Soga de saltar', 'Soga con mango antideslizante', 4500.00, 25, 4);

INSERT INTO clientes (nombre, apellido, email, telefono, direccion) VALUES
('Juan', 'Pérez', 'juan.perez@mail.com', '3804111111', 'San Martín 123'),
('María', 'Gómez', 'maria.gomez@mail.com', '3804222222', 'Belgrano 456'),
('Lucas', 'Díaz', 'lucas.diaz@mail.com', '3804333333', 'Rivadavia 789'),
('Ana', 'Torres', 'ana.torres@mail.com', NULL, 'Mitre 321');

-- Pedidos de ejemplo (usan el procedimiento almacenado)
CALL sp_crear_pedido(1, '[{"producto_id": 1, "cantidad": 1}, {"producto_id": 2, "cantidad": 2}]');
CALL sp_crear_pedido(2, '[{"producto_id": 6, "cantidad": 3}, {"producto_id": 7, "cantidad": 1}]');
CALL sp_crear_pedido(1, '[{"producto_id": 9, "cantidad": 2}]');
CALL sp_crear_pedido(3, '[{"producto_id": 4, "cantidad": 1}, {"producto_id": 3, "cantidad": 1}]');

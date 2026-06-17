import pg from 'pg';
import { env } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: env.databaseUrl
});

export const obtenerResumenVentas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT id) as total_pedidos,
        COUNT(DISTINCT usuario_id) as total_clientes,
        SUM(total) as total_ventas,
        AVG(total) as ticket_promedio,
        COUNT(CASE WHEN estado = 'ENTREGADO' THEN 1 END) as pedidos_entregados,
        COUNT(CASE WHEN estado = 'CANCELADO' THEN 1 END) as pedidos_cancelados
      FROM pedidos
      WHERE creado_en >= CURRENT_DATE - INTERVAL '30 days'
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en obtenerResumenVentas:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerProductosMasVendidos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.nombre,
        p.categoria_id,
        c.nombre as categoria,
        SUM(pd.cantidad) as cantidad_vendida,
        SUM(pd.cantidad * pd.precio_unitario) as ingresos
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN pedidos pe ON pd.pedido_id = pe.id
      WHERE pe.creado_en >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY p.id, p.nombre, p.categoria_id, c.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerProductosMasVendidos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerEstadoPedidos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM pedidos
      WHERE creado_en >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY estado
      ORDER BY cantidad DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerEstadoPedidos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerVentasPorDia = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(creado_en) as fecha,
        COUNT(*) as cantidad_pedidos,
        SUM(total) as total_ventas,
        COUNT(DISTINCT usuario_id) as clientes
      FROM pedidos
      WHERE creado_en >= CURRENT_DATE - INTERVAL '30 days'
      AND estado != 'CANCELADO'
      GROUP BY DATE(creado_en)
      ORDER BY fecha DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerVentasPorDia:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerVentasPorCategoria = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.nombre as categoria,
        SUM(pd.cantidad) as cantidad,
        SUM(pd.cantidad * pd.precio_unitario) as ingresos
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN pedidos pe ON pd.pedido_id = pe.id
      WHERE pe.creado_en >= CURRENT_DATE - INTERVAL '30 days'
      AND pe.estado != 'CANCELADO'
      GROUP BY c.id, c.nombre
      ORDER BY ingresos DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerVentasPorCategoria:', error);
    res.status(500).json({ error: error.message });
  }
};

export const obtenerCuponesPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        cupon_codigo as codigo,
        COUNT(*) as cantidad_usados,
        SUM(total) as ingresos,
        AVG(total) as ticket_promedio
      FROM pedidos
      WHERE cupon_codigo IS NOT NULL
      AND creado_en >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY cupon_codigo
      ORDER BY cantidad_usados DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error en obtenerCuponesPerformance:', error);
    res.status(500).json({ error: error.message });
  }
};

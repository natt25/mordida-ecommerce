import pg from 'pg';
import { env } from '../config/env.js';

const pool = new pg.Pool({
  connectionString: env.databaseUrl
});

export const obtenerProductos = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        c.nombre as categoria,
        p.disponible
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
      ORDER BY c.nombre, p.nombre
      LIMIT 30
    `);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

export const obtenerCuponesActivos = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        codigo,
        descripcion,
        descuento_porcentaje,
        vence_en
      FROM cupones
      WHERE activo = TRUE
      AND (vence_en IS NULL OR vence_en >= CURRENT_DATE)
      ORDER BY descuento_porcentaje DESC
      LIMIT 10
    `);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return [];
  }
};

export const obtenerPedidoUsuario = async (usuarioId) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.estado,
        p.total,
        p.creado_en,
        p.direccion_entrega
      FROM pedidos p
      WHERE p.usuario_id = $1
      ORDER BY p.creado_en DESC
      LIMIT 5
    `, [usuarioId]);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error);
    return [];
  }
};

export const buscarProductosPorNombre = async (nombre) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        c.nombre as categoria,
        p.disponible
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
      AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1)
      ORDER BY p.nombre
      LIMIT 10
    `, [`%${nombre}%`]);
    return result.rows;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    return [];
  }
};

export const obtenerCategorias = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        c.nombre,
        COUNT(p.id) as cantidad_productos
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.disponible = TRUE
      GROUP BY c.id, c.nombre
      HAVING COUNT(p.id) > 0
      ORDER BY c.nombre
    `);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

export const obtenerProductosDestacados = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        c.nombre as categoria
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.disponible = TRUE
      AND p.destacado = TRUE
      ORDER BY p.nombre
      LIMIT 10
    `);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    return [];
  }
};

export const construirContextoMordida = async () => {
  const [productos, cupones, categorias, destacados] = await Promise.all([
    obtenerProductos(),
    obtenerCuponesActivos(),
    obtenerCategorias(),
    obtenerProductosDestacados()
  ]);

  let contexto = `

=== INFORMACIÓN DE MORDIDA E-COMMERCE ===

CATEGORÍAS DISPONIBLES:
${categorias.map(c => `- ${c.nombre} (${c.cantidad_productos} productos)`).join('\n')}

PRODUCTOS DESTACADOS:
${destacados.length > 0 
  ? destacados.map(p => `- ${p.nombre} (${p.categoria}): S/. ${p.precio}`).join('\n')
  : 'Ninguno en este momento'
}

CUPONES ACTIVOS:
${cupones.length > 0
  ? cupones.map(c => `- Código: ${c.codigo} | Descuento: ${c.descuento_porcentaje}% | ${c.descripcion}`).join('\n')
  : 'No hay cupones activos en este momento'
}

TODOS LOS PRODUCTOS DISPONIBLES:
${productos.map(p => `- ${p.nombre} (${p.categoria}): S/. ${p.precio} - ${p.descripcion}`).join('\n')}
`;

  return contexto;
};
